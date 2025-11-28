"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteManager_Base = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
const uuid_1 = require("uuid");
const interface_1 = require("../../interface");
const util_parser_1 = require("./util_parser");
/**
 * The base class of task scheduler, contain some basic funcationality
 */
class ExecuteManager_Base {
    constructor(_name, _websocket_manager, _messager_log, _record) {
        /**
         * The list of projects you want to process\
         * Each project UUID should be unique by now\
         * Prevent findIndex error, When there is repeat project source
         */
        this.current_projects = [];
        /**
         * The connection nodes list
         */
        this.current_nodes = [];
        /**
         * * NONE: Not yet start
         * * RUNNING: In the processing stage
         * * FINISH: Everything is finish processing
         */
        this.state = interface_1.ExecuteState.NONE;
        /**
         * * NONE: Not yet start
         * * RUNNING: In the processing stage
         * * FINISH: Everything is finish processing
         */
        this.t_state = interface_1.ExecuteState.NONE;
        this.jobstack = 0;
        this.first = false;
        this.libs = undefined;
        this.proxy = undefined;
        this.localPara = undefined;
        /**
         * This will let nodes update the database and lib
         * @param target
         */
        this.sync_local_para = (target) => {
            var _a;
            this.current_nodes.forEach(x => this.sync_para(target, x));
            (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.updateDatabase(target);
        };
        //#region Helper
        this.sync_para = (target, source) => {
            const h = {
                name: 'set_database',
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
        /**
         * Check all the cronjob is finish or not
         */
        this.check_all_cron_end = () => {
            return this.current_cron.filter(x => !this.check_cron_end(x)).length == 0;
        };
        /**
         * Check input cronjob is finish or not
         * @param cron target cronjob instance
         */
        this.check_cron_end = (cron) => {
            return cron.work.filter(x => x.state == interface_1.ExecuteState.RUNNING || x.state == interface_1.ExecuteState.NONE).length == 0;
        };
        /**
         * Check current single is finish or not
         */
        this.check_single_end = () => {
            if (this.current_t == undefined)
                return false;
            return this.current_job.length == this.current_t.jobs.length &&
                this.current_job.filter(y => y.state == interface_1.ExecuteState.RUNNING || y.state == interface_1.ExecuteState.NONE).length == 0;
        };
        //#endregion
        //#region Utility
        /**
         * Project format checking
         * @param projects
         * @returns
         */
        this.validation = (projects) => {
            if (this.websocket_manager.targets.length == 0) {
                this.messager_log(`[Execute State] The execute node does not exists`);
                return false;
            }
            projects.forEach(x => {
                x.tasks.forEach(t => {
                    var _a, _b, _c, _d, _e, _f;
                    if (t.cronjob) {
                        const index = (_b = (_a = x.database) === null || _a === void 0 ? void 0 : _a.containers.findIndex(x => x.name == t.cronjobKey && x.type == interface_1.DataType.Number)) !== null && _b !== void 0 ? _b : -1;
                        if (index == -1) {
                            this.messager_log(`[Execute:CronJob] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed database: \"${t.cronjobKey}\"`);
                            this.messager_log(`[Execute:CronJob] Cron task registerd key not found`);
                            return false;
                        }
                        else if (((_c = x.database) === null || _c === void 0 ? void 0 : _c.containers[index].value) == 0) {
                            this.messager_log(`[Execute:CronJob] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed database: \"${t.cronjobKey}\"`);
                            this.messager_log(`[Execute:CronJob] Cron task value must bigger than 0`);
                            return false;
                        }
                    }
                    if (t.cronjob && t.multi) {
                        const index = (_e = (_d = x.database) === null || _d === void 0 ? void 0 : _d.containers.findIndex(x => x.name == t.multiKey && x.type == interface_1.DataType.Number)) !== null && _e !== void 0 ? _e : -1;
                        if (index == -1) {
                            this.messager_log(`[Execute:Multi] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed database: \"${t.multiKey}\"`);
                            this.messager_log(`[Execute:Multi] Cron task registerd key not found`);
                            return false;
                        }
                        else if (((_f = x.database) === null || _f === void 0 ? void 0 : _f.containers[index].value) == 0) {
                            this.messager_log(`[Execute:Multi] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed database: \"${t.multiKey}\"`);
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
                x.tasks.forEach(y => {
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
        /**
         * Get the multi-core setting\
         * Find in the database setting
         * @param key The multi-core-key
         * @returns
         */
        this.get_task_multi_count = (t) => {
            const r = this.get_number(t.multiKey);
            return r == -1 ? 1 : r;
        };
        /**
         * Remove dups item in the list
         * @param arr
         * @returns
         */
        this.removeDups = (arr) => {
            return [...new Set(arr)];
        };
        /**
         * Filter out the idle and connection open nodes
         * @returns All idle and open connection nodes
         */
        this.get_idle = () => {
            return this.current_nodes.filter(x => this.check_socket_state(x) != interface_1.ExecuteState.RUNNING && x.websocket.readyState == 1);
        };
        /**
         * Filter out the connection open nodes
         * @returns All open connection nodes
         */
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
    /**
     * Current select project\
     * If it's undefined, it means:
     * * It's finish the current project
     * * It has not start processing yet
     */
    get current_p() {
        var _a;
        return (_a = this.runner) === null || _a === void 0 ? void 0 : _a.project;
    }
    /**
     * Current select task\
     * If it's undefined, it means:
     * * It's finish the current task
     * * It has not start processing yet
     */
    get current_t() {
        var _a, _b;
        return (_b = (_a = this.runner) === null || _a === void 0 ? void 0 : _a.runner) === null || _b === void 0 ? void 0 : _b.task;
    }
    /**
     * Current execute task use multithread setting
     */
    get current_multithread() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.runner) === null || _a === void 0 ? void 0 : _a.runner) === null || _b === void 0 ? void 0 : _b.multithread) !== null && _c !== void 0 ? _c : 1;
    }
    get current_task_count() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.runner) === null || _a === void 0 ? void 0 : _a.runner) === null || _b === void 0 ? void 0 : _b.task_count) !== null && _c !== void 0 ? _c : 0;
    }
    /**
     * Cron job type execute record
     */
    get current_cron() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.runner) === null || _a === void 0 ? void 0 : _a.runner) === null || _b === void 0 ? void 0 : _b.cron) !== null && _c !== void 0 ? _c : [];
    }
    /**
     * Single job type execute record
     */
    get current_job() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.runner) === null || _a === void 0 ? void 0 : _a.runner) === null || _b === void 0 ? void 0 : _b.job) !== null && _c !== void 0 ? _c : [];
    }
    /**
     * Get the task's cronjob count
     */
    get_task_state_count(t) {
        if (t.setupjob)
            return this.current_nodes.length;
        if (t.cronjob)
            return this.get_number(t.cronjobKey);
        else
            return 1;
    }
    /**
     * Find the number in the database, this include the expression phrasing
     * @param key The name key
     * @param p Project instance
     * @returns The value, if key cannot be found, it will return -1
     */
    get_number(key) {
        return ExecuteManager_Base.get_number_global(key, this.localPara);
    }
    static get_number_global(key, localPara) {
        const e = ExecuteManager_Base.database_update(localPara);
        const a = e.replacePara(`%{${key}}%`);
        return Number(a);
    }
}
exports.ExecuteManager_Base = ExecuteManager_Base;
ExecuteManager_Base.string_args_transform = (task, job, messager_log, localPara, n) => {
    let e = ExecuteManager_Base.database_update(localPara, n);
    e = ExecuteManager_Base.property_update(task, e);
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
ExecuteManager_Base.database_update = (localPara, n) => {
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
//# sourceMappingURL=base.js.map