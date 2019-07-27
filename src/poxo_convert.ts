/**
 * Main file of the JsonToPoxo project.
 */

/**
 * The Converter signature
 * See convertToX(string, Converter) for usage.
 * 
 * Converters convert an object into another language with the provided options.
 * If the options are not specified it should be able to create its own default.
 */
type Converter = (json: Object | Object[], options?: ConverterOptions) => string;

/**
 * General options for all the converters.
 */
interface ConverterOptions {
    varNameConversion(varName: string): string;
    indentation: string;
}

/**
 * Converts a JSON-string into a javascript object and parses it with the
 * specified converter.
 * @param text JSON-string
 * @param x Converter function
 */
function convertToX(text: string, x: Converter): string {
    let json;
    try {
        json = JSON.parse(text);
    } catch (error) {
        console.error(error.message);
        return error;
    }
    return x(json);
}

/**
 * Removes any non ASCII alphanumeric character into an underscore.
 * and prepends a v if it starts with a numeric character.
 * @param varName 
 */
function sanitizeVariableName(varName: string): string {
    varName = varName.replace(/(?![\x30-\x39\x41-\x5a\x61-\x7a])./gu, "_");
    if (varName.length == 0 || !isNaN(parseInt(varName[0], 10))) {
        return "v" + varName;
    }
    return varName;
}

/**
 * Converts the first letter to uppercase
 * @param s
 */
function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Converts a variable name to PascalCasing
 * @param someString string to be converted
 * @param capitalizeAbbreviations e.g. if true: 'URL' otherwise "Url"
 */
function pascalCase(someString: string, capitalizeAbbreviations: boolean = false): string {

    // e.g. UPPER_CASE_123 -> upper_case_123
    if (someString.match(/^[A-Z_0-9]+$/g)) {
        someString = someString.toLowerCase();
    } else if (!capitalizeAbbreviations) {
        someString = someString
            // BARThing -> BarThing
            .replace(/([A-Z])([A-Z]+)([A-Z][a-z])/g,
                (_m, p1, p2, p3, _o, _s) => p1 + p2.toLowerCase() + p3)

            // fooBAR -> fooBar
            .replace(/([A-Z])([A-Z]+)/g,
                (_m, p1, p2, _o, _s) => p1 + p2.toLowerCase())
    }

    // e.g. barSome__Foo_thing_ -> BarSomeFooThing
    someString = someString.replace(/_+(.)|^([a-z])/g, (match, p1, p2, _o, _s) =>
        p1 ? capitalize(p1) :
        p2 ? capitalize(p2) :
        match);

    return someString;
}