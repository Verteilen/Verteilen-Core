"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region_Project = void 0;
const interface_1 = require("../../interface");
const region_task_1 = require("./region_task");
class Region_Project {
    constructor(_target, _project) {
        this.project = _project;
        this.target = _target;
        this.state = _project.task.length > 0 ? interface_1.ExecuteState.NONE : interface_1.ExecuteState.SKIP;
        if (_project.task.length > 0) {
            this.task = new region_task_1.Region_Task(_target, _project.task[0]);
        }
    }
}
exports.Region_Project = Region_Project;
