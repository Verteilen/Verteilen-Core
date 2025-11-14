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
exports.ClientAnalysis = void 0;
const child_process_1 = require("child_process");
const interface_1 = require("../interface");
const client_1 = require("./client");
const execute_1 = require("./execute");
const shell_1 = require("./shell");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class ClientAnalysis {
    messager;
    messager_log;
    client;
    exec;
    shell;
    resource_wanter = [];
    resource_thread = undefined;
    resource_cache = undefined;
    constructor(_messager, _messager_log, _client) {
        this.client = _client;
        this.messager = _messager;
        this.messager_log = _messager_log;
        this.shell = new shell_1.ClientShell(_messager, _messager_log, this.client);
        this.exec = [];
    }
    analysis = (h, source) => {
        const typeMap = {
            'execute_job': this.execute_job,
            'release': this.release,
            'stop_job': this.stop_all,
            'set_database': this.set_database,
            'set_libs': this.set_libs,
            'shell_folder': this.shell.shell_folder,
            'open_shell': this.shell.open_shell,
            'close_shell': this.shell.close_shell,
            'enter_shell': this.shell.enter_shell,
            'resource_start': this.resource_start,
            'resource_end': this.resource_end,
            'ping': this.pong,
            'plugin_info': this.plugin_info,
            'plugin_download': this.plugin_download,
            'plugin_remove': this.plugin_remove,
        };
        if (h == undefined) {
            this.messager_log('[Client Analysis] Analysis Failed, Value is undefined');
            return 1;
        }
        if (h.message != undefined && h.message.length > 0) {
            this.messager_log(`[Client Analysis] ${h.message}`);
        }
        if (h.data == undefined) {
            this.messager_log('[Client Analysis] Analysis Warn, Data is undefined');
            h.data = 0;
        }
        if (typeMap.hasOwnProperty(h.name)) {
            const castingFunc = typeMap[h.name];
            castingFunc(h.data, source, h.channel);
            return 0;
        }
        else {
            this.messager_log(`[Client Analysis] Analysis Failed, Unknowed header, name: ${h.name}, meta: ${h.meta}`);
            return 2;
        }
    };
    execute_job = (job, source, channel) => {
        if (channel == undefined)
            return;
        const target = this.exec_checker(channel);
        target.execute_job(job, source);
    };
    release = (dummy, source, channel) => {
        if (channel == undefined)
            return;
        const index = this.exec.findIndex(x => x.uuid == channel);
        if (index == -1)
            return;
        this.exec.splice(index, 1);
    };
    set_database = (data, source, channel) => {
        if (channel == undefined)
            return;
        const target = this.exec_checker(channel);
        target.set_database(data);
    };
    set_libs = (data, source, channel) => {
        if (channel == undefined)
            return;
        const target = this.exec_checker(channel);
        target.set_libs(data);
    };
    exec_checker = (uuid) => {
        let r = undefined;
        const index = this.exec.findIndex(x => x.uuid == uuid);
        if (index == -1) {
            r = new execute_1.ClientExecute(uuid, this.messager, this.messager_log, this.client);
            this.exec.push(r);
        }
        else {
            r = this.exec[index];
        }
        return r;
    };
    pong = (data, source) => {
        const h = { name: 'pong', data: data };
        source.send(JSON.stringify(h));
    };
    plugin_info = (data, source) => {
        const pat = path.join(os.homedir(), interface_1.DATA_FOLDER, "node_plugin", "plugin.json");
        if ((0, fs_1.existsSync)(pat)) {
            const p = JSON.parse((0, fs_1.readFileSync)(pat).toString());
            const h = { name: 'plugin_info_reply', data: p.plugins };
            source.send(JSON.stringify(h));
        }
        else {
            const p = { plugins: [] };
            const h = { name: 'plugin_info_reply', data: p.plugins };
            (0, fs_1.writeFileSync)(pat, JSON.stringify(p));
            source.send(JSON.stringify(h));
        }
    };
    get_releases = async (repo, token) => {
        const qu = await fetch(`https://api.github.com/repos/${repo}/releases`, {
            headers: {
                Authorization: token ? `token ${token}` : '',
                Accept: "application/vnd.github.v3.raw",
            }
        });
        return qu.text();
    };
    filterout = async (repo, token, version, filename) => {
        const text = await this.get_releases(repo, token);
        const json = JSON.parse(text);
        const v = json.find(x => x.tag_name == version);
        if (!v)
            return;
        const f = v.assets.find(x => x.name == filename);
        if (!f)
            return;
        return f.id;
    };
    write_plugin = (t, plugin, source) => {
        const list = this.client.plugins.plugins;
        const index = list.findIndex(x => x.name == plugin.name);
        plugin.token = t ? [t] : [];
        plugin.progress = 0;
        if (index == -1) {
            list.push(plugin);
        }
        else {
            list[index] = plugin;
        }
        this.client.savePlugin();
        this.plugin_info(0, source);
    };
    finish_plugin = (plugin, source) => {
        const list = this.client.plugins.plugins;
        const index = list.findIndex(x => x.name == plugin.name);
        plugin.progress = 1;
        if (index == -1) {
            list.push(plugin);
        }
        else {
            list[index] = plugin;
        }
        this.client.savePlugin();
        this.plugin_info(0, source);
    };
    plugin_download = async (plugin, source) => {
        const target = plugin.contents.find(x => x.arch == process.arch && x.platform == process.platform);
        if (target == undefined) {
            this.messager_log(`[Plugin] Cannot find target plugin for ${plugin.name} on ${process.platform} ${process.arch}`);
            return;
        }
        const links = target.url.split('/');
        const filename = links[links.length - 1];
        const version = links[links.length - 2];
        const REPO = `${links[3]}/${links[4]}`;
        const dir = path.join(os.homedir(), interface_1.DATA_FOLDER, "node_plugin", plugin.name);
        if (!(0, fs_1.existsSync)(dir))
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        let req = {};
        const tokens = [undefined, ...plugin.token];
        const fileStream = (0, fs_1.createWriteStream)(path.join(dir, target.filename), { flags: 'a' });
        let pass = false;
        for (let t of tokens) {
            if (pass)
                break;
            try {
                const id = await this.filterout(REPO, t, version, filename);
                req = {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        Authorization: t ? `token ${t}` : '',
                        Accept: "application/octet-stream"
                    }
                };
                const url = `https://api.github.com/repos/${REPO}/releases/assets/${id}`;
                fetch(url, req).then(async (res) => {
                    if (!res.ok) {
                        throw new Error(`Failed to download file: ${res.status} ${res.statusText}`);
                    }
                    this.write_plugin(t, plugin, source);
                    return res.blob();
                }).then(blob => {
                    return blob.stream().getReader().read();
                })
                    .then(reader => {
                    if (!reader.done) {
                        fileStream.write(Buffer.from(reader.value));
                    }
                }).finally(() => {
                    this.messager_log(`[Plugin] Downloaded ${plugin.name} successfully`);
                    fileStream.end();
                    if (process.platform == 'linux') {
                        (0, child_process_1.exec)(`chmod +x ${path.join(dir, target.filename)}`, (err) => {
                            this.messager_log(`[Plugin] Permission failed ${err?.message}`);
                        });
                    }
                    this.finish_plugin(plugin, source);
                    pass = true;
                });
            }
            catch (err) {
                this.messager_log(`[Plugin] Download failed for ${plugin.name}: ${err.message}`);
            }
        }
    };
    plugin_remove = (plugin, source) => {
        this.client.plugins.plugins = this.client.plugins.plugins.filter(x => x.name != plugin.name);
        this.client.savePlugin();
        const dir = path.join(os.homedir(), interface_1.DATA_FOLDER, "node_plugin");
        if (!(0, fs_1.existsSync)(dir))
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        if ((0, fs_1.existsSync)(path.join(dir, plugin.name))) {
            (0, fs_1.rmSync)(path.join(dir, plugin.name), { recursive: true });
        }
        this.plugin_info(0, source);
    };
    resource_start = (data, source) => {
        this.resource_wanter.push(source);
        this.messager_log(`Register resource_wanter!, count: ${this.resource_wanter.length}`);
        if (this.resource_cache != undefined)
            source.send(JSON.stringify(this.resource_cache));
    };
    resource_end = (data, source) => {
        const index = this.resource_wanter.findIndex(x => x == source);
        if (index != -1) {
            this.resource_wanter.splice(index, 1);
            this.messager_log(`UnRegister resource_wanter!, count: ${this.resource_wanter.length}`);
        }
    };
    update = (client) => {
        this.resource_require();
        if (this.resource_cache != undefined) {
            this.resource_wanter.forEach(x => x.send(JSON.stringify(this.resource_cache)));
        }
    };
    disconnect = (source) => {
        this.shell.disconnect(source);
        this.exec.forEach(x => x.stop_job());
    };
    stop_all = () => {
        this.exec.forEach(x => x.stop_job());
    };
    destroy = () => {
        if (this.resource_thread != undefined)
            this.resource_thread.kill();
    };
    resource_require = () => {
        if (this.resource_thread != undefined)
            return;
        const shouldRun = this.resource_thread == undefined && (this.resource_cache == undefined || this.resource_wanter.length > 0);
        if (!shouldRun)
            return;
        this.resource_thread = (0, child_process_1.spawn)(client_1.Client.workerPath(), [], {
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: true,
            windowsHide: true,
            env: {
                ...process.env,
                type: "RESOURCE",
                cache: this.resource_cache == undefined ? undefined : JSON.stringify(this.resource_cache.data)
            }
        });
        let k = "";
        const workerFeedbackExec = (str) => {
            try {
                const msg = JSON.parse(str);
                if (msg.name == 'messager') {
                    this.messager(msg.data, "RESOURCE");
                }
                else if (msg.name == 'messager_log') {
                    this.messager_log(msg.data, "RESOURCE");
                }
                else if (msg.name == 'resource') {
                    const h = {
                        name: 'system_info',
                        data: msg.data
                    };
                    this.resource_cache = h;
                    this.resource_wanter.forEach(x => x.send(JSON.stringify(h)));
                }
                else if (msg.name == 'error') {
                    if (msg.data instanceof String)
                        this.messager_log(msg.data.toString(), "RESOURCE");
                    else
                        this.messager_log(JSON.stringify(msg.data), "RESOURCE");
                }
            }
            catch (err) {
                console.log("str: " + str);
                console.log(err.name + "\n" + err.message);
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
        this.resource_thread.on('error', (err) => {
            this.messager_log(`[Worker Error] ${err}`);
        });
        this.resource_thread.on('exit', (code, signal) => {
            this.resource_thread = undefined;
        });
        this.resource_thread.on('message', (message, sendHandle) => {
            workerFeedback(message.toString());
        });
        this.resource_thread.stdout?.setEncoding('utf8');
        this.resource_thread.stdout?.on('data', (chunk) => {
            workerFeedback(chunk.toString());
        });
        this.resource_thread.stderr?.setEncoding('utf8');
        this.resource_thread.stderr?.on('data', (chunk) => {
            workerFeedback(chunk.toString());
        });
    };
}
exports.ClientAnalysis = ClientAnalysis;
