"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientJavascript = exports.safeEval = void 0;
const vm = __importStar(require("vm"));
const interface_1 = require("../interface");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const safeEval = (code, context, opts) => {
    let sandbox = {};
    let resultKey = 'SAFE_EVAL_' + Math.floor(Math.random() * 1000000);
    sandbox[resultKey] = {};
    var clearContext = `
        (function(){
            Function = undefined;
            const keys = Object.getOwnPropertyNames(this).concat(['constructor']);
            keys.forEach((key) => {
            const item = this[key];
            if(!item || typeof item.constructor !== 'function') return;
            this[key].constructor = undefined;
            });
        })();
    `;
    code = clearContext + resultKey + `=(function(){\n${code}\n})();`;
    if (context != undefined) {
        Object.keys(context).forEach(function (key) {
            sandbox[key] = context[key];
        });
    }
    vm.runInNewContext(code, sandbox, opts);
    return sandbox[resultKey];
};
exports.safeEval = safeEval;
let getlib = undefined;
let getpara = undefined;
let getjob = undefined;
let messager;
let messager_log;
let clientos;
let para = undefined;
let waiting = 0;
const tag = () => { var _a, _b; return (_b = (_a = getjob === null || getjob === void 0 ? void 0 : getjob()) === null || _a === void 0 ? void 0 : _a.uuid) !== null && _b !== void 0 ? _b : 'unknown'; };
const runtime = () => { var _a, _b; return (_b = (_a = getjob === null || getjob === void 0 ? void 0 : getjob()) === null || _a === void 0 ? void 0 : _a.runtime_uuid) !== null && _b !== void 0 ? _b : 'unknown'; };
function has(key, checker) {
    var _a;
    const p = (_a = getpara === null || getpara === void 0 ? void 0 : getpara()) !== null && _a !== void 0 ? _a : undefined;
    if (p == undefined)
        return false;
    return p.containers.findIndex(x => x.name == key && (checker ? checker(x.type) : true)) != -1;
}
function hasboolean(key) {
    return has(key, (x) => x == interface_1.DataType.Boolean);
}
function hasnumber(key) {
    return has(key, (x) => x == interface_1.DataType.Number || x == interface_1.DataType.Expression);
}
function hasstring(key) {
    return has(key, (x) => x == interface_1.DataType.String || x == interface_1.DataType.Textarea);
}
function hasobject(key) {
    return has(key, (x) => x == interface_1.DataType.Object);
}
function haslist(key) {
    return has(key, (x) => x == interface_1.DataType.List);
}
function hasselect(key) {
    return has(key, (x) => x == interface_1.DataType.Select);
}
function get(key, checker) {
    var _a, _b, _c;
    const p = (_a = getpara === null || getpara === void 0 ? void 0 : getpara()) !== null && _a !== void 0 ? _a : undefined;
    if (p == undefined)
        return undefined;
    return (_c = (_b = p.containers.find(x => x.name == key && (checker ? checker(x.type) : true))) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : undefined;
}
function getboolean(key) {
    return get(key, (x) => x == interface_1.DataType.Boolean);
}
function getnumber(key) {
    var _a;
    if (key == 'ck') {
        const r = (_a = getjob === null || getjob === void 0 ? void 0 : getjob()) === null || _a === void 0 ? void 0 : _a.index;
        if (r != undefined)
            return r;
        return 0;
    }
    return get(key, (x) => x == interface_1.DataType.Number || x == interface_1.DataType.Expression);
}
function getstring(key) {
    return get(key, (x) => x == interface_1.DataType.String || x == interface_1.DataType.Textarea);
}
function getobject(key) {
    return get(key, (x) => x == interface_1.DataType.Object);
}
function getlist(key) {
    return get(key, (x) => x == interface_1.DataType.List);
}
function getselect(key) {
    const s = get(key, (x) => x == interface_1.DataType.Select);
    if ((s === null || s === void 0 ? void 0 : s.meta) == undefined)
        return undefined;
    return s.meta[s.value];
}
function getselectlendth(key) {
    const s = get(key, (x) => x == interface_1.DataType.Select);
    if ((s === null || s === void 0 ? void 0 : s.meta) == undefined)
        return undefined;
    return s.meta.length;
}
function _set(key, checker, created = true) {
    var _a;
    const p = (_a = getpara === null || getpara === void 0 ? void 0 : getpara()) !== null && _a !== void 0 ? _a : undefined;
    if (p == undefined)
        return undefined;
    if (!p.canWrite)
        return undefined;
    return p.containers.find(x => x.name == key && (checker ? checker(x.type) : true));
}
function set(key, value) {
    const target = _set(key);
    if (target == undefined)
        return;
    switch (target.type) {
        case interface_1.DataType.Boolean:
            setboolean(key, value);
            break;
        case interface_1.DataType.Number:
            setnumber(key, value);
            break;
        case interface_1.DataType.Textarea:
        case interface_1.DataType.String:
            setstring(key, value);
            break;
        case interface_1.DataType.Object:
            setobject(key, value);
            break;
        case interface_1.DataType.List:
            setlist(key, value);
            break;
        case interface_1.DataType.Select:
            setselect(key, value);
            break;
    }
}
function setboolean(key, value) {
    let target = _set(key, (x) => x == interface_1.DataType.Boolean);
    if (target == undefined) {
        target = { name: key, type: interface_1.DataType.Boolean, hidden: false, runtimeOnly: true, value: value };
    }
    else {
        target.value = value;
    }
    para === null || para === void 0 ? void 0 : para.feedbackboolean({ key: key, value: value });
}
function setnumber(key, value) {
    if (key == 'ck') {
        messager_log("Trying to set a constant ck...", tag(), runtime());
        return;
    }
    let target = _set(key, (x) => x == interface_1.DataType.Number);
    if (target == undefined) {
        target = { name: key, type: interface_1.DataType.Number, hidden: false, runtimeOnly: true, value: value };
    }
    else {
        target.value = value;
    }
    para === null || para === void 0 ? void 0 : para.feedbacknumber({ key: key, value: value });
}
function setstring(key, value) {
    let target = _set(key, (x) => x == interface_1.DataType.String);
    if (target == undefined) {
        target = { name: key, type: interface_1.DataType.String, hidden: false, runtimeOnly: true, value: value };
    }
    else {
        target.value = value;
    }
    para === null || para === void 0 ? void 0 : para.feedbackstring({ key: key, value: value });
}
function setobject(key, value) {
    let target = _set(key, (x) => x == interface_1.DataType.Object);
    if (target == undefined) {
        target = { name: key, type: interface_1.DataType.Object, hidden: false, runtimeOnly: true, value: value };
    }
    else {
        target.value = value;
    }
    para === null || para === void 0 ? void 0 : para.feedbackobject({ key: key, value: value });
}
function setlist(key, value) {
    let target = _set(key, (x) => x == interface_1.DataType.List);
    if (target == undefined) {
        target = { name: key, type: interface_1.DataType.List, hidden: false, runtimeOnly: true, value: value };
    }
    else {
        target.value = value;
    }
    para === null || para === void 0 ? void 0 : para.feedbackobject({ key: key, value: value });
}
function setselect(key, value) {
    const target = _set(key, (x) => x == interface_1.DataType.Select);
    if (target == undefined)
        return;
    target.value = value;
    para === null || para === void 0 ? void 0 : para.feedbackobject({ key: key, value: value });
}
class ClientJavascript {
    constructor(_messager, _messager_log, _getjob) {
        this.JavascriptExecuteWithLib = (javascript, libs, log) => {
            var _a;
            waiting = 0;
            let context = this.getJavascriptEnv(interface_1.JavascriptLib.ALL, log);
            let result = 0;
            context = Object.assign(context, { result: result });
            let script = '';
            const p = (_a = getlib === null || getlib === void 0 ? void 0 : getlib()) !== null && _a !== void 0 ? _a : undefined;
            if (p != undefined) {
                libs.forEach(x => {
                    const t = p.libs.find(y => y.name == x);
                    if (t != undefined)
                        script += ("\n" + t.content + "\n");
                });
            }
            script += javascript;
            const r = (0, exports.safeEval)(script, context);
            let time = -1;
            return new Promise((resolve) => {
                let handle = undefined;
                handle = setInterval(() => {
                    if (waiting == 0 && time > 1) {
                        clearInterval(handle);
                        resolve(r);
                    }
                    time = time + 1;
                }, 100);
            });
        };
        this.JavascriptExecute = (javascript, log) => {
            waiting = 0;
            let context = this.getJavascriptEnv(interface_1.JavascriptLib.OS | interface_1.JavascriptLib.MESSAGE | interface_1.JavascriptLib.HTTP | interface_1.JavascriptLib.PATH, log);
            let result = 0;
            context = Object.assign(context, { result: result });
            let script = '';
            script += javascript;
            const r = (0, exports.safeEval)(script, context);
            let time = -1;
            return new Promise((resolve) => {
                let handle = undefined;
                handle = setInterval(() => {
                    if (waiting == 0 && time > 1) {
                        clearInterval(handle);
                        resolve(r);
                    }
                    time = time + 1;
                }, 100);
            });
        };
        messager = _messager;
        messager_log = _messager_log;
        this.path = {
            filename: this.filename,
            extname: this.extname,
            dirname: this.dirname,
        };
        this.os = {
            exec: this.exec,
            command: this.command,
            plugin_exec: this.plugin_exec,
            plugin_command: this.plugin_command,
            copyfile: this.copyfile,
            copydir: this.copydir,
            deletefile: this.deletefile,
            deletedir: this.deletedir,
            exist: this.exist,
            listfile: this.listfile,
            listdir: this.listdir,
            createdir: this.createdir,
            writefile: this.writefile,
            readfile: this.readfile,
            rename: this.rename,
        };
        this.env = {
            has: has,
            get: get,
            set: set,
            hasboolean: hasboolean,
            getboolean: getboolean,
            setboolean: setboolean,
            hasnumber: hasnumber,
            getnumber: getnumber,
            setnumber: setnumber,
            hasstring: hasstring,
            getstring: getstring,
            setstring: setstring,
            hasobject: hasobject,
            getobject: getobject,
            setobject: setobject,
            haslist: haslist,
            getlist: getlist,
            setlist: setlist,
            hasselect: hasselect,
            getselect: getselect,
            getsleectlength: getselectlendth,
            setselect: setselect,
        };
        this.message = {
            messager: (m) => _messager(m.toString(), tag()),
            messager_log: (m) => _messager_log(m.toString(), tag(), runtime()),
        };
        this.http = {
            get: this.httpGet,
            post: this.httpPost,
            put: this.httpPut,
            delete: this.httpDelete,
            patch: this.httpPatch,
        };
    }
    getJavascriptEnv(flags = interface_1.JavascriptLib.ALL, log) {
        let javascriptEnv = {};
        if ((flags & interface_1.JavascriptLib.PATH) == interface_1.JavascriptLib.PATH)
            javascriptEnv = Object.assign(javascriptEnv, { path: this.path });
        if ((flags & interface_1.JavascriptLib.OS) == interface_1.JavascriptLib.OS)
            javascriptEnv = Object.assign(javascriptEnv, { os: this.os });
        if ((flags & interface_1.JavascriptLib.ENV) == interface_1.JavascriptLib.ENV)
            javascriptEnv = Object.assign(javascriptEnv, { env: this.env });
        if ((flags & interface_1.JavascriptLib.MESSAGE) == interface_1.JavascriptLib.MESSAGE) {
            if (log) {
                javascriptEnv = Object.assign(javascriptEnv, {
                    messager: (m) => log(m.toString(), tag()),
                    messager_log: (m) => log(m.toString(), tag()),
                });
            }
            else {
                javascriptEnv = Object.assign(javascriptEnv, { m: this.message });
            }
        }
        if ((flags & interface_1.JavascriptLib.HTTP) == interface_1.JavascriptLib.HTTP)
            javascriptEnv = Object.assign(javascriptEnv, { http: this.http });
        javascriptEnv = Object.assign(javascriptEnv, {
            setTimeout: setTimeout,
            wait: this.wait,
            sleep: this.sleep,
            console: { log: log ? log : messager_log },
            JSON: {
                parse: JSON.parse,
                stringify: JSON.stringify
            },
            math: {
                floor: Math.floor,
                abs: Math.abs,
                round: Math.round,
                ceil: Math.ceil,
                PI: Math.PI,
                E: Math.E,
                pow: Math.pow,
                random: Math.random,
                max: Math.max,
                min: Math.min,
                trunc: Math.trunc,
                log: Math.log,
                log10: Math.log10,
                log2: Math.log2,
                exp: Math.exp,
                expm1: Math.expm1,
                sin: Math.sin,
                sinh: Math.sinh,
                cos: Math.cos,
                cosh: Math.cosh,
                tan: Math.tan,
                tanh: Math.tanh,
                asin: Math.asin,
                asinh: Math.asinh,
                acos: Math.acos,
                acosh: Math.acosh,
                atan: Math.atan,
                atanh: Math.atanh,
                atan2: Math.atan2,
            }
        });
        return javascriptEnv;
    }
    filename(p, extension) {
        if (extension) {
            return path.basename(p);
        }
        else {
            return path.basename(p).replace(path.extname(p), "");
        }
    }
    extname(p) {
        return path.extname(p);
    }
    dirname(p) {
        return path.dirname(p);
    }
    exec(command, args, cwd) {
        waiting += 1;
        clientos === null || clientos === void 0 ? void 0 : clientos.command_exec(command, args, cwd);
        waiting -= 1;
    }
    command(command, args, cwd) {
        waiting += 1;
        return clientos === null || clientos === void 0 ? void 0 : clientos.command_sync(command, args, cwd).then(() => {
            waiting -= 1;
        }).catch(() => {
            waiting -= 1;
        });
    }
    plugin_exec(command, args) {
        waiting += 1;
        const cwd = path.join(os.homedir(), interface_1.DATA_FOLDER, 'exe');
        const cc = process.platform == "win32" ? command : "./" + command;
        clientos === null || clientos === void 0 ? void 0 : clientos.command_exec(cc, args, cwd);
        waiting -= 1;
    }
    plugin_command(command, args) {
        waiting += 1;
        const cwd = path.join(os.homedir(), interface_1.DATA_FOLDER, 'exe');
        const cc = process.platform == "win32" ? command : "./" + command;
        return clientos === null || clientos === void 0 ? void 0 : clientos.command_sync(cc, args, cwd).then(() => {
            waiting -= 1;
        }).catch(() => {
            waiting -= 1;
        });
    }
    copyfile(from, to) {
        clientos === null || clientos === void 0 ? void 0 : clientos.file_copy({ from: from, to: to });
    }
    copydir(from, to) {
        clientos === null || clientos === void 0 ? void 0 : clientos.dir_copy({ from: from, to: to });
    }
    deletefile(path) {
        clientos === null || clientos === void 0 ? void 0 : clientos.file_delete({ path: path });
    }
    deletedir(path) {
        clientos === null || clientos === void 0 ? void 0 : clientos.dir_delete({ path: path });
    }
    rename(from, to) {
        return clientos === null || clientos === void 0 ? void 0 : clientos.rename({ from: from, to: to });
    }
    exist(path) {
        var _a;
        return (_a = clientos === null || clientos === void 0 ? void 0 : clientos.fs_exist({ path: path })) !== null && _a !== void 0 ? _a : false;
    }
    listfile(path) {
        return clientos === null || clientos === void 0 ? void 0 : clientos.dir_files({ path: path });
    }
    listdir(path) {
        return clientos === null || clientos === void 0 ? void 0 : clientos.dir_dirs({ path: path });
    }
    createdir(path) {
        clientos === null || clientos === void 0 ? void 0 : clientos.dir_create({ path: path });
    }
    writefile(path, data) {
        clientos === null || clientos === void 0 ? void 0 : clientos.file_write({ from: path, to: data });
    }
    readfile(path) {
        return clientos === null || clientos === void 0 ? void 0 : clientos.file_read({ path: path });
    }
    wait(time) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(resolve, time * 1000));
        });
    }
    sleep(n) {
        return __awaiter(this, void 0, void 0, function* () {
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n * 1000);
        });
    }
    httpGet(url, p) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.httpGo('GET', url, p.toObject());
        });
    }
    httpPost(url, p) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.httpGo('POST', url, p.toObject());
        });
    }
    httpDelete(url, p) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.httpGo('DELETE', url, p.toObject());
        });
    }
    httpPatch(url, p) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.httpGo('PATCH', url, p.toObject());
        });
    }
    httpPut(url, p) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.httpGo('PUT', url, p.toObject());
        });
    }
    httpGo(method, url, p) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(url, {
                method: method,
                body: p
            });
        });
    }
}
exports.ClientJavascript = ClientJavascript;
ClientJavascript.Init = (_messager, _messager_log, _clientos, _para, _getlib, _getpara, _getjob) => {
    messager = _messager;
    messager_log = _messager_log;
    clientos = _clientos;
    para = _para;
    getlib = _getlib;
    getpara = _getpara;
    getjob = _getjob;
};
