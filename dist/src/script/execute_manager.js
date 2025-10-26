"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteManager = void 0;
const interface_1 = require("../interface");
const runner_1 = require("./execute/runner");
class ExecuteManager extends runner_1.ExecuteManager_Runner {
    constructor() {
        super(...arguments);
        this.Update = () => {
            var _a;
            if (this.state != interface_1.ExecuteState.RUNNING)
                return;
            else if (this.current_p == undefined && this.current_projects.length > 0) {
                this.current_p = this.current_projects[0];
                this.messager_log(`[Execute] Project Start ${this.current_p.uuid}`);
                (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeProjectStart([this.current_p, 0]);
                this.SyncDatabase(this.current_p);
            }
            else if (this.current_p != undefined) {
                if (this.first)
                    this.first = false;
                this.ExecuteProject(this.current_p);
            }
        };
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
            if (this.current_projects.map(x => x.task.length).reduce((acc, cur) => acc + cur, 0) == 0) {
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
                if (x.task.length > 0) {
                    break;
                }
                else {
                    i++;
                }
            }
            return i;
        };
        this.Clean = () => {
            this.current_projects = [];
            this.current_p = undefined;
            this.current_t = undefined;
            this.current_cron = [];
            this.current_job = [];
            this.current_nodes = [];
            this.current_multithread = 1;
            this.state = interface_1.ExecuteState.NONE;
        };
        this.Release = () => {
            this.current_nodes.forEach(x => this.release(x));
        };
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
            var _a, _b;
            if (this.current_p == undefined)
                return;
            if (this.current_t == undefined)
                return;
            if (this.current_job.length > 0) {
                this.current_job = [];
                (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeSubtaskUpdate([this.current_t, 0, '', interface_1.ExecuteState.NONE]);
            }
            else if (this.current_cron.length > 0) {
                const target = this.current_cron[task_index];
                target.work.forEach(x => {
                    x.uuid = '';
                    x.state = interface_1.ExecuteState.NONE;
                });
                (_b = this.proxy) === null || _b === void 0 ? void 0 : _b.executeSubtaskUpdate([this.current_t, target.id - 1, '', interface_1.ExecuteState.NONE]);
            }
        };
        this.SkipProject = () => {
            return this.jumpProject(true);
        };
        this.PreviousProject = () => {
            return this.jumpProject(false);
        };
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
                return forward ? this.skipProjectFirst() : -2;
            }
            else {
                return this._jumpProject(forward);
            }
        };
        this.jumpTask = (forward) => {
            if (this.current_p == undefined)
                return -2;
            if (this.current_t == undefined) {
                return forward ? this.skipTaskFirst() : this.previousTaskFirst();
            }
            else {
                return forward ? this.skipTask() : this.previousTask();
            }
        };
        this.skipProjectFirst = () => {
            var _a;
            this.current_p = this.current_projects[1];
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
                if (forward) {
                    this.current_p = undefined;
                    this.current_t = undefined;
                    this.state = interface_1.ExecuteState.FINISH;
                    this.messager_log(`[Execute] Skip project to Finish !`);
                }
                else {
                    this.current_p = this.current_projects[0];
                    this.current_t = undefined;
                    this.state = interface_1.ExecuteState.RUNNING;
                    this.messager_log(`[Execute] Previous project to Begining !`);
                }
                return -1;
            }
            else {
                const next = forward ? this.current_projects[index + 1] : this.current_projects[index - 1];
                this.current_p = next;
                this.current_t = undefined;
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
            var _a;
            if (this.current_p.task.length > 0) {
                this.current_t = this.current_p.task[0];
                const taskCount = this.get_task_state_count(this.current_t);
                if (this.current_t.cronjob) {
                    this.Init_CronContainer(this.current_t, taskCount);
                }
                this.t_state = interface_1.ExecuteState.NONE;
                (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeTaskStart([this.current_t, taskCount]);
                return 0;
            }
            else {
                console.error("Project has no task, Skip failed");
                return -2;
            }
        };
        this.previousTaskFirst = () => {
            const index = this.current_projects.findIndex(x => x.uuid == this.current_p.uuid);
            if (index == 0) {
                this.current_t = undefined;
            }
            else {
                this.current_p = this.current_projects[index - 1];
                this.messager_log(`[Execute] Previous task ${index}. Jump Project: ${this.current_p.uuid}`);
            }
            this.current_job = [];
            this.t_state = interface_1.ExecuteState.NONE;
            return index;
        };
        this.skipTask = () => {
            var _a, _b, _c;
            const index = this.current_p.task.findIndex(x => x.uuid == this.current_t.uuid);
            if (index == this.current_p.task.length - 1) {
                (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeTaskFinish(this.current_t);
                this.current_t = undefined;
                this.messager_log(`[Execute] Skip task to Finish !`);
            }
            else {
                (_b = this.proxy) === null || _b === void 0 ? void 0 : _b.executeTaskFinish(this.current_t);
                this.current_t = this.current_p.task[index + 1];
                this.messager_log(`[Execute] Skip task ${index}. ${this.current_t.uuid}`);
                const taskCount = this.get_task_state_count(this.current_t);
                if (this.current_t.cronjob) {
                    this.Init_CronContainer(this.current_t, taskCount);
                }
                (_c = this.proxy) === null || _c === void 0 ? void 0 : _c.executeTaskStart([this.current_t, taskCount]);
            }
            this.current_job = [];
            this.t_state = interface_1.ExecuteState.NONE;
            return index;
        };
        this.previousTask = () => {
            var _a;
            const index = this.current_p.task.findIndex(x => x.uuid == this.current_t.uuid);
            this.current_t = this.current_p.task[index - 1];
            const taskCount = this.get_task_state_count(this.current_t);
            if (this.current_t.cronjob) {
                this.Init_CronContainer(this.current_t, taskCount);
            }
            this.t_state = interface_1.ExecuteState.NONE;
            (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeTaskStart([this.current_t, taskCount]);
            return 0;
        };
    }
}
exports.ExecuteManager = ExecuteManager;
