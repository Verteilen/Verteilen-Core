"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region_Task = void 0;
const interface_1 = require("../../interface");
const region_job_1 = require("./region_job");
const region_subtask_1 = require("./region_subtask");
const util_parser_1 = require("./util_parser");
const uuid_1 = require("uuid");
class Region_Task {
    target;
    task;
    multithread = 1;
    task_count = 0;
    cron = [];
    job = [];
    runners = [];
    jrunners = [];
    constructor(target, task) {
        this.target = target;
        this.task = task;
    }
    get project() {
        return this.target.current_p;
    }
    get parent() {
        return this.target.runner;
    }
    RUN = () => {
        if (this.target.t_state == interface_1.ExecuteState.NONE) {
            this.target.t_state = interface_1.ExecuteState.RUNNING;
            this.multithread = this.task.multi ? this.get_task_multi_count(this.task) : 1;
            this.task_count = this.get_task_state_count(this.task);
        }
        let allJobFinish = false;
        const hasJob = this.task.jobs.length > 0;
        if (!hasJob) {
            this.target.proxy?.executeTaskStart([this.task, this.task_count]);
            this.target.proxy?.executeTaskFinish(this.task);
            this.target.messager_log(`[Execute] Skip ! No job exists ${this.task.uuid}`);
            this.ExecuteTask_AllFinish(this.project, this.task);
            return;
        }
        if (this.task.setupjob) {
            allJobFinish = this.ExecuteTask_Setup(this.project, this.task, this.task_count);
        }
        else if (this.task.cronjob) {
            allJobFinish = this.ExecuteTask_Cronjob(this.project, this.task, this.task_count);
        }
        else {
            allJobFinish = this.ExecuteTask_Single(this.project, this.task, this.task_count);
        }
        if (allJobFinish) {
            this.ExecuteTask_AllFinish(this.project, this.task);
        }
    };
    ExecuteTask_Cronjob(project, task, taskCount) {
        let ns = this.get_idle_open();
        let allJobFinish = false;
        if (this.cron.length == 0) {
            this.Init_CronContainer(taskCount);
            this.target.messager_log(`[Execute] TaskCount: ${taskCount}`);
        }
        else {
            const worker = this.cron.filter(x => x.uuid != '').map(x => x.uuid);
            const counter = [];
            worker.forEach(uuid => {
                const index = counter.findIndex(x => x[0] == uuid);
                if (index == -1)
                    counter.push([uuid, 1]);
                else
                    counter[index][1] += 1;
            });
            const fullLoadUUID = counter.filter(x => x[1] >= this.multithread).map(x => x[0]);
            ns = ns.filter(x => !fullLoadUUID.includes(x.uuid));
        }
        if (this.check_all_cron_end()) {
            allJobFinish = true;
        }
        else {
            const needs = this.cron.filter(x => x.uuid == '' && x.work.filter(y => y.state != interface_1.ExecuteState.FINISH && y.state != interface_1.ExecuteState.ERROR).length > 0);
            const min = Math.min(needs.length, ns.length);
            for (let i = 0; i < min; i++) {
                needs[i].uuid = ns[i].uuid;
            }
            const single = this.cron.filter(x => x.uuid != '');
            for (var cronwork of single) {
                const index = this.target.current_nodes.findIndex(x => x.uuid == cronwork.uuid);
                if (index != -1) {
                    if (this.runners[cronwork.id] == undefined) {
                        this.runners[cronwork.id] = new region_subtask_1.Region_Subtask(this.target, cronwork, this.target.current_nodes[index]);
                    }
                    this.runners[cronwork.id]?.RUN();
                }
            }
        }
        return allJobFinish;
    }
    ExecuteTask_Single(project, task, taskCount) {
        let allJobFinish = false;
        let ns = [];
        if (this.target.current_job.length > 0) {
            const last = this.target.current_nodes.find(x => x.uuid == this.job[0].uuid);
            if (last == undefined) {
                ns = this.get_idle();
                this.job = [];
            }
            else {
                ns = [last];
                if (ns[0].websocket.readyState != 1) {
                    ns = this.get_idle();
                    this.job = [];
                }
            }
        }
        else {
            this.sync_local_para(this.target.localPara);
            ns = this.get_idle();
            if (ns.length > 0) {
                this.target.proxy?.executeTaskStart([task, taskCount]);
                this.target.proxy?.executeSubtaskStart([task, 0, ns[0].uuid]);
            }
        }
        if (ns.length > 0 && ns[0].websocket.readyState == 1 && this.check_socket_state(ns[0]) != interface_1.ExecuteState.RUNNING) {
            if (this.check_single_end()) {
                allJobFinish = true;
            }
            else {
                if (this.job.length != task.jobs.length) {
                    const job = JSON.parse(JSON.stringify(task.jobs[this.job.length]));
                    const runtime = (0, uuid_1.v6)();
                    this.job.push({
                        uuid: ns[0].uuid,
                        runtime: runtime,
                        state: interface_1.ExecuteState.RUNNING,
                        job: job
                    });
                    job.index = 0;
                    job.runtime_uuid = runtime;
                    const r = new region_job_1.Region_Job(this.target, task, job, ns[0]);
                    this.jrunners.push(r);
                    r.RUN();
                }
            }
        }
        return allJobFinish;
    }
    ExecuteTask_Setup(project, task, taskCount) {
        let ns = this.get_idle_open();
        let allJobFinish = false;
        if (this.cron.length == 0) {
            this.Init_CronContainer(taskCount);
            this.target.messager_log(`[Execute] TaskCount: ${taskCount}`);
            for (let i = 0; i < this.cron.length; i++) {
                this.cron[i].uuid = this.target.current_nodes[i].uuid;
            }
        }
        if (this.check_all_cron_end()) {
            allJobFinish = true;
        }
        else {
            const single = this.cron.filter(x => x.uuid != '');
            for (var cronwork of single) {
                const index = this.target.current_nodes.findIndex(x => x.uuid == cronwork.uuid);
                if (index != -1) {
                    if (this.runners[cronwork.id] == undefined) {
                        this.runners[cronwork.id] = new region_subtask_1.Region_Subtask(this.target, cronwork, this.target.current_nodes[index]);
                    }
                    this.runners[cronwork.id]?.RUN();
                }
            }
        }
        return allJobFinish;
    }
    ExecuteTask_AllFinish(project, task) {
        this.target.proxy?.executeTaskFinish(task);
        this.target.messager_log(`[Execute] Task Finish ${task.uuid}`);
        const index = project.tasks.findIndex(x => x.uuid == task.uuid);
        if (index == project.tasks.length - 1) {
            this.parent.runner = undefined;
            this.target.t_state = interface_1.ExecuteState.FINISH;
        }
        else {
            this.parent.runner = new Region_Task(this.target, project.tasks[index + 1]);
            this.target.t_state = interface_1.ExecuteState.NONE;
        }
        this.job = [];
        this.cron = [];
    }
    Init_CronContainer = (taskCount) => {
        this.sync_local_para(this.target.localPara);
        this.cron = [];
        for (let i = 0; i < taskCount; i++) {
            const d = {
                id: i,
                uuid: "",
                work: this.task.jobs.map(x => ({
                    uuid: x.uuid,
                    runtime: '',
                    state: interface_1.ExecuteState.NONE,
                    job: x
                }))
            };
            d.work.forEach((x, j) => x.runtime = (0, uuid_1.v6)({}, undefined, i * taskCount + j));
            this.cron.push(d);
            this.runners.push(undefined);
        }
        this.target.proxy?.executeTaskStart([this.task, taskCount]);
    };
    get_idle = () => {
        return this.target.current_nodes.filter(x => this.check_socket_state(x) != interface_1.ExecuteState.RUNNING && x.websocket.readyState == 1);
    };
    check_socket_state = (target) => {
        return target.current_job.length == 0 ? interface_1.ExecuteState.NONE : interface_1.ExecuteState.RUNNING;
    };
    sync_local_para = (target) => {
        this.target.current_nodes.forEach(x => this.sync_para(target, x));
        this.target.proxy?.updateDatabase(target);
    };
    sync_para = (target, source) => {
        const h = {
            name: 'set_database',
            channel: this.target.uuid,
            data: target
        };
        const h2 = {
            name: 'set_libs',
            channel: this.target.uuid,
            data: this.target.libs
        };
        source.websocket.send(JSON.stringify(h));
        source.websocket.send(JSON.stringify(h2));
    };
    get_idle_open = () => {
        return this.target.current_nodes.filter(x => x.websocket.readyState == 1);
    };
    check_all_cron_end = () => {
        return this.cron.filter(x => !this.check_cron_end(x)).length == 0;
    };
    check_cron_end = (cron) => {
        return cron.work.filter(x => x.state == interface_1.ExecuteState.RUNNING || x.state == interface_1.ExecuteState.NONE).length == 0;
    };
    check_single_end = () => {
        if (this.task == undefined)
            return false;
        return this.job.length == this.task.jobs.length &&
            this.job.filter(y => y.state == interface_1.ExecuteState.RUNNING || y.state == interface_1.ExecuteState.NONE).length == 0;
    };
    get_task_multi_count = (t) => {
        const r = this.get_number(t.multiKey);
        return r == -1 ? 1 : r;
    };
    get_task_state_count(t) {
        if (t.setupjob)
            return this.target.current_nodes.length;
        if (t.cronjob)
            return this.get_number(t.cronjobKey);
        else
            return 1;
    }
    get_number(key) {
        return this.get_number_global(key, this.target.localPara);
    }
    get_number_global(key, localPara) {
        const e = this.database_update(localPara);
        const a = e.replacePara(`%{${key}}%`);
        return Number(a);
    }
    database_update = (localPara, n) => {
        const e = new util_parser_1.Util_Parser([...util_parser_1.Util_Parser.to_keyvalue(localPara)]);
        if (n != undefined) {
            e.paras.push({ key: 'ck', value: n.toString() });
        }
        localPara.containers.forEach((c, index) => {
            if (c.type != interface_1.DataType.Expression)
                return;
            c.value = e.replacePara(`%{${c.meta}}%`);
            e.paras.find(p => p.key == c.name).value = c.value;
        });
        return e;
    };
}
exports.Region_Task = Region_Task;
