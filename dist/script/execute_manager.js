"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteManager = void 0;
const interface_1 = require("../interface");
const region_project_1 = require("./execute/region_project");
const region_task_1 = require("./execute/region_task");
const runner_1 = require("./execute/runner");
class ExecuteManager extends runner_1.ExecuteManager_Runner {
    Update = () => {
        if (this.state != interface_1.ExecuteState.RUNNING)
            return;
        else if (this.runner == undefined && this.current_projects.length > 0) {
            this.runner = new region_project_1.Region_Project(this, this.current_projects[0]);
            this.messager_log(`[Execute] Project Start ${this.runner.project.uuid}`);
            this.proxy?.executeProjectStart([this.runner.project, 0]);
            this.SyncDatabase(this.runner.project);
        }
        else if (this.runner != undefined) {
            if (this.first)
                this.first = false;
            this.runner.RUN();
        }
    };
    Stop = () => {
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
    Register = (lib) => {
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
    Clean = () => {
        this.current_projects = [];
        this.runner = undefined;
        this.current_nodes = [];
        this.state = interface_1.ExecuteState.NONE;
    };
    Release = () => {
        this.current_nodes.forEach(x => this.release(x));
    };
    NewConnection = (source) => {
        if (this.state == interface_1.ExecuteState.RUNNING && this.localPara != undefined) {
            this.sync_para(this.localPara, source);
        }
    };
    Disconnect = (source) => {
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
            this.proxy?.executeSubtaskUpdate([this.current_t, 0, '', interface_1.ExecuteState.NONE]);
        }
        else if (this.current_cron.length > 0) {
            const cronContainIt = this.current_cron.filter(x => x.work.filter(y => y.state == interface_1.ExecuteState.RUNNING && y.uuid == source.uuid).length > 0);
            cronContainIt.forEach(element => {
                element.work.forEach(x => {
                    x.uuid = '';
                    x.state = interface_1.ExecuteState.NONE;
                });
                this.proxy?.executeSubtaskUpdate([this.current_t, element.id - 1, '', interface_1.ExecuteState.NONE]);
            });
        }
        source.current_job = [];
    };
    ClearState = (task_index) => {
        if (this.current_p == undefined)
            return;
        if (this.current_t == undefined)
            return;
        if (this.current_job.length > 0) {
            if (this.runner?.runner)
                this.runner.runner.job = [];
            this.proxy?.executeSubtaskUpdate([this.current_t, 0, '', interface_1.ExecuteState.NONE]);
        }
        else if (this.current_cron.length > 0) {
            const target = this.current_cron[task_index];
            target.work.forEach(x => {
                x.uuid = '';
                x.state = interface_1.ExecuteState.NONE;
            });
            this.proxy?.executeSubtaskUpdate([this.current_t, target.id - 1, '', interface_1.ExecuteState.NONE]);
        }
    };
    SkipProject = () => {
        return this.jumpProject(true);
    };
    PreviousProject = () => {
        return this.jumpProject(false);
    };
    SkipTask = () => {
        return this.jumpTask(true);
    };
    PreviousTask = () => {
        return this.jumpTask(false);
    };
    SkipSubTask = (v) => {
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
    jumpProject = (forward) => {
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
    jumpTask = (forward) => {
        if (this.current_p == undefined)
            return -2;
        if (this.current_t == undefined) {
            return forward ? this.skipTaskFirst() : this.previousTaskFirst();
        }
        else {
            return forward ? this.skipTask() : this.previousTask();
        }
    };
    skipProjectFirst = () => {
        this.runner = new region_project_1.Region_Project(this, this.current_projects[1]);
        this.proxy?.executeProjectStart([this.current_p, 1]);
        this.SyncDatabase(this.current_p);
        this.state = interface_1.ExecuteState.RUNNING;
        return 1;
    };
    _jumpProject = (forward) => {
        const index = this.current_projects.findIndex(x => x.uuid == this.current_p.uuid);
        if (forward)
            this.proxy?.executeProjectFinish([this.current_p, index]);
        const atend = forward ? index == this.current_projects.length - 1 : index == 0;
        if (atend) {
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
            this.proxy?.executeProjectStart([this.current_p, index + (forward ? 1 : -1)]);
            this.SyncDatabase(this.current_p);
            return index;
        }
    };
    skipTaskFirst = () => {
        if (this.current_p.tasks.length > 0 && this.runner != undefined) {
            this.runner.runner = new region_task_1.Region_Task(this, this.current_p.tasks[0]);
            const taskCount = this.get_task_state_count(this.current_t);
            if (this.current_t?.cronjob) {
                this.runner.runner?.Init_CronContainer(taskCount);
            }
            this.t_state = interface_1.ExecuteState.NONE;
            this.proxy?.executeTaskStart([this.current_t, taskCount]);
            return 0;
        }
        else {
            console.error("Project has no task, Skip failed");
            return -2;
        }
    };
    previousTaskFirst = () => {
        const index = this.current_projects.findIndex(x => x.uuid == this.current_p.uuid);
        if (index == 0 && this.runner != undefined) {
            this.runner.runner = undefined;
        }
        else {
            this.runner = new region_project_1.Region_Project(this, this.current_projects[index - 1]);
            this.messager_log(`[Execute] Previous task ${index}. Jump Project: ${this.current_p?.uuid}`);
        }
        if (this.runner?.runner)
            this.runner.runner.job = [];
        this.t_state = interface_1.ExecuteState.NONE;
        return index;
    };
    skipTask = () => {
        const index = this.current_p.tasks.findIndex(x => x.uuid == this.current_t.uuid);
        if (this.runner) {
            if (index == this.current_p.tasks.length - 1) {
                this.proxy?.executeTaskFinish(this.current_t);
                this.runner.runner = undefined;
                this.messager_log(`[Execute] Skip task to Finish !`);
            }
            else {
                this.proxy?.executeTaskFinish(this.current_t);
                this.runner.runner = new region_task_1.Region_Task(this, this.current_p.tasks[index + 1]);
                this.messager_log(`[Execute] Skip task ${index}. ${this.current_t.uuid}`);
                const taskCount = this.get_task_state_count(this.current_t);
                if (this.current_t.cronjob) {
                    this.runner.runner.Init_CronContainer(taskCount);
                }
                this.proxy?.executeTaskStart([this.current_t, taskCount]);
            }
        }
        if (this.runner?.runner)
            this.runner.runner.job = [];
        this.t_state = interface_1.ExecuteState.NONE;
        return index;
    };
    previousTask = () => {
        const index = this.current_p.tasks.findIndex(x => x.uuid == this.current_t.uuid);
        if (this.runner?.runner) {
            this.runner.runner = new region_task_1.Region_Task(this, this.current_p.tasks[index - 1]);
            const taskCount = this.get_task_state_count(this.current_t);
            if (this.current_t.cronjob) {
                this.runner.runner.Init_CronContainer(taskCount);
            }
            this.t_state = interface_1.ExecuteState.NONE;
            this.proxy?.executeTaskStart([this.current_t, taskCount]);
        }
        return 0;
    };
}
exports.ExecuteManager = ExecuteManager;
