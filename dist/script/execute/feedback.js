"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteManager_Feedback = void 0;
const interface_1 = require("../../interface");
const base_1 = require("./base");
class ExecuteManager_Feedback extends base_1.ExecuteManager_Base {
    Analysis = (d) => {
        const targetn = this.current_nodes.find(x => x.uuid == d.c?.uuid);
        if (targetn == undefined) {
            this.messager_log("Not inside");
            return;
        }
        const typeMap = {
            'feedback_message': this.feedback_message,
            'feedback_job': this.feedback_job,
            'feedback_string': this.feedback_string,
            'feedback_boolean': this.feedback_boolean,
            'feedback_number': this.feedback_number,
            'feedback_object': this.feedback_object,
        };
        if (typeMap.hasOwnProperty(d.name)) {
            const castingFunc = typeMap[d.h.name];
            castingFunc(d.h.data, targetn, d.h.meta);
        }
        else {
            this.messager_log(`[Source Data Analysis] Decode failed, Unknowed header, name: ${d.name}, meta: ${d.h.meta}`);
        }
    };
    feedback_message = (data, source, meta) => {
        if (source == undefined) {
            this.messager_log("[Server Feedback Warn] source is none");
            return;
        }
        if (this.state == interface_1.ExecuteState.NONE) {
            this.messager_log("[Server Feedback Warn] state is none, should not received feedback");
            return;
        }
        this.messager_log(`[Execute] Single Received data: ${data.data}, cron length: ${this.current_cron.length}`);
        let index = 0;
        if (this.current_cron.length > 0 && meta != undefined) {
            const r = this.GetCronAndWork(meta, source);
            const cron = r[0];
            const work = r[1];
            if (cron != undefined && work != undefined) {
                index = cron.id;
            }
        }
        const d = {
            node_uuid: source.uuid,
            index: index,
            job_uuid: '',
            runtime_uuid: '',
            meta: 0,
            message: data.data
        };
        this.proxy?.feedbackMessage(d);
    };
    feedback_job = (data, source) => {
        if (source == undefined)
            return;
        if (this.state == interface_1.ExecuteState.NONE)
            return;
        this.jobstack = Math.max(this.jobstack - 1, 0);
        if (this.current_t == undefined) {
            console.error("Cannot feedback when task is null");
            return;
        }
        this.messager_log(`[Execute] Job Feedback: ${data.job_uuid} ${data.runtime_uuid} ${data.message} ${data.meta}`);
        if (this.current_job.length > 0) {
            const work = this.current_job.find(x => x.uuid == source.uuid && x.state == interface_1.ExecuteState.RUNNING);
            if (work == undefined) {
                console.error("Cannot find the feedback container, work", work);
                return;
            }
            data.index = 0;
            this.proxy?.executeJobFinish([work.job, 0, source.uuid, data.meta]);
            work.state = data.meta == 0 ? interface_1.ExecuteState.FINISH : interface_1.ExecuteState.ERROR;
            if (this.check_single_end()) {
                this.proxy?.executeSubtaskFinish([this.current_t, 0, source.uuid]);
                this.messager_log(`[Execute] Subtask finish: ${this.current_t.uuid}`);
            }
        }
        else if (this.current_cron.length > 0) {
            const r = this.GetCronAndWork(data.runtime_uuid, source);
            const cron = r[0];
            const work = r[1];
            if (cron == undefined || work == undefined) {
                console.error("Cannot find the feedback container, cron or work", data.runtime_uuid, cron, work);
                console.error("Full current cron instance", this.current_cron);
                return;
            }
            this.proxy?.executeJobFinish([work.job, cron.id, source.uuid, data.meta]);
            data.index = cron.id;
            work.state = data.meta == 0 ? interface_1.ExecuteState.FINISH : interface_1.ExecuteState.ERROR;
            if (this.check_cron_end(cron)) {
                this.proxy?.executeSubtaskFinish([this.current_t, cron.id, cron.uuid]);
                this.messager_log(`[Execute] Subtask finish: ${this.current_t.uuid}`);
                cron.uuid = '';
            }
        }
        const index = source.current_job.findIndex(x => x == data.runtime_uuid);
        if (index == -1) {
            this.messager_log(`[Execute] Cannot find runtime uuid: ${data.runtime_uuid} in websocket pack source: ${source.uuid}`);
        }
        else {
            source.current_job.splice(index, 1);
        }
        data.node_uuid = source.uuid;
        this.proxy?.feedbackMessage(data);
    };
    feedback_string = (data) => {
        if (this.current_p == undefined)
            return;
        const index = this.localPara.containers.findIndex(x => x.name == data.key && x.type == interface_1.DataType.String);
        if (index != -1)
            this.localPara.containers[index].value = data.value;
        else
            this.localPara.containers.push({ name: data.key, value: data.value, type: interface_1.DataType.String, hidden: true, runtimeOnly: true });
        this.messager_log(`[String Feedback] ${data.key} = ${data.value}`);
        const d = { name: 'set_database', data: this.localPara };
        this.current_nodes.forEach(x => x.websocket.send(JSON.stringify(d)));
        this.proxy?.updateDatabase(this.localPara);
    };
    feedback_number = (data) => {
        if (this.current_p == undefined)
            return;
        const index = this.localPara.containers.findIndex(x => x.name == data.key && x.type == interface_1.DataType.Number);
        if (index != -1)
            this.localPara.containers[index].value = data.value;
        else
            this.localPara.containers.push({ name: data.key, value: data.value, type: interface_1.DataType.Number, hidden: true, runtimeOnly: true });
        this.messager_log(`[Number Feedback] ${data.key} = ${data.value}`);
        const d = { name: 'set_database', data: this.localPara };
        this.current_nodes.forEach(x => x.websocket.send(JSON.stringify(d)));
        this.proxy?.updateDatabase(this.localPara);
    };
    feedback_object = (data) => {
        if (this.current_p == undefined)
            return;
        const index = this.localPara.containers.findIndex(x => x.name == data.key && x.type == interface_1.DataType.Object);
        if (index != -1)
            this.localPara.containers[index].value = data.value;
        else
            this.localPara.containers.push({ name: data.key, value: data.value, type: interface_1.DataType.Object, hidden: true, runtimeOnly: true });
        this.messager_log(`[Object Feedback] ${data.key}`);
        const d = { name: 'set_database', data: this.localPara };
        this.current_nodes.forEach(x => x.websocket.send(JSON.stringify(d)));
        this.proxy?.updateDatabase(this.localPara);
    };
    feedback_boolean = (data) => {
        if (this.current_p == undefined)
            return;
        const index = this.localPara.containers.findIndex(x => x.name == data.key && x.type == interface_1.DataType.Boolean);
        if (index != -1)
            this.localPara.containers[index].value = data.value;
        else
            this.localPara.containers.push({ name: data.key, value: data.value, type: interface_1.DataType.Boolean, hidden: true, runtimeOnly: true });
        this.messager_log(`[Boolean Feedback] ${data.key} = ${data.value}`);
        const d = { name: 'set_database', data: this.localPara };
        this.current_nodes.forEach(x => x.websocket.send(JSON.stringify(d)));
        this.proxy?.updateDatabase(this.localPara);
    };
    GetCronAndWork = (runtime, source) => {
        let cron = undefined;
        let work = undefined;
        const crons = this.current_cron.filter(x => x.uuid == source.uuid);
        for (let i = 0; i < crons.length; i++) {
            const c = crons[i];
            const a = c.work.find(x => x.runtime == runtime);
            if (a != undefined) {
                cron = c;
                work = a;
                break;
            }
        }
        return [cron, work];
    };
}
exports.ExecuteManager_Feedback = ExecuteManager_Feedback;
