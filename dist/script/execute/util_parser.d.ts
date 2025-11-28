import { KeyValue, Database, DatabaseContainer } from "../../interface";
/**
 * The worker which helps parsing database variables into argument\
 * Including expression executing
 */
export declare class Util_Parser {
    paras: Array<KeyValue>;
    get count(): number;
    constructor(_paras: Array<KeyValue>);
    clone: () => Util_Parser;
    /**
     * Turn database into a list of keyvalue structure\
     * Exclude the expression datatype
     * @param p Target database instance
     * @returns The list of keyvalue
     */
    static to_keyvalue: (p: Database) => Array<KeyValue>;
    /**
     * Input a object data, and deep search all of subobject\
     * Phrasing it into keyvalue data
     * @param obj Object
     * @returns Array of keyvalue data
     */
    private static getDeepKeys;
    /**
     * Database containers into keyvalue list
     */
    static _to_keyvalue: (p: Array<DatabaseContainer>) => Array<KeyValue>;
    /**
     * Search all the string result and replace to target string\
     * @example
     * replaceAll("ABCBCAB", "AB", "KK") // Result: KKCBCKK
     * @param str string data
     * @param fi feature
     * @param tar replace target
     */
    static replaceAll: (str: string, fi: string, tar: string) => string;
    /**
     * Replace a string to environment string\
     * * Include Expression calculation
     * * Include Env string, boolean, number replacing
     * @param text Input text
     * @param paras The keyvalue list
     * @returns The result string
     */
    replacePara: (text: string) => string;
    /**
     * Expression magic
     * @param str Input string, the expression part of string only, not the entire sentence
     * @param paras Keyvalue list
     * @returns Result calculation
     */
    parse: (str: string) => string;
    private _replacePara;
}
