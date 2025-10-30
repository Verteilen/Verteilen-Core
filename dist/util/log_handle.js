"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util_Server_Log_Proxy = void 0;
const uuid_1 = require("uuid");
const interface_1 = require("../interface");
const fs = __importStar(require("fs"));
class Util_Server_Log_Proxy {
    model;
    logs;
    preference;
    task_index = 0;
    uuid = '';
    get target_log() {
        return this.logs.logs.find(x => x.uuid == this.uuid);
    }
    constructor(_model, _log, _preference) {
        this.model = _model;
        this.logs = _log;
        this.preference = _preference;
    }
    get execute_proxy() {
        const d = {
            executeProjectStart: (data) => { this.execute_project_start(data); },
            executeProjectFinish: (data) => { this.execute_project_finish(data); },
            executeTaskStart: (data) => { this.execute_task_start(data); },
            executeTaskFinish: (data) => { this.execute_task_finish(data); },
            executeSubtaskStart: (data) => { this.execute_subtask_start(data); },
            executeSubtaskUpdate: (data) => { this.execute_subtask_update(data); },
            executeSubtaskFinish: (data) => { this.execute_subtask_end(data); },
            executeJobStart: (data) => { this.execute_job_start(data); },
            executeJobFinish: (data) => { this.execute_job_finish(data); },
            feedbackMessage: (data) => { this.feedback_message(data); },
            updateDatabase: (data) => { this.update_runtime_database(data); }
        };
        return d;
    }
    execute_project_start = async (d) => {
        const target = this.model.record.projects[this.model.record.project_index];
        const title = await this.getnewname(target.title);
        this.uuid = (0, uuid_1.v6)();
        const newlog = {
            uuid: this.uuid,
            filename: title,
            dirty: true,
            output: this.preference.log,
            project: target,
            state: interface_1.ExecuteState.RUNNING,
            start_timer: Date.now(),
            database: d[0].database,
            end_timer: 0,
            logs: target.tasks.map(x => {
                return {
                    start_timer: 0,
                    end_timer: 0,
                    task_state: {
                        uuid: x.uuid,
                        state: interface_1.ExecuteState.NONE
                    },
                    task_detail: []
                };
            })
        };
        this.logs.logs = [newlog].concat(this.logs.logs);
    };
    execute_project_finish = (d) => {
        if (this.target_log == undefined)
            return;
        this.target_log.state = interface_1.ExecuteState.FINISH;
        this.target_log.end_timer = Date.now();
        this.target_log.dirty = true;
    };
    execute_task_start = (d) => {
        if (this.target_log == undefined)
            return;
        const index = this.target_log.project.tasks.findIndex(x => x.uuid == d[0].uuid);
        if (index == -1)
            return;
        this.task_index = index;
        this.target_log.logs[this.task_index].task_detail = [];
        const p = this.model.record.projects[this.model.record.project_index];
        const t = p.tasks[this.task_index];
        const count = this.model.manager.get_task_state_count(t);
        for (let i = 0; i < count; i++) {
            this.target_log.logs[this.task_index].task_detail.push({
                index: i,
                node: "",
                message: [],
                state: interface_1.ExecuteState.NONE
            });
        }
        if (this.target_log.logs.length > this.task_index) {
            this.target_log.logs[this.task_index].task_state.state = interface_1.ExecuteState.RUNNING;
            this.target_log.logs[this.task_index].start_timer = Date.now();
            this.target_log.dirty = true;
        }
    };
    execute_task_finish = (d) => {
        if (this.target_log == undefined)
            return;
        if (this.target_log.logs.length > this.task_index) {
            this.target_log.logs[this.task_index].task_state.state = interface_1.ExecuteState.FINISH;
            this.target_log.logs[this.task_index].end_timer = Date.now();
            this.target_log.dirty = true;
        }
    };
    execute_subtask_start = (d) => {
        if (this.target_log == undefined)
            return;
        if (this.target_log.logs[this.task_index].task_detail.length > d[1]) {
            this.target_log.logs[this.task_index].task_detail[d[1]].state = interface_1.ExecuteState.RUNNING;
            this.target_log.dirty = true;
        }
    };
    execute_subtask_update = (d) => {
        if (this.target_log == undefined)
            return;
        if (this.target_log.logs[this.task_index].task_detail.length > d[1]) {
            this.target_log.logs[this.task_index].task_detail[d[1]].state = d[3];
            this.target_log.dirty = true;
        }
    };
    execute_subtask_end = (d) => {
        if (this.target_log == undefined)
            return;
        if (this.target_log.logs[this.task_index].task_detail.length > d[1]) {
            this.target_log.logs[this.task_index].task_detail[d[1]].state = interface_1.ExecuteState.FINISH;
            this.target_log.dirty = true;
        }
    };
    execute_job_start = (d) => {
    };
    execute_job_finish = (d) => {
        if (this.target_log == undefined)
            return;
        if (d[3] == 1) {
            const currentLog = this.target_log;
            const task = currentLog.project.tasks[this.task_index];
            const index = task.jobs.findIndex(x => x.uuid == d[0].uuid);
            if (index != -1 && task.jobs[index].category == interface_1.JobCategory.Condition) {
                const cr = task.jobs[index].number_args[0];
                if (cr == interface_1.ConditionResult.None)
                    return;
                const state = (cr == interface_1.ConditionResult.ThrowTask || cr == interface_1.ConditionResult.ThrowProject) ? interface_1.ExecuteState.ERROR : interface_1.ExecuteState.SKIP;
                const target = this.model.record.task_detail[d[1]];
                if (target != undefined) {
                    target.state = state;
                }
                currentLog.logs[this.task_index].task_state.state = state;
                if (cr == interface_1.ConditionResult.Pause)
                    return;
                if (cr == interface_1.ConditionResult.SkipProject || cr == interface_1.ConditionResult.ThrowProject) {
                    currentLog.state = state;
                }
            }
        }
    };
    feedback_message = (d) => {
        if (this.target_log == undefined)
            return;
        if (d.index == undefined || d.index == -1)
            return;
        if (this.target_log == undefined)
            return;
        if (this.target_log.logs[this.task_index].task_detail.length > d.index) {
            this.target_log.logs[this.task_index].task_detail[d.index].message.push(d.message);
            this.target_log.dirty = true;
        }
        else {
            console.warn("Try access message by index but failed: ", d);
        }
    };
    update_runtime_database = (d) => {
        if (this.target_log != undefined) {
            this.target_log.database = d;
            this.target_log.dirty = true;
        }
    };
    getnewname = async (name) => {
        const root = "data/log";
        let count = 0;
        let filename = name;
        let p = `${root}/${filename}`;
        while (fs.existsSync(p + ".json")) {
            count = count + 1;
            filename = `${name} ${count}`;
            p = `${root}/${filename}`;
        }
        return filename;
    };
}
exports.Util_Server_Log_Proxy = Util_Server_Log_Proxy;
