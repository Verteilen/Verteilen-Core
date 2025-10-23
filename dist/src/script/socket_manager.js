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
exports.WebsocketManager = void 0;
const uuid_1 = require("uuid");
const interface_1 = require("../interface");
const jsEnv = __importStar(require("browser-or-node"));
const ws = __importStar(require("ws"));
const https = __importStar(require("https"));
function isRenderer() {
    if (typeof process === 'undefined')
        return true;
    if (!process)
        return true;
    if (!process.type)
        return false;
    return process.type === 'renderer';
}
console.log("isRenderer", isRenderer());
class WebsocketManager {
    constructor(_newConnect, _disconnect, _onAnalysis, _messager_log, _proxy) {
        this.targets = [];
        this.server_start = (url, id) => this.serverconnect(url, id);
        this.server_stop = (uuid, reason) => this.removeByUUID(uuid, reason);
        this.server_update = () => this.sendUpdate();
        this.server_record = (ns) => {
            ns.forEach(x => {
                this.serverconnect(x.url, x.ID);
            });
        };
        this.shell_open = (uuid) => {
            const p = this.targets.find(x => x.uuid == uuid && x.websocket.readyState == interface_1.SocketState.OPEN);
            if (p == undefined) {
                this.messager_log(`[Shell] Error cannot find the node by ID: ${uuid}`);
                return;
            }
            const d = {
                name: "open_shell",
                data: 0
            };
            p.websocket.send(JSON.stringify(d));
        };
        this.shell_enter = (uuid, text) => {
            const p = this.targets.find(x => x.uuid == uuid && x.websocket.readyState == interface_1.SocketState.OPEN);
            if (p == undefined) {
                this.messager_log(`[Shell] Error cannot find the node by ID: ${uuid}`);
                return;
            }
            const d = {
                name: "enter_shell",
                data: text
            };
            p.websocket.send(JSON.stringify(d));
        };
        this.shell_close = (uuid) => {
            const p = this.targets.find(x => x.uuid == uuid && x.websocket.readyState == interface_1.SocketState.OPEN);
            if (p == undefined) {
                this.messager_log(`[Shell] Error cannot find the node by ID: ${uuid}`);
                return;
            }
            const d = {
                name: "close_shell",
                data: 0
            };
            p.websocket.send(JSON.stringify(d));
        };
        this.shell_folder = (uuid, path) => {
            const p = this.targets.find(x => x.uuid == uuid && x.websocket.readyState == interface_1.SocketState.OPEN);
            if (p == undefined) {
                this.messager_log(`[Shell] Error cannot find the node by ID: ${uuid}`);
                return;
            }
            const d = {
                name: "shell_folder",
                data: path
            };
            p.websocket.send(JSON.stringify(d));
        };
        this.serverconnect = (url, uuid) => {
            if (this.targets.findIndex(x => x.websocket.url.slice(0, -1) == url) != -1)
                return;
            if (this.targets.findIndex(x => x.uuid == uuid) != -1)
                return;
            let client = undefined;
            if (jsEnv.isNode)
                client = new ws.WebSocket(url, { agent: new https.Agent(), rejectUnauthorized: false });
            else
                client = new WebSocket(url);
            const t = { uuid: (uuid == undefined ? (0, uuid_1.v6)() : uuid), websocket: client, current_job: [] };
            this.targets.push(t);
            client.onerror = (err) => {
                this.messager_log(`[Socket] Connect failed ${url} ${err.message}`);
            };
            client.onclose = (ev) => {
                if (t.s != undefined) {
                    this.messager_log(`[Socket] Client close connection, ${ev.code}, ${ev.reason}`);
                    this.disconnect(t);
                }
                t.s = undefined;
                t.current_job = [];
            };
            client.onopen = () => {
                this.messager_log('[Socket] New Connection !' + client.url);
                if (t.s == undefined) {
                    t.s = true;
                }
                this.sendUpdate();
                this.newConnect(t);
            };
            client.onmessage = (ev) => {
                const h = JSON.parse(ev.data.toString());
                const c = this.targets.find(x => x.uuid == uuid);
                this.analysis(h, c);
            };
            return client;
        };
        this.analysis = (h, c) => {
            if (h == undefined) {
                this.messager_log('[Source Analysis] Decode failed, Get value undefined');
                return;
            }
            if (h.message != undefined && h.message.length > 0) {
                this.messager_log(`[Source Analysis] ${h.message}`);
            }
            if (h.data == undefined)
                return;
            const d = { name: h.name, h: h, c: c };
            const pass = this.socket_analysis(d);
            if (!pass)
                this.onAnalysis(d);
        };
        this.socket_analysis = (d) => {
            const typeMap = {
                'system_info': this.system_info,
                'shell_reply': this.shell_reply,
                'shell_folder_reply': this.shell_folder_reply,
                'node_info': this.node_info,
                'pong': this.pong,
                'plugin_info_reply': this.plugin_info_reply,
            };
            if (typeMap.hasOwnProperty(d.name)) {
                const castingFunc = typeMap[d.h.name];
                castingFunc(d.h.data, d.c, d.h.meta);
                return true;
            }
            else {
                return false;
            }
        };
        this.sendUpdate = () => {
            let result = [];
            const data = [];
            this.targets.forEach(x => {
                if (x.websocket.readyState == interface_1.SocketState.CLOSED) {
                    data.push({ ID: x.uuid, url: x.websocket.url });
                }
            });
            data.forEach(d => this.removeByUUID(d.ID));
            data.forEach(d => {
                this.serverconnect(d.url, d.ID);
            });
            result = this.targets.map(x => {
                return {
                    ID: x.uuid,
                    state: x.websocket.readyState,
                    url: x.websocket.url,
                    connection_rate: x.ms,
                    system: x.information,
                    plugins: x.plugins
                };
            });
            return result;
        };
        this.removeByUUID = (uuid, reason) => {
            let index = this.targets.findIndex(x => x.uuid == uuid);
            if (index != -1) {
                if (this.targets[index].websocket.readyState == interface_1.SocketState.OPEN)
                    this.targets[index].websocket.close(1000, reason != undefined ? reason : '');
                this.targets.splice(index, 1);
            }
        };
        this.update = () => {
            const h = { name: 'ping', data: 0 };
            this.targets.forEach(x => {
                if (x.websocket.readyState != interface_1.SocketState.OPEN)
                    return;
                x.last = Date.now();
                x.websocket.send(JSON.stringify(h));
            });
        };
        this.shell_reply = (data, w) => {
            var _a;
            (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.shellReply(data, w);
        };
        this.shell_folder_reply = (data, w) => {
            var _a;
            (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.folderReply(data, w);
        };
        this.system_info = (info, source) => {
            if (source == undefined)
                return;
            source.information = info;
        };
        this.node_info = (info, source) => {
            if (source == undefined)
                return;
            source.load = info;
        };
        this.pong = (info, source) => {
            if (source == undefined || source.last == undefined)
                return;
            source.ms = Date.now() - source.last;
        };
        this.plugin_info_reply = (data, source) => {
            if (source == undefined || source.last == undefined)
                return;
            source.plugins = data;
        };
        this.newConnect = _newConnect;
        this.disconnect = _disconnect;
        this.onAnalysis = _onAnalysis;
        this.messager_log = _messager_log;
        this.proxy = _proxy;
        setInterval(this.update, 1000);
    }
}
exports.WebsocketManager = WebsocketManager;
