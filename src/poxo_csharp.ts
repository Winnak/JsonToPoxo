/**
 * Converts Json to C#
 */

/**
 * Options for the CSharp converter.
 */
interface CSharpConverterOptions extends ConverterOptions {
    namespace: string,

    /**
     * Either properties or fields
     */
    useProperties: boolean,

    /**
     * e.g. "double", "float", "decimal"
     */
    floatType: string,

    /**
     * e.g. "[JsonProperty(\"`${key}`\")]"
     */
    jsonProperty: (key: string) => null | string
}


/**
 * Creates default options for CSharp converter.
 * See convertToCSharp(Object|Object[], CSharpConverterOptions)
 */
function createDefaultCSharpOptions(): CSharpConverterOptions {
    return <CSharpConverterOptions> {
        varNameConversion: s => pascalCase(sanitizeVariableName(s), false),
        indentation: "    ",
        useProperties: true,
        namespace: "YourNamespace",
        floatType: "double",
        jsonProperty: key => `[JsonProperty("${key}")]`
    };
}

/**
 * Converts a JSON object into CSharp code.
 * @param json
 * @param options
 */
function convertToCSharp(json: Object | Object[], options?: CSharpConverterOptions): string {
    if (options == undefined || options == null) {
        options = createDefaultCSharpOptions();
    }

    if (Array.isArray(json)) {
        if (json.length == 0) {
            return "Unable to determine type of empty array";
        }

        json = json[0];
    }
    const o = ( < CSharpConverterOptions > options);

    let result = "";
    let recursiveObjects: [string, object][] = [
        ["Poxo", json]
    ];
    while (recursiveObjects.length > 0) {
        const element = recursiveObjects.pop();
        if (element == undefined) {
            break;
        }

        const [objName, objVal]: [string, object] = element;
        const entries = Object.entries(objVal);
        result += entries.reduce((acc, [key, val]) => {
            const varName = o.varNameConversion(key);
            const varType = getCSharpTypeString([key, val], o);
            if (varType[1] != null) {
                recursiveObjects.push(varType[1]);
            }
            const epilogue = o.useProperties ? "{ get; set; }" : ";";
            let prelude = `\n${o.indentation + o.indentation}public `;
            if (o.jsonProperty != null) {
                prelude = `\n\n${o.indentation + o.indentation}${o.jsonProperty(key)}` + prelude;
            }
            return acc + `${prelude}${varType[0]} ${varName} ${epilogue}`;
        }, `\n${o.indentation}public class ${objName}\n${o.indentation}{`) + `\n${o.indentation}}`;
    }

    return `//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a JsonToPoxo.
// </auto-generated>
//------------------------------------------------------------------------------
using Newtonsoft.Json;

namespace ${o.namespace}
{${result}
}`;
}

/**
 * Gets the corresponding C# type of the JSON value.
 * @param param0 the json key value pair.
 * @param options the options for the language.
 */
function getCSharpTypeString([varName, varType]: [string, any], options: CSharpConverterOptions): [string, [string, object] | null] {
    const type = typeof varType;
    switch (type) {
        case "string":
            return ["string", null]
        case "number":
            if (Number.isInteger(varType)) {
                return ["int", null];
            }
            return [options.floatType, null];
        case "bigint":
            return ["System.Numerics.BigInteger", null]
        case "boolean":
            return ["bool", null]

        case "object":
            if (varType == null) {
                return ["object /* unable to determine */", null];
            }

            if (Array.isArray(varType)) {
                if (varType.length > 0) {
                    // TODO: Check if the data is uniform.
                    const arrayType = getCSharpTypeString([singularize(varName), varType[0]], options);

                    return [arrayType[0] + "[]", arrayType[1]];
                }
                return ["object[]", null]
            }

            if (Object.entries(varType).length > 0) {
                const newType = options.varNameConversion(varName)
                
                return [newType, [newType, varType]];
            }

            return ["object", null]
        default:
        case "symbol":
        case "undefined":
            return ["object /* unknown type */", null]
        case "function":
            return ["object /* unable to convert function */", null]
    }
}
