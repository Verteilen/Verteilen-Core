import { KeyValue, Database, DatabaseContainer } from "../../interface";
export declare class Util_Parser {
    paras: Array<KeyValue>;
    get count(): number;
    constructor(_paras: Array<KeyValue>);
    clone: () => Util_Parser;
    static to_keyvalue: (p: Database) => Array<KeyValue>;
    private static getDeepKeys;
    static _to_keyvalue: (p: Array<DatabaseContainer>) => Array<KeyValue>;
    static replaceAll: (str: string, fi: string, tar: string) => string;
    replacePara: (text: string) => string;
    parse: (str: string) => string;
    private _replacePara;
}
