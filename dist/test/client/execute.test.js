"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const job_execute_1 = require("../../src/client/job_execute");
const interface_1 = require("../../src/interface");
describe("Client Execute Test", () => {
    let execute = undefined;
    let job = undefined;
    afterAll(() => {
        execute = undefined;
    });
    test("Testing condition (OS when path not exist)", async () => {
        job = {
            index: 0,
            uuid: "UUID",
            runtime_uuid: "Runtime",
            category: interface_1.JobCategory.Condition,
            type: interface_1.JobType2.CHECK_PATH,
            script: "",
            string_args: ["Not Exist"],
            number_args: [],
            boolean_args: [],
            id_args: [],
        };
        execute = new job_execute_1.ClientJobExecute((str) => console.log(str), (str) => console.log(str), job, undefined, { plugins: [] });
        await expect(execute.execute()).rejects.toBeDefined();
    });
    test("Testing condition (OS when path exist)", async () => {
        job = {
            index: 0,
            uuid: "UUID",
            runtime_uuid: "Runtime",
            category: interface_1.JobCategory.Condition,
            type: interface_1.JobType2.CHECK_PATH,
            script: "",
            string_args: [process.cwd()],
            number_args: [],
            boolean_args: [],
            id_args: [],
        };
        execute = new job_execute_1.ClientJobExecute((str) => console.log(str), (str) => console.log(str), job, undefined, { plugins: [] });
        await expect(execute.execute()).resolves.toBeDefined();
    });
});
