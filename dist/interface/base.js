"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDefaultJob = exports.CreateDefaultTask = exports.CreateDefaultProject = void 0;
const enum_1 = require("./enum");
const uuid_1 = require("uuid");
const CreateDefaultProject = () => {
    return {
        uuid: (0, uuid_1.v6)(),
        title: "",
        description: "",
        tasks: [],
        tasks_uuid: [],
        database_uuid: ""
    };
};
exports.CreateDefaultProject = CreateDefaultProject;
const CreateDefaultTask = () => {
    return {
        uuid: (0, uuid_1.v6)(),
        title: "Default",
        description: "",
        setupjob: false,
        cronjob: false,
        cronjobKey: "",
        multi: false,
        multiKey: "",
        properties: [],
        jobs: [],
        jobs_uuid: [],
    };
};
exports.CreateDefaultTask = CreateDefaultTask;
const CreateDefaultJob = () => {
    return {
        uuid: (0, uuid_1.v6)(),
        category: enum_1.JobCategory.Execution,
        type: enum_1.JobType.JAVASCRIPT,
        script: "",
        string_args: [],
        number_args: [],
        boolean_args: [],
        id_args: [],
    };
};
exports.CreateDefaultJob = CreateDefaultJob;
