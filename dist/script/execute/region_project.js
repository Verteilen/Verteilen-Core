"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region_Project = void 0;
const interface_1 = require("../../interface");
const region_task_1 = require("./region_task");
class Region_Project {
    target;
    project;
    runner;
    constructor(_target, _project) {
        this.project = _project;
        this.target = _target;
    }
    RUN = () => {
        if (this.runner == undefined && this.project.tasks.length > 0 && this.target.t_state != interface_1.ExecuteState.FINISH) {
            this.runner = new region_task_1.Region_Task(this.target, this.project.tasks[0]);
            this.target.messager_log(`[Execute] Task Start ${this.runner.task.uuid}`);
            this.target.messager_log(`[Execute] Task cron state: ${this.runner.task.cronjob}`);
        }
        else if (this.project.tasks.length == 0) {
            this.runner = undefined;
        }
        if (this.runner != undefined) {
            this.runner.RUN();
        }
        else {
            const index = this.target.current_projects.findIndex(x => x.uuid == this.project.uuid);
            if (index < this.target.current_projects.length - 1) {
                this.target.messager_log(`[Execute] Project Finish ${this.project.uuid}`);
                this.target.proxy?.executeProjectFinish([this.project, index]);
                this.target.runner = new Region_Project(this.target, this.target.current_projects[index + 1]);
                this.target.proxy?.executeProjectStart([this.project, index + 1]);
                this.target.t_state = interface_1.ExecuteState.NONE;
            }
            else {
                this.target.messager_log(`[Execute] Project Finish ${this.project.uuid}`);
                this.target.proxy?.executeProjectFinish([this.project, index]);
                this.target.runner = undefined;
                this.target.state = interface_1.ExecuteState.FINISH;
                this.target.t_state = interface_1.ExecuteState.NONE;
            }
        }
    };
}
exports.Region_Project = Region_Project;
