import * as gbi from "../src/index.js";

export async function indexVersion(project, asset, version, validators, converters) {
    let listing = await gbi.listVersionFiles(project, asset, version);
    let output = {};

    // BIOCONDUCTOR indexing section:
    let bioc_paths = [];
    let bioc_meta = [];
    let bioc_objects = [];

    {
        let candidates = {};
        for (const x of listing) {
            let i = x.lastIndexOf("/");
            let base = x.slice(i + 1);
            let dir = x.slice(0, i);

            let is_bioc = (base == "_bioconductor.json");
            let is_obj = (base == "OBJECT");
            if (is_bioc || is_obj) {
                if (!(dir in candidates)) {
                    candidates[dir] = { bioconductor: is_bioc, object: is_obj };
                } else {
                    let current = candidates[dir];
                    if (is_bioc) {
                        current.bioconductor = true;
                    } else if (is_obj) {
                        current.object = true;
                    }
                }
            }
        }

        let meta_contents = [];
        let obj_contents = [];
        for (const [k, v] of Object.entries(candidates)) {
            if (!(v.bioconductor) || !(v.object)) {
                continue;
            }
            bioc_paths.push(k);
            meta_contents.push(gbi.fetchJson(k + "/_bioconductor.json"));
            obj_contents.push(gbi.fetchJson(k + "/OBJECT"));
       }

        bioc_meta = await Promise.all(meta_contents);
        bioc_objects = await Promise.all(obj_contents);

        let statements = [];
        let converter = converters["bioconductor"];
        let validator = validators["bioconductor"];

        for (var i = 0; i < bioc_meta.length; i++) {
            let bp = bioc_paths[i];
            let bm = bioc_meta[i];

            try {
                validator(bioc_meta[i]);
            } catch (e) {
                throw new Error("failed to validate metadata at '" + bp + "'; " + e.message);
            }

            let converted = converter(project, asset, version, bp, bioc_objects[i].type, bm);
            for (const x of converted) {
                statements.push(x);
            }
        }

        output["bioconductor"] = statements;
    }

    // scRNAseq indexing section:
    if (project == "scRNAseq") {
        let se_paths = [];
        let altexp_names = [];
        let reddim_names = [];
        let assay_names = [];

        for (var i = 0; i < bioc_meta.length; i++) {
            let obj_type = bioc_objects[i].type;
            if (obj_type.endsWith("_experiment")) {
                let bpath = bioc_paths[i];
                se_paths.push(bpath);
                reddim_names.push(gbi.fetchJson(bpath + "/reduced_dimensions/names.json", { mustWork: false }));
                altexp_names.push(gbi.fetchJson(bpath + "/alternative_experiments/names.json", { mustWork: false }));
                assay_names.push(gbi.fetchJson(bpath + "/assays/names.json", { mustWork: false }));
            }
        }

        altexp_names = await Promise.all(altexp_names);
        reddim_names = await Promise.all(reddim_names);
        assay_names = await Promise.all(assay_names);

        let converter = converters["scRNAseq"];
        let statements = [];
        for (var i = 0; i < se_paths.length; i++) {
            let meta = {};
            if (assay_names[i] !== null) {
                meta.assays = assay_names[i];
            }
            if (reddim_names[i] !== null) {
                meta.reduced_dimensions = reddim_names[i];
            }
            if (altexp_names[i] !== null) {
                meta.alternative_experiments = altexp_names[i];
            }
            let converted = converter(project, asset, version, bioc_paths[i], bioc_objects[i].type, meta);
            for (const x of converted) {
                statements.push(x);
            }
        }

        output["scRNAseq"] = statements;
    }

    return output;
}
