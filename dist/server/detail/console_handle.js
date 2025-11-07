"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Console_Proxy = exports.receivedPack = void 0;
const interface_1 = require("../../interface");
const receivedPack = (model, record) => {
    const pass = model.manager.Register();
    if (pass == -1) {
        model.record.running = false;
        model.record.stop = true;
        return false;
    }
    model.record.projects = record.projects;
    model.record.nodes = record.nodes;
    model.record.project_state = model.record.projects.map(x => {
        return {
            uuid: x.uuid,
            state: interface_1.ExecuteState.NONE
        };
    });
    model.record.project_index = pass;
    model.record.project = record.projects[pass].uuid;
    model.record.task_index = 0;
    model.record.task_state = model.record.projects[0].tasks.map(x => {
        return {
            uuid: x.uuid,
            state: interface_1.ExecuteState.NONE
        };
    });
    model.record.task_state[0].state = interface_1.ExecuteState.RUNNING;
    model.record.task_detail = [];
    const task = model.record.projects[model.record.project_index]?.tasks[model.record.task_index];
    const count = task.cronjob ? (task?.jobs.length ?? 0) : 1;
    for (let i = 0; i < count; i++) {
        model.record.task_detail.push({
            index: i,
            node: "",
            message: [],
            state: interface_1.ExecuteState.NONE
        });
    }
    model.manager.Update();
    return true;
};
exports.receivedPack = receivedPack;
class Console_Proxy {
    model;
    constructor(_model) {
        this.model = _model;
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
    execute_project_start = (d) => {
        const index = d[1];
        if (index == -1)
            return;
        this.model.record.project = d[0].uuid;
        this.model.record.project_index = index;
        this.model.record.project_state[index].state = interface_1.ExecuteState.RUNNING;
        this.model.record.task_state = this.model.record.projects[index].tasks.map(x => {
            return {
                uuid: x.uuid,
                state: interface_1.ExecuteState.NONE
            };
        });
        this.model.record.task_detail = [];
        const task = this.model.record.projects[this.model.record.project_index]?.tasks[this.model.record.task_index];
        const count = task.cronjob ? (task?.jobs.length ?? 0) : 1;
        for (let i = 0; i < count; i++) {
            this.model.record.task_detail.push({
                index: i,
                node: "",
                message: [],
                state: interface_1.ExecuteState.NONE
            });
        }
        console.log("project start: ", this.model.record.projects.length, index);
    };
    execute_project_finish = (d) => {
        if (this.model.record.process_type >= 1) {
            this.model.record.running = false;
            this.model.record.stop = true;
        }
        const index = d[1];
        const size = this.model.record.projects.length;
        if (index == -1)
            return;
        this.model.record.project = "";
        this.model.record.project_state[index].state = interface_1.ExecuteState.FINISH;
        this.model.record.para = undefined;
        console.log("project finish: ", this.model.record.projects.length, index);
        if (index == size - 1) {
            this.model.record.command.push(['clean']);
        }
    };
    execute_task_start = (d) => {
        if (this.model.record.project_index == -1)
            return;
        const index = this.model.record.projects[this.model.record.project_index].tasks.findIndex(x => x.uuid == d[0].uuid);
        if (index == -1)
            return;
        this.model.record.useCron = d[0].cronjob;
        this.model.record.task = d[0].uuid;
        this.model.record.task_index = index;
        this.model.record.task_state[index].state = interface_1.ExecuteState.RUNNING;
        for (let i = 0; i < index; i++)
            this.model.record.task_state[i].state = interface_1.ExecuteState.FINISH;
        for (let i = index + 1; i < this.model.record.task_state.length; i++)
            this.model.record.task_state[i].state = interface_1.ExecuteState.NONE;
        this.model.record.task_detail = [];
        const p = this.model.record.projects[this.model.record.project_index];
        const t = p.tasks[this.model.record.task_index];
        const count = this.model.manager.get_task_state_count(t);
        for (let i = 0; i < count; i++) {
            this.model.record.task_detail.push({
                index: i,
                node: "",
                message: [],
                state: interface_1.ExecuteState.NONE
            });
        }
    };
    execute_task_finish = (d) => {
        if (this.model.record.process_type == 2) {
            this.model.record.running = false;
            this.model.record.stop = true;
        }
        if (this.model.record.project_index == -1)
            return;
        const index = this.model.record.projects[this.model.record.project_index].tasks.findIndex(x => x.uuid == d.uuid);
        if (index == -1)
            return;
        this.model.record.useCron = false;
        this.model.record.task = "";
        this.model.record.task_state[index].state = interface_1.ExecuteState.FINISH;
        if (index + 1 < this.model.record.task_state.length - 1) {
            this.model.record.task_state[index + 1].state = interface_1.ExecuteState.RUNNING;
        }
    };
    execute_subtask_start = (d) => {
        try {
            this.model.record.task_detail[d[1]].node = d[2] ?? '';
            this.model.record.task_detail[d[1]].state = interface_1.ExecuteState.RUNNING;
        }
        catch (error) {
            console.error(`execute_subtask_start`, error.message);
        }
    };
    execute_subtask_update = (d) => {
        if (this.model.record.task_detail.length > d[1]) {
            this.model.record.task_detail[d[1]].node = d[2];
            this.model.record.task_detail[d[1]].state = d[3];
        }
        else {
            console.error(`subtask_start ${d[1]} is out of range: ${this.model.record.task_detail.length}`);
        }
    };
    execute_subtask_end = (d) => {
        try {
            this.model.record.task_detail[d[1]].state = interface_1.ExecuteState.FINISH;
        }
        catch (error) {
            console.error(`execute_subtask_end`, error.message);
        }
    };
    execute_job_start = (d) => {
        if (this.model.record.project_index == -1)
            return;
        if (!this.model.record.useCron) {
            this.model.record.task_detail[0].node = d[2];
        }
    };
    execute_job_finish = (d) => {
        if (d[3] == 1) {
            const task = this.model.record.projects[this.model.record.project_index].tasks[this.model.record.task_index];
            const index = task.jobs.findIndex(x => x.uuid == d[0].uuid);
            if (index != -1 && task.jobs[index].category == interface_1.JobCategory.Condition) {
                const cr = task.jobs[index].number_args[0];
                if (cr == interface_1.ConditionResult.None)
                    return;
                this.model.record.command.push(['stop']);
                let timer;
                timer = setInterval(() => {
                    if (this.model.record.running == false) {
                        clearInterval(timer);
                        const state = (cr == interface_1.ConditionResult.ThrowTask || cr == interface_1.ConditionResult.ThrowProject) ? interface_1.ExecuteState.ERROR : interface_1.ExecuteState.SKIP;
                        const target = this.model.record.task_detail[d[1]];
                        if (target != undefined) {
                            target.state = state;
                        }
                        if (cr == interface_1.ConditionResult.Pause)
                            return;
                        if (cr == interface_1.ConditionResult.SkipProject || cr == interface_1.ConditionResult.ThrowProject) {
                            this.model.record.command.push(['skip', 0, state]);
                            if (this.model.record.project.length > 0) {
                                if (this.model.record.process_type == 0) {
                                    this.model.record.command.push(['execute', this.model.record.process_type]);
                                }
                            }
                        }
                        else if (cr == interface_1.ConditionResult.SkipTask || cr == interface_1.ConditionResult.ThrowTask) {
                            this.model.record.command.push(['skip', 1, state]);
                            if (this.model.record.project.length > 0) {
                                if (this.model.record.process_type == 0) {
                                    this.model.record.command.push(['execute', this.model.record.process_type]);
                                }
                            }
                        }
                    }
                }, 1000);
            }
        }
    };
    feedback_message = (d) => {
        if (d.index == undefined || d.index == -1)
            return;
        const container = this.model.record.task_detail[d.index];
        if (container != undefined) {
            container.message.push(d.message);
            if (container.message.length > interface_1.MESSAGE_LIMIT) {
                container.message.shift();
            }
        }
    };
    update_runtime_database = (d) => {
        this.model.record.para = d;
    };
}
exports.Console_Proxy = Console_Proxy;
