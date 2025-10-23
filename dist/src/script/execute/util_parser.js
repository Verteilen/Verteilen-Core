"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util_Parser = void 0;
const expressionparser_1 = require("expressionparser");
const interface_1 = require("../../interface");
class Util_Parser {
    get count() {
        return this.paras.length;
    }
    constructor(_paras) {
        this.paras = [];
        this.clone = () => {
            const b = JSON.parse(JSON.stringify(this.paras));
            return new _a(b);
        };
        this.replacePara = (text) => {
            let buffer = '';
            let store = '';
            let state = false;
            let ignore = -1;
            let useExp = false;
            for (const v of text) {
                if (v == interface_1.IGNORE_CHARACTER && ignore == -1)
                    ignore = 0;
                else if (ignore == 0)
                    ignore = 1;
                else if (ignore == 1)
                    ignore = 2;
                else if (ignore == 2)
                    ignore = -1;
                if (v == interface_1.ENV_CHARACTER && ignore == -1) {
                    state = !state;
                    if (!state) {
                        if (useExp) {
                            buffer += this.parse(store);
                        }
                        else {
                            buffer += this._replacePara(store);
                        }
                        store = "";
                        useExp = false;
                    }
                }
                if (v == '{' && state && store.length == 0)
                    useExp = true;
                if (state && v != interface_1.ENV_CHARACTER && (ignore != 0))
                    store += v;
                if (!state && v != interface_1.ENV_CHARACTER && (ignore != 0))
                    buffer += (ignore > 0 ? (interface_1.ENV_CHARACTER + v) : v);
            }
            return buffer;
        };
        this.parse = (str) => {
            str = str.substring(1, str.length - 1);
            const parser = (0, expressionparser_1.init)(expressionparser_1.formula, (term) => {
                if (term.includes("_ck_")) {
                    const index = this.paras.findIndex(x => x.key == "ck");
                    if (index != -1)
                        term = _a.replaceAll(term, "_ck_", this.paras[index].value);
                }
                const index = this.paras.findIndex(x => x.key == term);
                if (index != -1) {
                    const n = Number(this.paras[index].value);
                    if (Number.isNaN(n))
                        return this.paras[index].value;
                    return n;
                }
                else
                    return 0;
            });
            const r = parser.expressionToValue(str).toString();
            return r;
        };
        this._replacePara = (store) => {
            const index = this.paras.findIndex(x => x.key == store);
            if (index == -1)
                return `%${store}%`;
            return this.paras[index].value;
        };
        this.paras = _paras;
    }
}
exports.Util_Parser = Util_Parser;
_a = Util_Parser;
Util_Parser.to_keyvalue = (p) => {
    return [
        ..._a._to_keyvalue(p.containers)
    ];
};
Util_Parser.getDeepKeys = (obj, name) => {
    let keys = [];
    for (var key in obj) {
        keys.push([name ? name + "." + key : key, obj[key]]);
        if (typeof obj[key] === "object") {
            if (Array.isArray(obj[key])) {
                if (typeof obj[key]['length'] === 'number') {
                    keys.push([name ? name + "." + key + ".length" : key + ".length", obj[key]['length']]);
                }
            }
            var subkeys = _a.getDeepKeys(obj[key]);
            keys = keys.concat(subkeys.map(function (subkey) {
                return [name ? name + "." + key + "." + subkey[0] : key + "." + subkey[0], subkey[1]];
            }));
        }
    }
    return keys;
};
Util_Parser._to_keyvalue = (p) => {
    const r = [];
    r.push(...p.filter(x => x.type == interface_1.DataType.Boolean || x.type == interface_1.DataType.String || x.type == interface_1.DataType.Textarea || x.type == interface_1.DataType.Number || x.type == interface_1.DataType.Expression).map(x => { return { key: x.name, value: x.value.toString() }; }));
    const objs = p.filter(x => x.type == interface_1.DataType.Object);
    const lists = p.filter(x => x.type == interface_1.DataType.List);
    const selects = p.filter(x => x.type == interface_1.DataType.Select);
    for (const obj of objs) {
        const v = obj.value;
        const keys = _a.getDeepKeys(v, obj.name);
        r.push(...keys.map(x => { return { key: x[0], value: x[1].toString() }; }));
    }
    for (const list of lists) {
        const a = list.value;
        r.push(...a.map((x, index) => { return { key: list.name + "." + String(index), value: x }; }));
        r.push({ key: list.name + ".length", value: a.length });
    }
    for (const select of selects) {
        const a = select.meta;
        const target = a[select.value];
        r.push({ key: select.name, value: target });
    }
    return r;
};
Util_Parser.replaceAll = (str, fi, tar) => {
    let p = str;
    while (p.includes(fi))
        p = p.replace(fi, tar);
    return p;
};
