"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region_Subtask = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
const interface_1 = require("../../interface");
const region_job_1 = require("./region_job");
class Region_Subtask {
    constructor(target, work, ns) {
        this.RUN = () => {
            var _a;
            if (this.ns.current_job.length < this.target.current_multithread) {
                const rindex = this.work.work.findIndex(x => x.state == interface_1.ExecuteState.RUNNING);
                if (rindex != -1)
                    return;
                const index = this.work.work.findIndex(x => x.state == interface_1.ExecuteState.NONE);
                if (index == 0)
                    (_a = this.target.proxy) === null || _a === void 0 ? void 0 : _a.executeSubtaskStart([this.task, this.work.id, this.ns.uuid]);
                if (index == -1)
                    return;
                this.work.work[index].state = interface_1.ExecuteState.RUNNING;
                try {
                    const job = JSON.parse(JSON.stringify(this.task.jobs[index]));
                    job.index = this.work.id;
                    job.runtime_uuid = this.work.work[index].runtime;
                    if (this.runner == undefined) {
                        this.runner = new region_job_1.Region_Job(this.target, this.task, job, this.ns);
                    }
                    this.runner.RUN();
                }
                catch (err) {
                    this.target.messager_log(`[ExecuteCronTask Error] UUID: ${this.task.uuid}, Job count: ${this.task.jobs.length}, index: ${index}`);
                }
            }
        };
        this.target = target;
        this.work = work;
        this.ns = ns;
    }
    get task() {
        return this.target.current_t;
    }
}
exports.Region_Subtask = Region_Subtask;
//# sourceMappingURL=region_subtask.js.map