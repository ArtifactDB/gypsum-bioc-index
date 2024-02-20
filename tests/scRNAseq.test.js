import schema from "../schemas/scRNAseq.json";
import Ajv from "ajv";

test("scRNAseq schema behaves as expected", () => {
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
        nrow: 20,
        ncol: 10,
        assay_names: [ "counts", "logcounts" ],
        reduced_dimension_names: [ "UMAP", "TSNE", "PCA" ],
        alternative_experiment_names: [ "ERCC", "ADT" ]
    };
    validate(obj);

    delete obj.nrow; 
    expect(() => validate(obj)).toThrow("nrow");
    obj.nrow = "ASdasd";
    expect(() => validate(obj)).toThrow("integer");
    obj.nrow = 10;

    delete obj.ncol;
    expect(() => validate(obj)).toThrow("ncol");
    obj.ncol = "asdasd";
    expect(() => validate(obj)).toThrow("integer");
    obj.ncol = 20;

    delete obj.assay_names;
    validate(obj);
    obj.assay_names = 2;
    expect(() => validate(obj)).toThrow("array");
    obj.assay_names = [1];
    expect(() => validate(obj)).toThrow("string");
    obj.assay_names = [ "asdasd" ];

    delete obj.reduced_dimension_names;
    validate(obj);
    obj.reduced_dimension_names = 2;
    expect(() => validate(obj)).toThrow("array");
    obj.reduced_dimension_names = [1];
    expect(() => validate(obj)).toThrow("string");
    obj.reduced_dimension_names = [ "asdasd" ];

    delete obj.alternative_experiment_names;
    validate(obj);
    obj.alternative_experiment_names = 2;
    expect(() => validate(obj)).toThrow("array");
    obj.alternative_experiment_names = [1];
    expect(() => validate(obj)).toThrow("string");
    obj.alternative_experiment_names = [ "asdasd" ];
})
