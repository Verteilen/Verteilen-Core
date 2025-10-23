"use strict";
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
const job_parameter_1 = require("../../src/client/job_parameter");
const javascript_1 = require("../../src/client/javascript");
const os_1 = require("../../src/client/os");
const interface_1 = require("../../src/interface");
describe("JS Test", () => {
    let js = undefined;
    let os = undefined;
    let para = undefined;
    let parameter = undefined;
    let lib = undefined;
    beforeAll(() => {
        os = new os_1.ClientOS(() => "", () => "", (str) => console.log(str), (str) => console.log(str));
        para = new job_parameter_1.ClientJobParameter();
        parameter = {
            uuid: "",
            title: "",
            canWrite: true,
            containers: [
                { name: "n1", type: interface_1.DataType.Number, value: 7, hidden: false, runtimeOnly: false },
                { name: "n2", type: interface_1.DataType.Number, value: 5, hidden: false, runtimeOnly: false },
                { name: "s1", type: interface_1.DataType.String, value: "Hello World", hidden: false, runtimeOnly: false },
                { name: "b1", type: interface_1.DataType.Boolean, value: true, hidden: false, runtimeOnly: false },
                { name: "e1", type: interface_1.DataType.Expression, value: 0, meta: "n1 + n2", hidden: false, runtimeOnly: false },
            ]
        };
        js = new javascript_1.ClientJavascript((str) => console.log(str), (str) => console.log(str), () => undefined);
        javascript_1.ClientJavascript.Init((str) => console.log(str), (str) => console.log(str), os, para, () => lib, () => parameter, () => undefined);
    });
    afterAll(() => {
        js = undefined;
        os = undefined;
        para = undefined;
        parameter = undefined;
        lib = undefined;
    });
    test("Env test getter", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield js.JavascriptExecuteWithLib(`return env.getnumber("n1");`, [])).toBe(7);
        expect(yield js.JavascriptExecuteWithLib(`return env.getnumber("n2");`, [])).toBe(5);
        expect(yield js.JavascriptExecuteWithLib(`return env.getstring("s1");`, [])).toBe("Hello World");
        expect(yield js.JavascriptExecuteWithLib(`return env.getboolean("b1");`, [])).toBe(true);
        expect(yield js.JavascriptExecuteWithLib(`return env.getnumber("nnn");`, [])).toBe(undefined);
        expect(yield js.JavascriptExecuteWithLib(`return env.getstring("sss");`, [])).toBe(undefined);
        expect(yield js.JavascriptExecuteWithLib(`return env.getboolean("bbb");`, [])).toBe(undefined);
    }));
    test("Env test loop", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield js.JavascriptExecuteWithLib(`
        result = 0;
        n = env.getnumber("n2");
        for(i=0;i<3;i++){
            result += n;
        }
        return result;
        `, [])).toBe(15);
    }));
    test("Env test has", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield js.JavascriptExecuteWithLib(`return env.hasnumber("n1");`, [])).toBe(true);
        expect(yield js.JavascriptExecuteWithLib(`return env.hasnumber("n2");`, [])).toBe(true);
        expect(yield js.JavascriptExecuteWithLib(`return env.hasstring("s1");`, [])).toBe(true);
        expect(yield js.JavascriptExecuteWithLib(`return env.hasboolean("b1");`, [])).toBe(true);
        expect(yield js.JavascriptExecuteWithLib(`return env.hasnumber("nnn");`, [])).toBe(false);
        expect(yield js.JavascriptExecuteWithLib(`return env.hasstring("sss");`, [])).toBe(false);
        expect(yield js.JavascriptExecuteWithLib(`return env.hasboolean("bbb");`, [])).toBe(false);
    }));
});
