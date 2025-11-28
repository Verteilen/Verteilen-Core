"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region_Project = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
const interface_1 = require("../../interface");
const region_task_1 = require("./region_task");
class Region_Project {
    constructor(_target, _project) {
        this.RUN = () => {
            var _a, _b, _c;
            if (this.runner == undefined && this.project.tasks.length > 0 && this.target.t_state != interface_1.ExecuteState.FINISH) {
                // When we are just start it, the project run
                this.runner = new region_task_1.Region_Task(this.target, this.project.tasks[0]);
                this.target.messager_log(`[Execute] Task Start ${this.runner.task.uuid}`);
                this.target.messager_log(`[Execute] Task cron state: ${this.runner.task.cronjob}`);
            }
            else if (this.project.tasks.length == 0) {
                this.runner = undefined;
            }
            /**
             * In any case, if the task has value, this mean we are in the task stage, so, just ignore everything.\
             * Go for the task stage
             */
            if (this.runner != undefined) {
                this.runner.RUN();
            }
            else {
                /**
                 * If we are here, task is none by this case. This can only be
                 * * A: We are finish all the tasks, And there is no next project, So just mark as finish for entire process
                 * * B: We are finish all the tasks, Go to next project
                 */
                const index = this.target.current_projects.findIndex(x => x.uuid == this.project.uuid);
                if (index < this.target.current_projects.length - 1) {
                    // * Case A: Next project
                    this.target.messager_log(`[Execute] Project Finish ${this.project.uuid}`);
                    (_a = this.target.proxy) === null || _a === void 0 ? void 0 : _a.executeProjectFinish([this.project, index]);
                    this.target.runner = new Region_Project(this.target, this.target.current_projects[index + 1]);
                    (_b = this.target.proxy) === null || _b === void 0 ? void 0 : _b.executeProjectStart([this.project, index + 1]);
                    this.target.t_state = interface_1.ExecuteState.NONE;
                }
                else {
                    // * Case B: Finish entire thing
                    this.target.messager_log(`[Execute] Project Finish ${this.project.uuid}`);
                    (_c = this.target.proxy) === null || _c === void 0 ? void 0 : _c.executeProjectFinish([this.project, index]);
                    this.target.runner = undefined;
                    this.target.state = interface_1.ExecuteState.FINISH;
                    this.target.t_state = interface_1.ExecuteState.NONE;
                }
            }
        };
        this.project = _project;
        this.target = _target;
    }
}
exports.Region_Project = Region_Project;
//# sourceMappingURL=region_project.js.map