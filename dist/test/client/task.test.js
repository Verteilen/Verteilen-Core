"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const job_database_1 = require("../../src/client/job_database");
const os_1 = require("../../src/client/os");
const interface_1 = require("../../src/interface");
const base_1 = require("../../src/script/execute/base");
describe("Express Test", () => {
    let os = undefined;
    let para = undefined;
    let database = undefined;
    let lib = undefined;
    const generateJob = (str) => {
        return {
            uuid: "test-job",
            category: interface_1.JobCategory.Execution,
            type: interface_1.JobType.JAVASCRIPT,
            script: "",
            string_args: str,
            number_args: [],
            boolean_args: [],
            id_args: [],
        };
    };
    const generateTask = (Job, property, cronjob) => {
        return {
            uuid: "test-task",
            title: "Test Task",
            description: "This is a test task",
            setupjob: false,
            cronjob: cronjob ? true : false,
            cronjobKey: cronjob !== null && cronjob !== void 0 ? cronjob : "",
            multi: false,
            multiKey: "",
            properties: property,
            jobs: [Job],
        };
    };
    beforeEach(() => {
        os = new os_1.ClientOS(() => "", () => "", (str) => console.log(str), (str) => console.log(str));
        para = new job_database_1.ClientJobDatabase();
        database = {
            uuid: "",
            title: "",
            canWrite: true,
            containers: [
                { name: "n1", type: interface_1.DataType.Number, value: 7, hidden: false, runtimeOnly: false },
                { name: "n2", type: interface_1.DataType.Number, value: 5, hidden: false, runtimeOnly: false },
                { name: "DATA_0", type: interface_1.DataType.Number, value: 10, hidden: false, runtimeOnly: false },
                { name: "DATA_1", type: interface_1.DataType.Number, value: 1000, hidden: false, runtimeOnly: false },
                { name: "HELLO_0", type: interface_1.DataType.Number, value: 99, hidden: false, runtimeOnly: false },
                { name: "HELLO_1", type: interface_1.DataType.Number, value: 9999, hidden: false, runtimeOnly: false },
                { name: "s1", type: interface_1.DataType.String, value: "Hello World", hidden: false, runtimeOnly: false },
                { name: "b1", type: interface_1.DataType.Boolean, value: true, hidden: false, runtimeOnly: false },
                { name: "e1", type: interface_1.DataType.Expression, value: 0, meta: "n1+n2", hidden: false, runtimeOnly: false },
                { name: "b1", type: interface_1.DataType.Object, value: {
                        data: [{ k: 5, p: 5, n: 5 }, { k: 10, p: 122, n: 5 }]
                    }, hidden: false, runtimeOnly: false },
            ]
        };
    });
    afterEach(() => {
        os = undefined;
        para = undefined;
        database = undefined;
        lib = undefined;
    });
    test("Property getter", () => {
        const job = generateJob(["%e1%", "KKK %s1%", "%POS%"]);
        const task = generateTask(job, [{
                name: "POS",
                expression: "n1 + n2 + n1"
            }]);
        base_1.ExecuteManager_Base.string_args_transform(task, job, (str) => console.log(str), database, 1);
        expect(job.string_args[0]).toBe("12");
        expect(job.string_args[1]).toBe("KKK Hello World");
        expect(job.string_args[2]).toBe("19");
    });
    test("Nest getter", () => {
        const job = generateJob(["%POS%", "Hello %POS_Deep%", "%POS_Deepp%"]);
        const task = generateTask(job, [
            {
                name: "POS",
                expression: `STRING(["b1.data.", ck, ".p"])`
            },
            {
                name: "POS_Deep",
                expression: "POS",
                deep: 2
            },
            {
                name: "POS_Deepp",
                expression: "POS_Deep + 1"
            }
        ]);
        base_1.ExecuteManager_Base.string_args_transform(task, job, (str) => console.log(str), database, 1);
        expect(job.string_args[0]).toBe("b1.data.1.p");
        expect(job.string_args[1]).toBe("Hello 122");
        expect(job.string_args[2]).toBe("123");
    });
    test("_ck_ getter 0", () => {
        const job = generateJob(["%p1%", "%p2%"]);
        const task = generateTask(job, [
            {
                name: "p1",
                expression: `DATA__ck_`
            },
            {
                name: "p2",
                expression: "HELLO__ck_",
            },
        ]);
        base_1.ExecuteManager_Base.string_args_transform(task, job, (str) => console.log(str), database, 0);
        expect(job.string_args[0]).toBe("10");
        expect(job.string_args[1]).toBe("99");
    });
    test("_ck_ getter 1", () => {
        const job = generateJob(["%p1%", "%p2%"]);
        const task = generateTask(job, [
            {
                name: "p1",
                expression: `DATA__ck_`
            },
            {
                name: "p2",
                expression: "HELLO__ck_",
            },
        ]);
        base_1.ExecuteManager_Base.string_args_transform(task, job, (str) => console.log(str), database, 1);
        expect(job.string_args[0]).toBe("1000");
        expect(job.string_args[1]).toBe("9999");
    });
    test("Cronjob Key Testing", () => {
        expect(base_1.ExecuteManager_Base.get_number_global("e1", database)).toBe(12);
        expect(base_1.ExecuteManager_Base.get_number_global("n1", database)).toBe(7);
        expect(base_1.ExecuteManager_Base.get_number_global("b1.data.0.p", database)).toBe(5);
    });
});
