"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region_Task = void 0;
const interface_1 = require("../../interface");
const region_subtask_1 = require("./region_subtask");
class Region_Task {
    target;
    state;
    task;
    subtask;
    constructor(_target, _task) {
        this.task = _task;
        this.target = _target;
        this.state = _task.jobs.length > 0 ? interface_1.ExecuteState.NONE : interface_1.ExecuteState.SKIP;
        if (_task.jobs.length > 0) {
            this.subtask = new region_subtask_1.Region_Subtask(_target);
        }
    }
}
exports.Region_Task = Region_Task;
