import schema from "../../merged/bioconductor/v1.json";
import Ajv from "ajv";

test("Bioconductor schema behaves as expected", () => {
    const ajv = new Ajv();
    ajv.addKeyword("_attributes");
    let validator = ajv.compile(schema);
    function validate(x) {
        if (!validator(x)) {
            throw new Error(validator.errors[0].message);
        }
    }

    expect(() => validate([])).toThrow("object");

    let obj = {
        title: "asdasd",
        description: "FOOBAR",
        bioconductor_version: "4.10",
        taxonomy_id: [ "9606" ],
        genome: [ "GRCm38" ],
        sources: [
            { provider: "GEO", id: "GSE12345" },
            { provider: "GEO", id: "GSM12345" },
            { provider: "SRA", id: "SRP12345" },
            { provider: "SRA", id: "SRR12345" },
            { provider: "ArrayExpress", id: "E-MTAB-12345" },
            { provider: "PubMed", id: "12332423" },
            { provider: "DOI", id: "123.13/231.23" },
            { provider: "ExperimentHub", id: "EH12345" },
            { provider: "other", id: "https://123213.com" }
        ],
        maintainer_name: "Aaron Lun",
        maintainer_email: "aaron@aaron.com",
        applications: {
            takane: {
                type: "single_cell_experiment",
                summarized_experiment: {
                    rows: 20,
                    columns: 10,
                    assays: [ "counts", "logcounts" ]
                },
                single_cell_experiment: {
                    reduced_dimensions: [ "UMAP", "TSNE", "PCA" ],
                    alternative_experiments: [ "ERCC", "ADT" ]
                }
            }
        }
    };
    validate(obj);

    // Testing Bioconductor core:
    delete obj.title; 
    expect(() => validate(obj)).toThrow("title");
    obj.title = 2;
    expect(() => validate(obj)).toThrow("string");
    obj.title = "sdasdA";

    delete obj.description;
    expect(() => validate(obj)).toThrow("description");
    obj.description = 2;
    expect(() => validate(obj)).toThrow("string");
    obj.description = "asda";

    delete obj.bioconductor_version;
    expect(() => validate(obj)).toThrow("bioconductor_version");
    obj.bioconductor_version = 2;
    expect(() => validate(obj)).toThrow("string");
    obj.bioconductor_version = "FOOBAR";
    expect(() => validate(obj)).toThrow("must match");
    obj.bioconductor_version = "4.10";

    delete obj.taxonomy_id;
    expect(() => validate(obj)).toThrow("taxonomy_id");
    obj.taxonomy_id = "9606";
    expect(() => validate(obj)).toThrow("array");
    obj.taxonomy_id = [ "urmom" ];
    expect(() => validate(obj)).toThrow("must match pattern");
    obj.taxonomy_id = [ "9606", "9606" ];
    expect(() => validate(obj)).toThrow("duplicate");
    obj.taxonomy_id = [ "9606" ];

    delete obj.genome;
    expect(() => validate(obj)).toThrow("genome");
    obj.genome = "GRCh38";
    expect(() => validate(obj)).toThrow("array");
    obj.genome = [ "foo" ];
    expect(() => validate(obj)).toThrow("one of");
    obj.genome = [ "GRCm38", "GRCm38" ];
    expect(() => validate(obj)).toThrow("duplicate");
    obj.genome = [ "GRCm38" ];

    delete obj.sources;
    expect(() => validate(obj)).toThrow("source");
    obj.sources = 2;
    expect(() => validate(obj)).toThrow("array");
    obj.sources = [];
    expect(() => validate(obj)).toThrow("fewer");
    obj.sources = [{ provider: 2, id: "123123" }];
    expect(() => validate(obj)).toThrow("string");
    obj.sources = [{ provider: "GEO" }];
    expect(() => validate(obj)).toThrow("id");
    obj.sources = [{ provider: "GEO", id: 5 }];
    expect(() => validate(obj)).toThrow("string");

    obj.sources = [{ provider: "GEO", id: "foo" }];
    expect(() => validate(obj)).toThrow("pattern");
    obj.sources = [{ provider: "SRA", id: "foo" }];
    expect(() => validate(obj)).toThrow("pattern");
    obj.sources = [{ provider: "ArrayExpress", id: "foo" }];
    expect(() => validate(obj)).toThrow("pattern");
    obj.sources = [{ provider: "PubMed", id: "foo" }];
    expect(() => validate(obj)).toThrow("pattern");
    obj.sources = [{ provider: "ExperimentHub", id: "foo" }];
    expect(() => validate(obj)).toThrow("pattern");
    obj.sources = [{ provider: "DOI", id: "foo" }];
    expect(() => validate(obj)).toThrow("pattern");
    obj.sources = [{ provider: "other", id: "foo" }];
    expect(() => validate(obj)).toThrow("pattern");
    obj.sources = [{ provider: "random", id: "123123" }];
    expect(() => validate(obj)).toThrow("one of");
    obj.sources = [{ provider: "ArrayExpress", id: "E-MTAB-12313" }];

    delete obj.maintainer_name;
    expect(() => validate(obj)).toThrow("maintainer_name");
    obj.maintainer_name = 2;
    expect(() => validate(obj)).toThrow("string");
    obj.maintainer_name = " A B"
    expect(() => validate(obj)).toThrow("pattern");
    obj.maintainer_name = "A  B"
    expect(() => validate(obj)).toThrow("pattern");
    obj.maintainer_name = "Aararon"
    expect(() => validate(obj)).toThrow("pattern");
    obj.maintainer_name = "Aaron Lun"

    delete obj.maintainer_email;
    expect(() => validate(obj)).toThrow("maintainer_email");
    obj.maintainer_email = "foo@barcom";
    expect(() => validate(obj)).toThrow("pattern");
    obj.maintainer_email = "foobar.ccom";
    expect(() => validate(obj)).toThrow("pattern");
    obj.maintainer_email = "foobar@c.com";

    // Testing the takane SCE requirements.
    delete obj.applications.takane.summarized_experiment.rows; 
    expect(() => validate(obj)).toThrow("rows");
    obj.applications.takane.summarized_experiment.rows = "ASdasd";
    expect(() => validate(obj)).toThrow("integer");
    obj.applications.takane.summarized_experiment.rows = 10;

    delete obj.applications.takane.summarized_experiment.columns;
    expect(() => validate(obj)).toThrow("columns");
    obj.applications.takane.summarized_experiment.columns = "asdasd";
    expect(() => validate(obj)).toThrow("integer");
    obj.applications.takane.summarized_experiment.columns = 20;

    delete obj.applications.takane.summarized_experiment.assays;
    validate(obj);
    obj.applications.takane.summarized_experiment.assays = 2;
    expect(() => validate(obj)).toThrow("array");
    obj.applications.takane.summarized_experiment.assays = [1];
    expect(() => validate(obj)).toThrow("string");
    obj.applications.takane.summarized_experiment.assays = [ "asdasd" ];

    delete obj.applications.takane.single_cell_experiment.reduced_dimensions;
    validate(obj);
    obj.applications.takane.single_cell_experiment.reduced_dimensions = 2;
    expect(() => validate(obj)).toThrow("array");
    obj.applications.takane.single_cell_experiment.reduced_dimensions = [1];
    expect(() => validate(obj)).toThrow("string");
    obj.applications.takane.single_cell_experiment.reduced_dimensions = [ "asdasd" ];

    delete obj.applications.takane.single_cell_experiment.alternative_experiments;
    validate(obj);
    obj.applications.takane.single_cell_experiment.alternative_experiments = 2;
    expect(() => validate(obj)).toThrow("array");
    obj.applications.takane.single_cell_experiment.alternative_experiments = [1];
    expect(() => validate(obj)).toThrow("string");
    obj.applications.takane.single_cell_experiment.alternative_experiments = [ "asdasd" ];
})
