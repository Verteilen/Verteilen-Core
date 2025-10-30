"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerDetail = void 0;
const uuid_1 = require("uuid");
const interface_1 = require("../interface");
const console_handle_1 = require("../util/console_handle");
const log_handle_1 = require("../util/log_handle");
class ServerDetail {
    execute_manager = [];
    console;
    websocket_manager;
    shellBind = new Map();
    loader;
    backend;
    feedback;
    message;
    messager_log;
    updatehandle;
    re = [];
    constructor(loader, backend, feedback, message, messager_log) {
        this.loader = loader;
        this.backend = backend;
        this.feedback = feedback;
        this.message = message;
        this.messager_log = messager_log;
        const n = {
            shellReply: this.shellReply,
            folderReply: this.folderReply
        };
        this.websocket_manager = new interface_1.Execute_SocketManager.WebsocketManager(this.NewConnection, this.DisConnection, this.Analysis, messager_log, n);
        this.console = new interface_1.UtilServer_Console.Util_Server_Console();
        this.updatehandle = setInterval(() => {
            this.re.push(...this.console_update());
        }, interface_1.RENDER_UPDATETICK);
    }
    get events() {
        return {
            resource_start: this.resource_start,
            resource_end: this.resource_end,
            plugin_info: this.plugin_info,
            shell_enter: this.shell_enter,
            shell_open: this.shell_open,
            shell_close: this.shell_close,
            shell_folder: this.shell_folder,
            node_list: this.node_list,
            node_add: this.node_add,
            node_update: this.node_update,
            node_delete: this.node_delete,
            console_list: this.console_list,
            console_record: this.console_record,
            console_execute: this.console_execute,
            console_stop: this.console_stop,
            console_clean: this.console_clean,
            console_skip: this.console_skip,
            console_skip2: this.console_skip2,
            console_add: this.console_add,
            console_update: this.console_update,
        };
    }
    NewConnection = (x) => {
        const p = {
            title: "New Connection Established",
            type: 'success',
            message: `${x.websocket.url} \n${x.uuid}`
        };
        if (this.feedback.electron) {
            this.feedback.electron()?.send('makeToast', p);
        }
        if (this.feedback.socket && this.backend.Boradcasting) {
            this.backend.Boradcasting('makeToast', p);
        }
        this.execute_manager.forEach(y => {
            y.manager.NewConnection(x);
        });
    };
    DisConnection = (x) => {
        const p = {
            title: "Network Disconnected",
            type: 'error',
            message: `${x.websocket.url} \n${x.uuid}`
        };
        if (this.feedback.electron) {
            this.feedback.electron()?.send('makeToast', p);
        }
        if (this.feedback.socket && this.backend.Boradcasting) {
            this.backend.Boradcasting('makeToast', p);
        }
        this.execute_manager.forEach(y => {
            y.manager.Disconnect(x);
        });
    };
    Analysis = (d) => {
        this.execute_manager.forEach(x => x.manager.Analysis(JSON.parse(JSON.stringify(d))));
    };
    shellReply = (data, p) => {
        if (this.feedback.electron) {
            this.feedback.electron()?.send("shellReply", data);
        }
        if (this.feedback.socket) {
            if (p == undefined)
                return;
            if (this.shellBind.has(p.uuid)) {
                const k = this.shellBind.get(p.uuid);
                k.forEach(x => {
                    const h = { name: "shellReply", data: data };
                    x.send(JSON.stringify(h));
                });
            }
        }
    };
    folderReply = (data, p) => {
        if (this.feedback.electron) {
            this.feedback.electron()?.send("folderReply", data);
        }
        if (this.feedback.socket) {
            if (p == undefined)
                return;
            if (this.shellBind.has(p.uuid)) {
                const k = this.shellBind.get(p.uuid);
                k.forEach(x => {
                    const h = {
                        name: "folderReply", data: data
                    };
                    x.send(JSON.stringify(h));
                });
            }
        }
    };
    console_update = () => {
        const re = [];
        this.execute_manager.forEach(x => {
            if (x.record.running && !x.record.stop) {
                try {
                    x.manager.Update();
                }
                catch (err) {
                    x.record.stop = true;
                    console.log(err);
                    re.push({
                        code: 400,
                        name: err.name,
                        message: err.message,
                        stack: err.stack
                    });
                }
            }
            if (x.record.stop) {
                if (x.manager.jobstack == 0) {
                    x.record.running = false;
                }
            }
            if (x.record.command.length > 0) {
                const p = x.record.command.shift();
                if (p[0] == 'clean')
                    this.console_clean(undefined, x.record.uuid);
                else if (p[0] == 'stop')
                    this.console_stop(undefined, x.record.uuid);
                else if (p[0] == 'skip')
                    this.console_skip(undefined, x.record.uuid, p[1], p[2]);
                else if (p[0] == 'execute')
                    this.console_execute(undefined, x.record.uuid, p[1]);
            }
        });
        if (this.loader != undefined) {
            const logss = this.backend.memory.logs.filter(x => x.dirty && x.output);
            for (var x of logss) {
                x.dirty = false;
                const filename = this.loader.join(this.loader.root, "log", `${x.uuid}.json`);
                this.loader.write_string(filename, JSON.stringify(x, null, 4));
            }
        }
        return re;
    };
    resource_start = (socket, uuid) => {
        const p = this.websocket_manager.targets.find(x => x.uuid == uuid);
        const d = { name: 'resource_start', data: 0 };
        p?.websocket.send(JSON.stringify(d));
    };
    resource_end = (socket, uuid) => {
        const p = this.websocket_manager.targets.find(x => x.uuid == uuid);
        const d = { name: 'resource_end', data: 0 };
        p?.websocket.send(JSON.stringify(d));
    };
    plugin_info = (socket, uuid) => {
        const p = this.websocket_manager.targets.find(x => x.uuid == uuid);
        const d = { name: 'plugin_info', data: 0 };
        p?.websocket.send(JSON.stringify(d));
    };
    shell_enter = (socket, uuid, value) => {
        this.websocket_manager.shell_enter(uuid, value);
    };
    shell_open = (socket, uuid) => {
        this.websocket_manager.shell_open(uuid);
        if (this.feedback.socket) {
            if (this.shellBind.has(uuid)) {
                this.shellBind.get(uuid).push(this.feedback.socket);
            }
            else {
                this.shellBind.set(uuid, [this.feedback.socket]);
            }
        }
    };
    shell_close = (socket, uuid) => {
        this.websocket_manager.shell_close(uuid);
        if (this.feedback.socket) {
            if (this.shellBind.has(uuid)) {
                const p = this.shellBind.get(uuid);
                const index = p.findIndex(x => x == this.feedback.socket);
                if (index != -1)
                    p.splice(index, 1);
                this.shellBind.set(uuid, p);
            }
        }
    };
    shell_folder = (socket, uuid, path) => {
        this.websocket_manager.shell_folder(uuid, path);
    };
    node_list = (socket) => {
        const p = this.websocket_manager?.targets;
        if (this.feedback.socket != undefined) {
            const h = {
                name: "node_list-feedback",
                data: this.websocket_manager?.targets
            };
            this.feedback.socket(JSON.stringify(h));
        }
        return p;
    };
    node_add = (socket, url, id) => {
        const p = this.websocket_manager.server_start(url, id);
        if (this.feedback.socket != undefined) {
            const h = {
                name: "node_add-feedback",
                data: p
            };
            this.feedback.socket(JSON.stringify(h));
        }
    };
    node_update = (socket) => {
        const p = this.websocket_manager?.server_update();
        if (this.feedback.socket != undefined) {
            const h = {
                name: "node_update-feedback",
                data: [p]
            };
            this.feedback.socket(JSON.stringify(h));
        }
        return p;
    };
    node_delete = (socket, uuid, reason) => {
        this.websocket_manager.server_stop(uuid, reason);
    };
    console_list = (socket) => {
        if (this.feedback.electron) {
            return this.execute_manager.map(x => x.record).filter(x => x != undefined);
        }
        if (this.feedback.socket) {
            const h = {
                name: "console_list-feedback",
                data: this.execute_manager.map(x => x.record)
            };
            this.feedback.socket(JSON.stringify(h));
        }
    };
    console_record = (socket, uuid) => {
        const r = this.execute_manager.find(x => x.record?.uuid == uuid)?.record;
        if (socket != undefined) {
            const h = {
                name: "console_record-feedback",
                data: JSON.stringify(r)
            };
            socket.send(JSON.stringify(h));
        }
        return JSON.stringify(r);
    };
    console_execute = (socket, uuid, type) => {
        const target = this.execute_manager.find(x => x.record.uuid == uuid);
        if (target == undefined)
            return;
        target.record.process_type = type;
        target.record.running = true;
        target.record.stop = false;
        target.manager.first = true;
    };
    console_stop = (socket, uuid) => {
        const target = this.execute_manager.find(x => x.record.uuid == uuid);
        if (target == undefined)
            return;
        target.record.stop = true;
        target.manager.Stop();
    };
    console_add = (socket, name, record, uuid) => {
        record.projects.forEach(x => x.uuid = (0, uuid_1.v6)());
        const em = new interface_1.Execute_ExecuteManager.ExecuteManager(name, this.websocket_manager, this.message, JSON.parse(JSON.stringify(record)));
        const er = {
            ...record,
            uuid: em.uuid,
            name: name,
            running: false,
            stop: true,
            process_type: -1,
            useCron: false,
            para: undefined,
            command: [],
            project: '',
            task: '',
            project_index: -1,
            task_index: -1,
            project_state: [],
            task_state: [],
            task_detail: [],
        };
        em.libs = { libs: this.backend.memory.libs };
        const p = { manager: em, record: er };
        const uscp = new console_handle_1.Util_Server_Console_Proxy(p);
        const uslp = new log_handle_1.Util_Server_Log_Proxy(p, { logs: this.backend.memory.logs }, this.backend.GetPreference(uuid));
        em.proxy = this.CombineProxy([uscp.execute_proxy, uslp.execute_proxy]);
        const r = this.console.receivedPack(p, record);
        if (r)
            this.execute_manager.push(p);
        if (socket != undefined) {
            const h = {
                name: "console_add-feedback",
                data: r ? er : undefined
            };
            socket.send(JSON.stringify(h));
        }
        if (this.feedback.electron)
            return r ? er : undefined;
    };
    console_update_call = () => {
        const p = this.re;
        this.re = [];
        if (this.feedback.socket) {
            const h = {
                name: "console_update-feedback",
                data: JSON.stringify(p)
            };
            this.feedback.socket(JSON.stringify(h));
        }
    };
    console_clean = (socket, uuid) => {
        const target = this.execute_manager.find(x => x.record.uuid == uuid);
        if (target == undefined)
            return;
        target.manager.Clean();
        target.record.projects = [];
        target.record.project = "";
        target.record.task = "";
        target.record.project_index = -1;
        target.record.task_index = -1;
        target.record.project_state = [];
        target.record.task_state = [];
        target.record.task_detail = [];
        target.manager.Release();
        const index = this.execute_manager.findIndex(x => x.record.uuid == uuid);
        this.execute_manager.splice(index, 1);
    };
    console_skip = (socket, uuid, forward, type, state = interface_1.ExecuteState.FINISH) => {
        const target = this.execute_manager.find(x => x.record.uuid == uuid);
        if (target == undefined)
            return;
        if (type == 0) {
            target.record.project_state[target.record.project_index].state = forward ? (state != undefined ? state : interface_1.ExecuteState.FINISH) : interface_1.ExecuteState.NONE;
            target.record.project_index += forward ? 1 : -1;
            if (target.record.project_index == target.record.projects.length) {
                target.record.project_index = -1;
                this.console_clean(socket, uuid);
            }
            else {
                if (target.record.project_index < 0) {
                    target.record.project_index = 0;
                }
                target.record.task_state = target.record.projects[target.record.project_index].tasks.map(x => {
                    return {
                        uuid: x.uuid,
                        state: interface_1.ExecuteState.NONE
                    };
                });
                target.record.task_detail = [];
                const p = target.record.projects[target.record.project_index];
                const t = p.tasks[target.record.task_index];
                const count = target.manager.get_task_state_count(t);
                for (let i = 0; i < count; i++) {
                    target.record.task_detail.push({
                        index: i,
                        node: "",
                        message: [],
                        state: interface_1.ExecuteState.NONE
                    });
                }
                const index = forward ? target.manager.SkipProject() : target.manager.PreviousProject();
                console.log("%s project, index: %d, next count: %d", forward ? "Skip" : "Previous", index, count);
            }
        }
        else if (type == 1) {
            const begining = target.record.task_state[0].state == interface_1.ExecuteState.NONE;
            if (!begining && forward)
                target.record.task_state[target.record.task_index].state = state != undefined ? state : interface_1.ExecuteState.FINISH;
            if (!forward)
                target.record.task_state[target.record.task_index].state = interface_1.ExecuteState.NONE;
            target.record.task_index += forward ? 1 : -1;
            if (target.record.task_index == target.record.task_state.length) {
                this.console_skip(socket, uuid, true, 0);
            }
            else {
                if (!begining && forward)
                    target.record.task_state[target.record.task_index].state = state != undefined ? state : interface_1.ExecuteState.FINISH;
                else if (!forward)
                    target.record.task_state[target.record.task_index].state = interface_1.ExecuteState.RUNNING;
                target.record.task_detail = [];
                const p = target.record.projects[target.record.project_index];
                const t = p.tasks[target.record.task_index];
                const count = target.manager.get_task_state_count(t);
                for (let i = 0; i < count; i++) {
                    target.record.task_detail.push({
                        index: i,
                        node: "",
                        message: [],
                        state: interface_1.ExecuteState.NONE
                    });
                }
                const index = forward ? target.manager.SkipTask() : target.manager.PreviousTask();
                console.log("Skip task, index: %d, next count: %d", index, count);
            }
        }
    };
    console_skip2 = (socket, uuid, v) => {
        const target = this.execute_manager.find(x => x.record.uuid == uuid);
        if (target == undefined)
            return;
        const index = target.manager.SkipSubTask(v);
        if (index < 0) {
            console.error("Skip step failed: ", index);
            return;
        }
        for (let i = 0; i < index; i++) {
            target.record.task_detail[i].state = interface_1.ExecuteState.FINISH;
        }
        console.log("Skip task", index);
    };
    CombineProxy = (eps) => {
        const p = {
            executeProjectStart: (data) => { eps.forEach(x => x.executeProjectStart(JSON.parse(JSON.stringify(data)))); },
            executeProjectFinish: (data) => { eps.forEach(x => x.executeProjectFinish(JSON.parse(JSON.stringify(data)))); },
            executeTaskStart: (data) => { eps.forEach(x => x.executeTaskStart(JSON.parse(JSON.stringify(data)))); },
            executeTaskFinish: (data) => { eps.forEach(x => x.executeTaskFinish(JSON.parse(JSON.stringify(data)))); },
            executeSubtaskStart: (data) => { eps.forEach(x => x.executeSubtaskStart(JSON.parse(JSON.stringify(data)))); },
            executeSubtaskUpdate: (data) => { eps.forEach(x => x.executeSubtaskUpdate(JSON.parse(JSON.stringify(data)))); },
            executeSubtaskFinish: (data) => { eps.forEach(x => x.executeSubtaskFinish(JSON.parse(JSON.stringify(data)))); },
            executeJobStart: (data) => { eps.forEach(x => x.executeJobStart(JSON.parse(JSON.stringify(data)))); },
            executeJobFinish: (data) => { eps.forEach(x => x.executeJobFinish(JSON.parse(JSON.stringify(data)))); },
            feedbackMessage: (data) => { eps.forEach(x => x.feedbackMessage(JSON.parse(JSON.stringify(data)))); },
            updateDatabase: (data) => { eps.forEach(x => x.updateDatabase(JSON.parse(JSON.stringify(data)))); },
        };
        return p;
    };
}
exports.ServerDetail = ServerDetail;
