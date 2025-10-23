"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteManager_Base = void 0;
const uuid_1 = require("uuid");
const interface_1 = require("../../interface");
const util_parser_1 = require("./util_parser");
class ExecuteManager_Base {
    constructor(_name, _websocket_manager, _messager_log, _record) {
        this.current_t = undefined;
        this.current_p = undefined;
        this.current_projects = [];
        this.current_nodes = [];
        this.current_cron = [];
        this.current_job = [];
        this.current_multithread = 1;
        this.current_task_count = -1;
        this.state = interface_1.ExecuteState.NONE;
        this.t_state = interface_1.ExecuteState.NONE;
        this.jobstack = 0;
        this.first = false;
        this.libs = undefined;
        this.proxy = undefined;
        this.localPara = undefined;
        this.sync_local_para = (target) => {
            var _a;
            this.current_nodes.forEach(x => this.sync_para(target, x));
            (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.updateParameter(target);
        };
        this.sync_para = (target, source) => {
            const h = {
                name: 'set_parameter',
                channel: this.uuid,
                data: target
            };
            const h2 = {
                name: 'set_libs',
                channel: this.uuid,
                data: this.libs
            };
            source.websocket.send(JSON.stringify(h));
            source.websocket.send(JSON.stringify(h2));
        };
        this.release = (source) => {
            const h = {
                name: 'release',
                channel: this.uuid,
                data: 0
            };
            source.websocket.send(JSON.stringify(h));
        };
        this.check_all_cron_end = () => {
            return this.current_cron.filter(x => !this.check_cron_end(x)).length == 0;
        };
        this.check_cron_end = (cron) => {
            return cron.work.filter(x => x.state == interface_1.ExecuteState.RUNNING || x.state == interface_1.ExecuteState.NONE).length == 0;
        };
        this.check_single_end = () => {
            if (this.current_t == undefined)
                return false;
            return this.current_job.length == this.current_t.jobs.length &&
                this.current_job.filter(y => y.state == interface_1.ExecuteState.RUNNING || y.state == interface_1.ExecuteState.NONE).length == 0;
        };
        this.validation = (projects) => {
            if (this.websocket_manager.targets.length == 0) {
                this.messager_log(`[Execute State] The execute node does not exists`);
                return false;
            }
            projects.forEach(x => {
                x.task.forEach(t => {
                    var _a, _b, _c, _d, _e, _f;
                    if (t.cronjob) {
                        const index = (_b = (_a = x.parameter) === null || _a === void 0 ? void 0 : _a.containers.findIndex(x => x.name == t.cronjobKey && x.type == interface_1.DataType.Number)) !== null && _b !== void 0 ? _b : -1;
                        if (index == -1) {
                            this.messager_log(`[Execute:CronJob] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed parameter: \"${t.cronjobKey}\"`);
                            this.messager_log(`[Execute:CronJob] Cron task registerd key not found`);
                            return false;
                        }
                        else if (((_c = x.parameter) === null || _c === void 0 ? void 0 : _c.containers[index].value) == 0) {
                            this.messager_log(`[Execute:CronJob] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed parameter: \"${t.cronjobKey}\"`);
                            this.messager_log(`[Execute:CronJob] Cron task value must bigger than 0`);
                            return false;
                        }
                    }
                    if (t.cronjob && t.multi) {
                        const index = (_e = (_d = x.parameter) === null || _d === void 0 ? void 0 : _d.containers.findIndex(x => x.name == t.multiKey && x.type == interface_1.DataType.Number)) !== null && _e !== void 0 ? _e : -1;
                        if (index == -1) {
                            this.messager_log(`[Execute:Multi] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed parameter: \"${t.multiKey}\"`);
                            this.messager_log(`[Execute:Multi] Cron task registerd key not found`);
                            return false;
                        }
                        else if (((_f = x.parameter) === null || _f === void 0 ? void 0 : _f.containers[index].value) == 0) {
                            this.messager_log(`[Execute:Multi] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed parameter: \"${t.multiKey}\"`);
                            this.messager_log(`[Execute:Multi] Cron task value must bigger than 0`);
                            return false;
                        }
                    }
                });
            });
            return true;
        };
        this.filter_lib = (projects, lib) => {
            const r = { libs: [] };
            projects.forEach(x => {
                x.task.forEach(y => {
                    y.jobs.forEach(z => {
                        let code = -1;
                        if ((z.category == interface_1.JobCategory.Execution && z.type == interface_1.JobType.JAVASCRIPT) || (z.category == interface_1.JobCategory.Condition && z.type == interface_1.JobType2.JAVASCRIPT))
                            code = 0;
                        if (code == -1)
                            return;
                        z.string_args.forEach(s1 => {
                            const target = lib.libs.find(l => l.name == s1);
                            if (target != undefined)
                                r.libs.push(target);
                        });
                    });
                });
            });
            return JSON.parse(JSON.stringify(r));
        };
        this.get_task_multi_count = (t) => {
            const r = this.get_number(t.multiKey);
            return r == -1 ? 1 : r;
        };
        this.removeDups = (arr) => {
            return [...new Set(arr)];
        };
        this.get_idle = () => {
            return this.current_nodes.filter(x => this.check_socket_state(x) != interface_1.ExecuteState.RUNNING && x.websocket.readyState == 1);
        };
        this.get_idle_open = () => {
            return this.current_nodes.filter(x => x.websocket.readyState == 1);
        };
        this.check_socket_state = (target) => {
            return target.current_job.length == 0 ? interface_1.ExecuteState.NONE : interface_1.ExecuteState.RUNNING;
        };
        this.name = _name;
        this.uuid = (0, uuid_1.v6)();
        this.record = _record;
        this.websocket_manager = _websocket_manager;
        this.messager_log = _messager_log;
    }
    get_task_state_count(t) {
        if (t.setupjob)
            return this.current_nodes.length;
        if (t.cronjob)
            return this.get_number(t.cronjobKey);
        else
            return 1;
    }
    get_number(key) {
        return ExecuteManager_Base.get_number_global(key, this.localPara);
    }
    static get_number_global(key, localPara) {
        const e = ExecuteManager_Base.parameter_update(localPara);
        const a = e.replacePara(`%{${key}}%`);
        return Number(a);
    }
}
exports.ExecuteManager_Base = ExecuteManager_Base;
ExecuteManager_Base.string_args_transform = (task, job, messager_log, localPara, n) => {
    let e = ExecuteManager_Base.parameter_update(localPara, n);
    e = ExecuteManager_Base.property_update(task, e);
    for (let i = 0; i < job.string_args.length; i++) {
        const b = job.string_args[i];
        if (b == null || b == undefined || b.length == 0)
            continue;
        if (job.category == interface_1.JobCategory.Execution && job.type == interface_1.JobType.CREATE_FILE && i == 1)
            continue;
        job.string_args[i] = e.replacePara(job.string_args[i]);
    }
};
ExecuteManager_Base.property_update = (task, e) => {
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
ExecuteManager_Base.parameter_update = (localPara, n) => {
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
