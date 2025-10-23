"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientJobExecute = void 0;
const interface_1 = require("../interface");
const i18n_1 = require("../plugins/i18n");
const javascript_1 = require("./javascript");
const job_parameter_1 = require("./job_parameter");
const os_1 = require("./os");
class ClientJobExecute {
    constructor(_messager, _messager_log, _job, _source, _plugin) {
        this.execute = () => {
            this.messager_log(`[Execute] ${this.job.uuid}  ${this.job.category == interface_1.JobCategory.Execution ? i18n_1.i18n.global.t(interface_1.JobTypeText[this.job.type]) : i18n_1.i18n.global.t(interface_1.JobType2Text[this.job.type])}`, this.tag, this.runtime);
            const child = this.job.category == interface_1.JobCategory.Execution ? this.execute_job_exe() : this.execute_job_con();
            return child;
        };
        this.stop_all = () => {
            this.os.stopall();
        };
        this.execute_job_exe = () => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                switch (this.job.type) {
                    case interface_1.JobType.COPY_FILE:
                        {
                            const data = { from: this.job.string_args[0], to: this.job.string_args[1] };
                            this.os.file_copy(data);
                            resolve(`Copy file successfully, ${data.from}, ${data.to}`);
                            break;
                        }
                    case interface_1.JobType.COPY_DIR:
                        {
                            const data = { from: this.job.string_args[0], to: this.job.string_args[1] };
                            this.os.dir_copy(data);
                            resolve(`Copy dir successfully, ${data.from}, ${data.to}`);
                            break;
                        }
                    case interface_1.JobType.DELETE_FILE:
                        {
                            const data = { path: this.job.string_args[0] };
                            this.os.file_delete(data);
                            resolve(`Delete file successfully, ${data.path}`);
                            break;
                        }
                    case interface_1.JobType.DELETE_DIR:
                        {
                            const data = { path: this.job.string_args[0] };
                            this.os.dir_delete(data);
                            resolve(`Delete folder successfully, ${data.path}`);
                            break;
                        }
                    case interface_1.JobType.CREATE_DIR:
                        {
                            const data = { path: this.job.string_args[0] };
                            this.os.dir_create(data);
                            resolve(`Create dir successfully, ${data.path}`);
                            break;
                        }
                    case interface_1.JobType.CREATE_FILE:
                        {
                            const data = { from: this.job.string_args[0], to: this.job.string_args[1] };
                            this.os.file_write(data);
                            resolve(`Create file successfully, ${data.from} ${data.to}`);
                            break;
                        }
                    case interface_1.JobType.RENAME:
                        {
                            const data = { from: this.job.string_args[0], to: this.job.string_args[1] };
                            this.os.rename(data);
                            resolve(`Rename successfully, ${data.from} ${data.to}`);
                            break;
                        }
                    case interface_1.JobType.JAVASCRIPT:
                        {
                            yield this.javascript.JavascriptExecuteWithLib(this.job.script, this.job.string_args).then(() => {
                                resolve(`Execute Javascript successfully`);
                            }).catch(k => {
                                reject(k);
                            });
                            break;
                        }
                    case interface_1.JobType.COMMAND:
                        {
                            this.os.command(this.job.string_args[1], this.job.string_args[2], this.job.string_args[0]).then(m => {
                                resolve(m);
                            }).catch(err => {
                                reject(err);
                            });
                            break;
                        }
                    case interface_1.JobType.LIB_COMMAND:
                        {
                            const target = this.plugin.plugins.find(x => x.name == this.job.string_args[0]);
                            if (target == undefined) {
                                reject("Cannot find plugin " + this.job.string_args[0]);
                                return;
                            }
                            const archTarget = target.contents.find(x => x.arch == process.arch && x.platform == process.platform);
                            if (archTarget == undefined) {
                                reject({
                                    code: 1,
                                    message: "Cannot find plugin match arch " + this.job.string_args[0] + "  " + process.arch
                                });
                                return;
                            }
                            this.os.lib_command(archTarget.filename, this.job.string_args[1]).then(m => {
                                resolve(m);
                            }).catch(err => {
                                reject(err);
                            });
                            break;
                        }
                }
            }));
        };
        this.execute_job_con = () => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                switch (this.job.type) {
                    case interface_1.JobType2.CHECK_PATH:
                        {
                            const data = { path: this.job.string_args[0] };
                            if (this.os.fs_exist(data)) {
                                resolve(`Path exist ${data.path}`);
                            }
                            else {
                                reject({
                                    code: 2,
                                    message: `Path not exist ${data.path}`
                                });
                            }
                            break;
                        }
                    case interface_1.JobType2.JAVASCRIPT:
                        {
                            const r = yield this.javascript.JavascriptExecuteWithLib(this.job.script, this.job.string_args);
                            if (r != undefined && r == 0) {
                                resolve(`Execute Javascript successfully`);
                            }
                            else {
                                reject({
                                    code: 3,
                                    message: `Execute Javascript failed`
                                });
                            }
                            break;
                        }
                }
            }));
        };
        this.messager = _messager;
        this.messager_log = _messager_log;
        this.tag = _job.uuid;
        this.runtime = _job.runtime_uuid || '';
        this.job = _job;
        this.plugin = _plugin;
        this.para = new job_parameter_1.ClientJobParameter();
        this.os = new os_1.ClientOS(() => this.tag, () => this.job.runtime_uuid || '', _messager, _messager_log);
        this.javascript = new javascript_1.ClientJavascript(_messager, _messager_log, () => this.job);
        this.parameter = process.env.parameter != undefined ? JSON.parse(process.env.parameter) : undefined;
        this.libraries = process.env.libraries != undefined ? JSON.parse(process.env.libraries) : undefined;
        javascript_1.ClientJavascript.Init(_messager, _messager_log, this.os, this.para, () => this.libraries, () => this.parameter, () => this.job);
    }
}
exports.ClientJobExecute = ClientJobExecute;
