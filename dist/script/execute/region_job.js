"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region_Job = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
const interface_1 = require("../../interface");
const util_parser_1 = require("./util_parser");
class Region_Job {
    constructor(target, task, job, wss) {
        this.RUN = () => {
            var _a;
            const n = this.job.index;
            this.target.messager_log(`[Execute] Job Start ${n}  ${this.job.uuid}  ${this.wss.uuid}`);
            (_a = this.target.proxy) === null || _a === void 0 ? void 0 : _a.executeJobStart([this.job, n, this.wss.uuid]);
            this.string_args_transform(this.task, this.job, this.target.localPara, n);
            const h = {
                name: 'execute_job',
                channel: this.target.uuid,
                data: this.job
            };
            this.wss.current_job.push(this.job.runtime_uuid);
            const stringdata = JSON.stringify(h);
            this.wss.socket.send(stringdata);
            this.target.jobstack = this.target.jobstack + 1;
        };
        this.string_args_transform = (task, job, localPara, n) => {
            let e = this.database_update(localPara, n);
            e = this.property_update(task, e);
            for (let i = 0; i < job.string_args.length; i++) {
                const b = job.string_args[i];
                if (b == null || b == undefined || b.length == 0)
                    continue;
                if (job.category == interface_1.JobCategory.Execution && job.type == interface_1.JobType.CREATE_FILE && i == 1)
                    continue;
                job.string_args[i] = e.replacePara(job.string_args[i]);
                //messager_log(`String replace: "${b}" -> "${job.string_args[i]}"`)
            }
        };
        this.property_update = (task, e) => {
            for (let j = 0; j < task.properties.length; j++) {
                const target = task.properties[j];
                const times = target.deep ? target.deep : 1;
                let act = target.expression;
                for (let k = 0; k < times; k++) {
                    act = e.replacePara(`%{${act}}%`);
                }
                e.paras.push({ key: task.properties[j].name, value: act });
            }
            return e;
        };
        this.database_update = (localPara, n) => {
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
        this.target = target;
        this.task = task;
        this.job = job;
        this.wss = wss;
    }
}
exports.Region_Job = Region_Job;
//# sourceMappingURL=region_job.js.map