"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteManager_Runner = void 0;
const uuid_1 = require("uuid");
const interface_1 = require("../../interface");
const feedback_1 = require("./feedback");
const util_parser_1 = require("./util_parser");
class ExecuteManager_Runner extends feedback_1.ExecuteManager_Feedback {
    constructor() {
        super(...arguments);
        this.ExecuteProject = (project) => {
            var _a, _b, _c;
            if (this.current_t == undefined && project.task.length > 0 && this.t_state != interface_1.ExecuteState.FINISH) {
                this.current_t = project.task[0];
                this.messager_log(`[Execute] Task Start ${this.current_t.uuid}`);
                this.messager_log(`[Execute] Task cron state: ${this.current_t.cronjob}`);
                this.current_job = [];
                this.current_cron = [];
            }
            else if (project.task.length == 0) {
                this.current_t = undefined;
            }
            if (this.current_t != undefined) {
                this.ExecuteTask(project, this.current_t);
            }
            else {
                const index = this.current_projects.findIndex(x => x.uuid == project.uuid);
                if (index < this.current_projects.length - 1) {
                    this.messager_log(`[Execute] Project Finish ${this.current_p.uuid}`);
                    (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeProjectFinish([this.current_p, index]);
                    this.current_p = this.current_projects[index + 1];
                    (_b = this.proxy) === null || _b === void 0 ? void 0 : _b.executeProjectStart([this.current_p, index + 1]);
                    this.t_state = interface_1.ExecuteState.NONE;
                }
                else {
                    this.messager_log(`[Execute] Project Finish ${this.current_p.uuid}`);
                    (_c = this.proxy) === null || _c === void 0 ? void 0 : _c.executeProjectFinish([this.current_p, index]);
                    this.current_p = undefined;
                    this.state = interface_1.ExecuteState.FINISH;
                    this.t_state = interface_1.ExecuteState.NONE;
                }
            }
        };
        this.ExecuteTask = (project, task) => {
            var _a, _b;
            if (this.t_state == interface_1.ExecuteState.NONE) {
                this.t_state = interface_1.ExecuteState.RUNNING;
                this.current_multithread = task.multi ? this.get_task_multi_count(task) : 1;
                this.current_task_count = this.get_task_state_count(task);
            }
            let allJobFinish = false;
            const hasJob = task.jobs.length > 0;
            if (!hasJob) {
                (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeTaskStart([task, this.current_task_count]);
                (_b = this.proxy) === null || _b === void 0 ? void 0 : _b.executeTaskFinish(task);
                this.messager_log(`[Execute] Skip ! No job exists ${task.uuid}`);
                this.ExecuteTask_AllFinish(project, task);
                return;
            }
            if (task.setupjob) {
                allJobFinish = this.ExecuteTask_Setup(project, task, this.current_task_count);
            }
            else if (task.cronjob) {
                allJobFinish = this.ExecuteTask_Cronjob(project, task, this.current_task_count);
            }
            else {
                allJobFinish = this.ExecuteTask_Single(project, task, this.current_task_count);
            }
            if (allJobFinish) {
                this.ExecuteTask_AllFinish(project, task);
            }
        };
        this.ExecuteCronTask = (project, task, work, ns) => {
            var _a;
            if (ns.current_job.length < this.current_multithread) {
                const rindex = work.work.findIndex(x => x.state == interface_1.ExecuteState.RUNNING);
                if (rindex != -1)
                    return;
                const index = work.work.findIndex(x => x.state == interface_1.ExecuteState.NONE);
                if (index == 0)
                    (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeSubtaskStart([task, work.id, ns.uuid]);
                if (index == -1)
                    return;
                work.work[index].state = interface_1.ExecuteState.RUNNING;
                try {
                    const job = JSON.parse(JSON.stringify(task.jobs[index]));
                    job.index = work.id;
                    job.runtime_uuid = work.work[index].runtime;
                    this.ExecuteJob(project, task, job, ns, true);
                }
                catch (err) {
                    this.messager_log(`[ExecuteCronTask Error] UUID: ${task.uuid}, Job count: ${task.jobs.length}, index: ${index}`);
                }
            }
        };
        this.ExecuteJob = (project, task, job, wss, iscron) => {
            var _a;
            const n = job.index;
            this.messager_log(`[Execute] Job Start ${n}  ${job.uuid}  ${wss.uuid}`);
            (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeJobStart([job, n, wss.uuid]);
            ExecuteManager_Runner.string_args_transform(task, job, this.messager_log, this.localPara, n);
            const h = {
                name: 'execute_job',
                channel: this.uuid,
                data: job
            };
            wss.current_job.push(job.runtime_uuid);
            const stringdata = JSON.stringify(h);
            wss.websocket.send(stringdata);
            this.jobstack = this.jobstack + 1;
        };
        this.SyncDatabase = (p) => {
            this.localPara = JSON.parse(JSON.stringify(p.database));
            this.messager_log("[Execute] Sync Database !");
            this.messager_log("[Execute] Generate local database object");
            for (let i = 0; i < this.localPara.containers.length; i++) {
                if (this.localPara.containers[i].type == interface_1.DataType.Expression && this.localPara.containers[i].meta != undefined) {
                    const text = `%{${this.localPara.containers[i].meta}}%`;
                    const e = new util_parser_1.Util_Parser([...util_parser_1.Util_Parser.to_keyvalue(this.localPara)]);
                    this.localPara.containers[i].value = e.replacePara(text);
                }
            }
            this.sync_local_para(this.localPara);
        };
        this.Init_CronContainer = (task, taskCount) => {
            var _a;
            this.sync_local_para(this.localPara);
            this.current_cron = [];
            for (let i = 0; i < taskCount; i++) {
                const d = {
                    id: i,
                    uuid: "",
                    work: task.jobs.map(x => ({
                        uuid: x.uuid,
                        runtime: '',
                        state: interface_1.ExecuteState.NONE,
                        job: x
                    }))
                };
                d.work.forEach((x, j) => x.runtime = (0, uuid_1.v6)({}, undefined, i * taskCount + j));
                this.current_cron.push(d);
            }
            (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeTaskStart([task, taskCount]);
        };
    }
    ExecuteTask_Cronjob(project, task, taskCount) {
        let ns = this.get_idle_open();
        let allJobFinish = false;
        if (this.current_cron.length == 0) {
            this.Init_CronContainer(task, taskCount);
            this.messager_log(`[Execute] TaskCount: ${taskCount}`);
        }
        else {
            const worker = this.current_cron.filter(x => x.uuid != '').map(x => x.uuid);
            const counter = [];
            worker.forEach(uuid => {
                const index = counter.findIndex(x => x[0] == uuid);
                if (index == -1)
                    counter.push([uuid, 1]);
                else
                    counter[index][1] += 1;
            });
            const fullLoadUUID = counter.filter(x => x[1] >= this.current_multithread).map(x => x[0]);
            ns = ns.filter(x => !fullLoadUUID.includes(x.uuid));
        }
        if (this.check_all_cron_end()) {
            allJobFinish = true;
        }
        else {
            const needs = this.current_cron.filter(x => x.uuid == '' && x.work.filter(y => y.state != interface_1.ExecuteState.FINISH && y.state != interface_1.ExecuteState.ERROR).length > 0);
            const min = Math.min(needs.length, ns.length);
            for (let i = 0; i < min; i++) {
                needs[i].uuid = ns[i].uuid;
            }
            const single = this.current_cron.filter(x => x.uuid != '');
            for (var cronwork of single) {
                const index = this.current_nodes.findIndex(x => x.uuid == cronwork.uuid);
                if (index != -1) {
                    this.ExecuteCronTask(project, task, cronwork, this.current_nodes[index]);
                }
            }
        }
        return allJobFinish;
    }
    ExecuteTask_Single(project, task, taskCount) {
        var _a, _b;
        let allJobFinish = false;
        let ns = [];
        if (this.current_job.length > 0) {
            const last = this.current_nodes.find(x => x.uuid == this.current_job[0].uuid);
            if (last == undefined) {
                ns = this.get_idle();
                this.current_job = [];
            }
            else {
                ns = [last];
                if (ns[0].websocket.readyState != 1) {
                    ns = this.get_idle();
                    this.current_job = [];
                }
            }
        }
        else {
            this.sync_local_para(this.localPara);
            ns = this.get_idle();
            if (ns.length > 0) {
                (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeTaskStart([task, taskCount]);
                (_b = this.proxy) === null || _b === void 0 ? void 0 : _b.executeSubtaskStart([task, 0, ns[0].uuid]);
            }
        }
        if (ns.length > 0 && ns[0].websocket.readyState == 1 && this.check_socket_state(ns[0]) != interface_1.ExecuteState.RUNNING) {
            if (this.check_single_end()) {
                allJobFinish = true;
            }
            else {
                if (this.current_job.length != task.jobs.length) {
                    const job = JSON.parse(JSON.stringify(task.jobs[this.current_job.length]));
                    const runtime = (0, uuid_1.v6)();
                    this.current_job.push({
                        uuid: ns[0].uuid,
                        runtime: runtime,
                        state: interface_1.ExecuteState.RUNNING,
                        job: job
                    });
                    job.index = 0;
                    job.runtime_uuid = runtime;
                    this.ExecuteJob(project, task, job, ns[0], false);
                }
            }
        }
        return allJobFinish;
    }
    ExecuteTask_Setup(project, task, taskCount) {
        let ns = this.get_idle_open();
        let allJobFinish = false;
        if (this.current_cron.length == 0) {
            this.Init_CronContainer(task, taskCount);
            this.messager_log(`[Execute] TaskCount: ${taskCount}`);
            for (let i = 0; i < this.current_cron.length; i++) {
                this.current_cron[i].uuid = this.current_nodes[i].uuid;
            }
        }
        if (this.check_all_cron_end()) {
            allJobFinish = true;
        }
        else {
            const single = this.current_cron.filter(x => x.uuid != '');
            for (var cronwork of single) {
                const index = this.current_nodes.findIndex(x => x.uuid == cronwork.uuid);
                if (index != -1) {
                    this.ExecuteCronTask(project, task, cronwork, this.current_nodes[index]);
                }
            }
        }
        return allJobFinish;
    }
    ExecuteTask_AllFinish(project, task) {
        var _a;
        (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.executeTaskFinish(task);
        this.messager_log(`[Execute] Task Finish ${task.uuid}`);
        const index = project.task.findIndex(x => x.uuid == task.uuid);
        if (index == project.task.length - 1) {
            this.current_t = undefined;
            this.t_state = interface_1.ExecuteState.FINISH;
        }
        else {
            this.current_t = project.task[index + 1];
            this.t_state = interface_1.ExecuteState.NONE;
        }
        this.current_job = [];
        this.current_cron = [];
    }
}
exports.ExecuteManager_Runner = ExecuteManager_Runner;
