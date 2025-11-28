"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteManager = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
//
//  ? Task scheduler worker
//  ? Most important part of the game
//
const interface_1 = require("../interface");
const region_project_1 = require("./execute/region_project");
const region_task_1 = require("./execute/region_task");
const runner_1 = require("./execute/runner");
/**
 * Cluster server calculation worker\
 * The most important worker in the entire application
 */
class ExecuteManager extends runner_1.ExecuteManager_Runner {
    constructor() {
        super(...arguments);
        /**
         * The update function for let this worker start each iteration
         */
        this.Update = () => {
            var _a;
            // Only works when state is set to running
            if (this.state != interface_1.ExecuteState.RUNNING)
                return;
            else if (this.runner == undefined && this.current_projects.length > 0) {
                this.runner = new region_project_1.Region_Project(this, this.current_projects[0]);
                this.messager_log(`[Execute] Project Start ${this.runner.project.uuid}`);
                (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeProjectStart([this.runner.project, 0]);
                this.SyncDatabase(this.runner.project);
            }
            else if (this.runner != undefined) {
                if (this.first)
                    this.first = false;
                this.runner.RUN();
            }
        };
        /**
         * Pause has been called
         */
        this.Stop = () => {
            this.current_nodes.forEach(x => {
                const h = {
                    name: 'stop_job',
                    message: 'Stop All Jobs',
                    data: {}
                };
                x.websocket.send(JSON.stringify(h));
            });
            this.jobstack = 0;
            this.current_nodes.forEach(x => x.current_job = []);
        };
        /**
         * Register projects to worker\
         * If failed register, the buffer will remind empty
         * @param projects Target
         * @returns -1: register failed, 0: successfully
         */
        this.Register = (lib) => {
            this.current_projects = this.record.projects;
            this.current_nodes = [];
            this.record.nodes.forEach(x => {
                const n = this.websocket_manager.targets.find(y => y.uuid == x.uuid);
                if (n != undefined)
                    this.current_nodes.push(n);
            });
            this.messager_log(`[Execute] Start executing, Project count: ${this.current_projects.length}, Node count: ${this.current_nodes.length}`);
            if (this.state == interface_1.ExecuteState.RUNNING) {
                this.messager_log(`[Execute] Init error, There are projects being execute right now`);
                return -1;
            }
            if (this.current_nodes.length == 0) {
                this.messager_log(`[Execute] Node count should be bigger than one`);
                return -1;
            }
            if (this.current_projects.map(x => x.tasks.length).reduce((acc, cur) => acc + cur, 0) == 0) {
                this.messager_log(`[Execute] No task can be executing`);
                return -1;
            }
            if (!this.validation(this.current_projects)) {
                this.messager_log(`[Execute] Init failed, Format checking error`);
                return -1;
            }
            if (lib != undefined)
                this.libs = this.filter_lib(this.record.projects, lib);
            else
                this.libs = { libs: [] };
            this.state = interface_1.ExecuteState.RUNNING;
            this.messager_log(`[Execute] Init successfully, Enter process right now, length: ${this.current_projects.length}`);
            let i = 0;
            for (const x of this.current_projects) {
                if (x.tasks.length > 0) {
                    break;
                }
                else {
                    i++;
                }
            }
            return i;
        };
        /**
         * This will reset the state, and emppty all the buffer
         */
        this.Clean = () => {
            this.current_projects = [];
            this.runner = undefined;
            this.current_nodes = [];
            this.state = interface_1.ExecuteState.NONE;
        };
        /**
         * Tell clients release lib and database data
         */
        this.Release = () => {
            this.current_nodes.forEach(x => this.release(x));
        };
        /**
         * When new connection (Node) has benn connected
         * @param source Target
         */
        this.NewConnection = (source) => {
            if (this.state == interface_1.ExecuteState.RUNNING && this.localPara != undefined) {
                this.sync_para(this.localPara, source);
            }
        };
        this.Disconnect = (source) => {
            var _a;
            if (this.current_p == undefined)
                return;
            if (this.current_t == undefined)
                return;
            if (this.current_job.length > 0) {
                const singleContainIt = this.current_job.filter(x => x.uuid == source.uuid && x.state == interface_1.ExecuteState.RUNNING);
                singleContainIt.forEach((x, index) => {
                    x.uuid = '';
                    x.state = interface_1.ExecuteState.NONE;
                });
                (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeSubtaskUpdate([this.current_t, 0, '', interface_1.ExecuteState.NONE]);
            }
            else if (this.current_cron.length > 0) {
                const cronContainIt = this.current_cron.filter(x => x.work.filter(y => y.state == interface_1.ExecuteState.RUNNING && y.uuid == source.uuid).length > 0);
                cronContainIt.forEach(element => {
                    var _a;
                    element.work.forEach(x => {
                        x.uuid = '';
                        x.state = interface_1.ExecuteState.NONE;
                    });
                    (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeSubtaskUpdate([this.current_t, element.id - 1, '', interface_1.ExecuteState.NONE]);
                });
            }
            source.current_job = [];
        };
        this.ClearState = (task_index) => {
            var _a, _b, _c;
            if (this.current_p == undefined)
                return;
            if (this.current_t == undefined)
                return;
            if (this.current_job.length > 0) {
                if ((_a = this.runner) === null || _a === void 0 ? void 0 : _a.runner)
                    this.runner.runner.job = [];
                (_b = this.proxy) === null || _b === void 0 ? void 0 : _b.executeSubtaskUpdate([this.current_t, 0, '', interface_1.ExecuteState.NONE]);
            }
            else if (this.current_cron.length > 0) {
                const target = this.current_cron[task_index];
                target.work.forEach(x => {
                    x.uuid = '';
                    x.state = interface_1.ExecuteState.NONE;
                });
                (_c = this.proxy) === null || _c === void 0 ? void 0 : _c.executeSubtaskUpdate([this.current_t, target.id - 1, '', interface_1.ExecuteState.NONE]);
            }
        };
        /**
         * When user trying to skip project
         * @returns The index of the project
         * -1: Skip to finish
         * -2: Skip failed
         */
        this.SkipProject = () => {
            return this.jumpProject(true);
        };
        this.PreviousProject = () => {
            return this.jumpProject(false);
        };
        /**
         * When user trying to skip task
         * @returns The index of the task
         * -1: Skip to finish
         * -2: Skip failed
         */
        this.SkipTask = () => {
            return this.jumpTask(true);
        };
        this.PreviousTask = () => {
            return this.jumpTask(false);
        };
        this.SkipSubTask = (v) => {
            if (this.current_p == undefined) {
                console.error("No project exist, Skip failed");
                return -2;
            }
            if (this.current_t == undefined) {
                console.error("Project has no task, Skip failed");
                return -2;
            }
            else {
                if (!this.current_t.cronjob) {
                    return this.SkipTask();
                }
                const min = Math.min(v, this.current_cron.length);
                for (let i = 0; i < min; i++) {
                    const ps = this.current_cron[i].work.filter(y => y.state != interface_1.ExecuteState.FINISH && y.state != interface_1.ExecuteState.ERROR);
                    ps.forEach(x => x.state = interface_1.ExecuteState.FINISH);
                }
                return min;
            }
        };
        this.jumpProject = (forward) => {
            if (this.current_projects.length == 0) {
                console.error("There is no project exists");
                return -2;
            }
            if (this.current_p == undefined) {
                // Not yet start
                return forward ? this.skipProjectFirst() : -2;
            }
            else {
                // When it's in the processing stage
                // Let's find the current processing project, and increments it's index for it
                return this._jumpProject(forward);
            }
        };
        this.jumpTask = (forward) => {
            // There is no project exists
            if (this.current_p == undefined)
                return -2;
            if (this.current_t == undefined) {
                // If we are in the start
                return forward ? this.skipTaskFirst() : this.previousTaskFirst();
            }
            else {
                // When it's in the processing stage
                // Let's find the current processing task, and increments it's index for it
                return forward ? this.skipTask() : this.previousTask();
            }
        };
        this.skipProjectFirst = () => {
            var _a;
            this.runner = new region_project_1.Region_Project(this, this.current_projects[1]);
            (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeProjectStart([this.current_p, 1]);
            this.SyncDatabase(this.current_p);
            this.state = interface_1.ExecuteState.RUNNING;
            return 1;
        };
        this._jumpProject = (forward) => {
            var _a, _b;
            const index = this.current_projects.findIndex(x => x.uuid == this.current_p.uuid);
            if (forward)
                (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeProjectFinish([this.current_p, index]);
            const atend = forward ? index == this.current_projects.length - 1 : index == 0;
            if (atend) {
                // If it's last project
                if (forward) {
                    this.runner = undefined;
                    this.state = interface_1.ExecuteState.FINISH;
                    this.messager_log(`[Execute] Skip project to Finish !`);
                }
                else {
                    this.runner = new region_project_1.Region_Project(this, this.current_projects[0]);
                    this.state = interface_1.ExecuteState.RUNNING;
                    this.messager_log(`[Execute] Previous project to Begining !`);
                }
                return -1;
            }
            else {
                const next = forward ? this.current_projects[index + 1] : this.current_projects[index - 1];
                this.runner = new region_project_1.Region_Project(this, next);
                this.state = interface_1.ExecuteState.RUNNING;
                if (forward) {
                    this.messager_log(`[Execute] Skip project ${index}. ${this.current_p.uuid}`);
                }
                else {
                    this.messager_log(`[Execute] Previous project ${index}. ${this.current_p.uuid}`);
                }
                (_b = this.proxy) === null || _b === void 0 ? void 0 : _b.executeProjectStart([this.current_p, index + (forward ? 1 : -1)]);
                this.SyncDatabase(this.current_p);
                return index;
            }
        };
        this.skipTaskFirst = () => {
            var _a, _b, _c;
            if (this.current_p.tasks.length > 0 && this.runner != undefined) {
                this.runner.runner = new region_task_1.Region_Task(this, this.current_p.tasks[0]);
                const taskCount = this.get_task_state_count(this.current_t);
                if ((_a = this.current_t) === null || _a === void 0 ? void 0 : _a.cronjob) {
                    (_b = this.runner.runner) === null || _b === void 0 ? void 0 : _b.Init_CronContainer(taskCount);
                }
                this.t_state = interface_1.ExecuteState.NONE;
                (_c = this.proxy) === null || _c === void 0 ? void 0 : _c.executeTaskStart([this.current_t, taskCount]);
                return 0;
            }
            else {
                console.error("Project has no task, Skip failed");
                return -2;
            }
        };
        this.previousTaskFirst = () => {
            var _a, _b;
            const index = this.current_projects.findIndex(x => x.uuid == this.current_p.uuid);
            if (index == 0 && this.runner != undefined) {
                // If it's first task and first project
                this.runner.runner = undefined;
            }
            else {
                this.runner = new region_project_1.Region_Project(this, this.current_projects[index - 1]);
                this.messager_log(`[Execute] Previous task ${index}. Jump Project: ${(_a = this.current_p) === null || _a === void 0 ? void 0 : _a.uuid}`);
            }
            if ((_b = this.runner) === null || _b === void 0 ? void 0 : _b.runner)
                this.runner.runner.job = [];
            this.t_state = interface_1.ExecuteState.NONE;
            return index;
        };
        this.skipTask = () => {
            var _a, _b, _c, _d;
            const index = this.current_p.tasks.findIndex(x => x.uuid == this.current_t.uuid);
            if (this.runner) {
                if (index == this.current_p.tasks.length - 1) {
                    // If it's last task
                    (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeTaskFinish(this.current_t);
                    this.runner.runner = undefined;
                    this.messager_log(`[Execute] Skip task to Finish !`);
                }
                else {
                    (_b = this.proxy) === null || _b === void 0 ? void 0 : _b.executeTaskFinish(this.current_t);
                    this.runner.runner = new region_task_1.Region_Task(this, this.current_p.tasks[index + 1]);
                    this.messager_log(`[Execute] Skip task ${index}. ${this.current_t.uuid}`);
                    const taskCount = this.get_task_state_count(this.current_t);
                    if (this.current_t.cronjob) {
                        this.runner.runner.Init_CronContainer(taskCount);
                    }
                    (_c = this.proxy) === null || _c === void 0 ? void 0 : _c.executeTaskStart([this.current_t, taskCount]);
                }
            }
            if ((_d = this.runner) === null || _d === void 0 ? void 0 : _d.runner)
                this.runner.runner.job = [];
            this.t_state = interface_1.ExecuteState.NONE;
            return index;
        };
        this.previousTask = () => {
            var _a, _b;
            const index = this.current_p.tasks.findIndex(x => x.uuid == this.current_t.uuid);
            if ((_a = this.runner) === null || _a === void 0 ? void 0 : _a.runner) {
                this.runner.runner = new region_task_1.Region_Task(this, this.current_p.tasks[index - 1]);
                const taskCount = this.get_task_state_count(this.current_t);
                if (this.current_t.cronjob) {
                    this.runner.runner.Init_CronContainer(taskCount);
                }
                this.t_state = interface_1.ExecuteState.NONE;
                (_b = this.proxy) === null || _b === void 0 ? void 0 : _b.executeTaskStart([this.current_t, taskCount]);
            }
            return 0;
        };
    }
}
exports.ExecuteManager = ExecuteManager;
//# sourceMappingURL=execute_manager.js.map