"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientExecute = void 0;
const child_process_1 = require("child_process");
const ws_1 = require("ws");
const interface_1 = require("../interface");
const i18n_1 = require("../plugins/i18n");
const client_1 = require("./client");
const database_1 = require("./database");
class ClientExecute {
    get count() {
        return this.workers.length;
    }
    constructor(_uuid, _messager, _messager_log, _client) {
        this.parameter = undefined;
        this.libraries = undefined;
        this.tag = '';
        this.workers = [];
        this.stop_job = () => {
            this.messager_log(`[Execute] Stop All: ${this.workers.length}`);
            this.workers.forEach(x => {
                x.stdin.cork();
                x.stdin.write("kill\n");
                x.stdin.uncork();
                x.stdin.end();
            });
        };
        this.execute_job = (job, source) => {
            this.messager_log(`[Execute] ${job.uuid}  ${job.category == interface_1.JobCategory.Execution ? i18n_1.i18n.global.t(interface_1.JobTypeText[job.type]) : i18n_1.i18n.global.t(interface_1.JobType2Text[job.type])}`, job.uuid, job.runtime_uuid);
            this.tag = job.uuid;
            this.execute_job_worker(job, source);
        };
        this.set_parameter = (data) => {
            this.parameter = data;
        };
        this.set_libs = (data) => {
            this.libraries = data;
        };
        this.set_string = (data) => {
            if (this.parameter == undefined)
                return;
            const index = this.parameter.containers.findIndex(x => x.name == data.key && x.type == interface_1.DataType.String);
            if (index != -1)
                this.parameter.containers[index].value = data.value;
            this.messager_log(`[Database string sync] ${data.key} = ${data.value}`);
        };
        this.set_number = (data) => {
            if (this.parameter == undefined)
                return;
            const index = this.parameter.containers.findIndex(x => x.name == data.key && x.type == interface_1.DataType.Number);
            if (index != -1)
                this.parameter.containers[index].value = data.value;
            this.messager_log(`[Database number sync] ${data.key} = ${data.value}`);
        };
        this.set_boolean = (data) => {
            if (this.parameter == undefined)
                return;
            const index = this.parameter.containers.findIndex(x => x.name == data.key && x.type == interface_1.DataType.Boolean);
            if (index != -1)
                this.parameter.containers[index].value = data.value;
            this.messager_log(`[Database boolean sync] ${data.key} = ${data.value}`);
        };
        this.uuid = _uuid;
        this.client = _client;
        this.messager = _messager;
        this.messager_log = _messager_log;
    }
    execute_job_worker(job, source) {
        const child = (0, child_process_1.spawn)(client_1.Client.workerPath(), [], {
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true,
            shell: true,
            env: Object.assign(Object.assign({}, process.env), { type: "JOB", job: JSON.stringify(job), plugin: JSON.stringify(this.client.plugins), parameter: JSON.stringify(this.parameter), libraries: JSON.stringify(this.libraries) })
        });
        child.stdin.setDefaultEncoding('utf-8');
        this.workers.push(child);
        const para = new database_1.ClientDatabase(source);
        let k = "";
        const workerFeedbackExec = (str) => {
            var _a;
            try {
                const msg = JSON.parse(str);
                if (msg.name == 'messager') {
                    this.messager(msg.data, job.uuid);
                }
                else if (msg.name == 'messager_log') {
                    this.messager_log(msg.data, job.uuid, job.runtime_uuid);
                }
                else if (msg.name == 'error') {
                    if (msg.data instanceof String)
                        this.messager_log(msg.data.toString(), job.uuid, job.runtime_uuid);
                    else
                        this.messager_log(JSON.stringify(msg.data), job.uuid, job.runtime_uuid);
                }
                else if (msg.name == 'feedbackstring') {
                    para.feedbackstring(msg.data);
                }
                else if (msg.name == 'feedbackboolean') {
                    para.feedbackboolean(msg.data);
                }
                else if (msg.name == 'feedbacknumber') {
                    para.feedbacknumber(msg.data);
                }
                else if (msg.name == 'feedbackobject') {
                    para.feedbackobject(msg.data);
                }
                else if (msg.name == 'feedbacklist') {
                    para.feedbacklist(msg.data);
                }
                else if (msg.name == 'feedbackselect') {
                    para.feedbackselect(msg.data);
                }
            }
            catch (err) {
                this.messager_log(`Error: ${str}`, job.uuid, job.runtime_uuid);
                this.messager_log(`(${(_a = err.code) !== null && _a !== void 0 ? _a : 'unknown'}) ${err.message}`, job.uuid, job.runtime_uuid);
            }
        };
        const workerFeedback = (str) => {
            for (let i = 0; i < str.length; i++) {
                if (str[i] != '\n')
                    k += str[i];
                else {
                    workerFeedbackExec(k);
                    k = '';
                }
            }
        };
        child.on('error', (err) => {
            this.messager_log(`[Worker Error] ${err}`, job.uuid, job.runtime_uuid);
        });
        child.on('exit', (code, signal) => {
            this.job_finish(code || 0, signal || '', job, source);
            const index = this.workers.findIndex(x => x == child);
            if (index != -1)
                this.workers.splice(index, 1);
        });
        child.on('message', (message, sendHandle) => {
            workerFeedback(message.toString());
        });
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            workerFeedback(chunk.toString());
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk) => {
            workerFeedback(chunk.toString());
        });
    }
    job_finish(code, signal, job, source) {
        this.messager_log(code == 0 ?
            `[Execute] Successfully: ${code} ${signal}` :
            `[Execute] Error: ${code} ${signal}`, job.uuid, job.runtime_uuid);
        const data = { job_uuid: job.uuid, runtime_uuid: job.runtime_uuid, meta: code, message: signal };
        const h = { name: 'feedback_job', data: data };
        if (source.readyState == ws_1.WebSocket.OPEN) {
            source.send(JSON.stringify(h));
        }
        this.tag = '';
    }
}
exports.ClientExecute = ClientExecute;
