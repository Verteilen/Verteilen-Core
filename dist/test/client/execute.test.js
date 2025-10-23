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
const job_execute_1 = require("../../src/client/job_execute");
const interface_1 = require("../../src/interface");
describe("Client Execute Test", () => {
    let execute = undefined;
    let job = undefined;
    afterAll(() => {
        execute = undefined;
    });
    test("Testing condition (OS when path not exist)", () => __awaiter(void 0, void 0, void 0, function* () {
        job = {
            index: 0,
            uuid: "UUID",
            runtime_uuid: "Runtime",
            category: interface_1.JobCategory.Condition,
            type: interface_1.JobType2.CHECK_PATH,
            script: "",
            string_args: ["Not Exist"],
            number_args: [],
            boolean_args: []
        };
        execute = new job_execute_1.ClientJobExecute((str) => console.log(str), (str) => console.log(str), job, undefined, { plugins: [] });
        yield expect(execute.execute()).rejects.toBeDefined();
    }));
    test("Testing condition (OS when path exist)", () => __awaiter(void 0, void 0, void 0, function* () {
        job = {
            index: 0,
            uuid: "UUID",
            runtime_uuid: "Runtime",
            category: interface_1.JobCategory.Condition,
            type: interface_1.JobType2.CHECK_PATH,
            script: "",
            string_args: [process.cwd()],
            number_args: [],
            boolean_args: []
        };
        execute = new job_execute_1.ClientJobExecute((str) => console.log(str), (str) => console.log(str), job, undefined, { plugins: [] });
        yield expect(execute.execute()).resolves.toBeDefined();
    }));
});
