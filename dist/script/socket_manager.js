"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketManager = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
const uuid_1 = require("uuid");
const socket_io_client_1 = require("socket.io-client");
/**
 * The node connection instance manager, Use by the cluster server
 */
class WebsocketManager {
    constructor(_newConnect, _disconnect, _onAnalysis, _messager_log, _proxy) {
        this.targets = [];
        /**
         * Trying to connect a node by target URL
         * @param url target url
         * @returns The connection package
         */
        this.server_start = (url, uuid) => this.serverconnect(url, uuid);
        /**
         * Remove the package by UUID
         * @param uuid Key
         * @param reason Reason for disconnect
         */
        this.server_stop = (uuid, reason) => this.removeByUUID(uuid, reason);
        /**
         * Manager update, it will does things below
         * * Retry connection
         * @returns Node table for display
         */
        this.server_update = () => this.sendUpdate();
        this.server_record = (ns) => {
            ns.forEach(x => {
                this.serverconnect(x.url, x.uuid);
            });
        };
        this.shell_open = (uuid) => {
            const p = this.targets.find(x => x.uuid == uuid && x.socket.io._readyState == 'open');
            if (p == undefined) {
                this.messager_log(`[Shell] Error cannot find the node by ID: ${uuid}`);
                return;
            }
            const d = {
                name: "open_shell",
                data: 0
            };
            p.socket.send(JSON.stringify(d));
        };
        /**
         * Open shell connection with target node
         * @param uuid node UUID
         * @param text input data
         */
        this.shell_enter = (uuid, text) => {
            const p = this.targets.find(x => x.uuid == uuid && x.socket.io._readyState == 'open');
            if (p == undefined) {
                this.messager_log(`[Shell] Error cannot find the node by ID: ${uuid}`);
                return;
            }
            const d = {
                name: "enter_shell",
                data: text
            };
            p.socket.send(JSON.stringify(d));
        };
        /**
         * Close shell connection with target node
         * @param uuid Node UUID
         * @returns
         */
        this.shell_close = (uuid) => {
            const p = this.targets.find(x => x.uuid == uuid && x.socket.io._readyState == 'open');
            if (p == undefined) {
                this.messager_log(`[Shell] Error cannot find the node by ID: ${uuid}`);
                return;
            }
            const d = {
                name: "close_shell",
                data: 0
            };
            p.socket.send(JSON.stringify(d));
        };
        /**
         * Check folder structure with target node
         * @param uuid Node UUID
         * @param path the folder path to check
         */
        this.shell_folder = (uuid, path) => {
            const p = this.targets.find(x => x.uuid == uuid && x.socket.io._readyState == 'open');
            if (p == undefined) {
                this.messager_log(`[Shell] Error cannot find the node by ID: ${uuid}`);
                return;
            }
            const d = {
                name: "shell_folder",
                data: path
            };
            p.socket.send(JSON.stringify(d));
        };
        /**
         * Trying to connect a node by target URL
         * @param Node target url
         * @param uuid generate UUID, New or retry connect base on value is defined or not
         * @returns The connection package
         */
        this.serverconnect = (url, uuid) => {
            if (this.targets.findIndex(x => x.url.slice(0, -1) == url) != -1)
                return;
            if (this.targets.findIndex(x => x.uuid == uuid) != -1)
                return;
            let client = undefined;
            client = (0, socket_io_client_1.io)(url);
            const t = { uuid: (uuid == undefined ? (0, uuid_1.v6)() : uuid), url: url, socket: client, current_job: [] };
            this.targets.push(t);
            client.io.on('error', (err) => {
                this.messager_log(`[Socket] Connect failed ${url} ${err.message}`);
            });
            client.io.on('close', (reason, des) => {
                if (t.s != undefined) {
                    this.messager_log(`[Socket] Client close connection, ${des}, ${reason}`);
                    this.disconnect(t);
                }
                t.s = undefined;
                t.current_job = [];
            });
            client.io.on('open', () => {
                this.messager_log('[Socket] New Connection !' + client.id);
                if (t.s == undefined) {
                    t.s = true;
                }
                this.sendUpdate();
                this.newConnect(t);
            });
            client.io.on('packet', (packet) => {
                try {
                    JSON.parse(packet.data.toString());
                    const h = JSON.parse(packet.data.toString());
                    const c = this.targets.find(x => x.uuid == uuid);
                    this.analysis(h, c);
                }
                catch (err) {
                    console.error("[Socket] Message error occurred: " + err.message);
                }
            });
            return client;
        };
        /**
         * The analysis method for the node connection instance
         * @param h Package
         * @param c Connection instance
         */
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
        /**
         * Manager update, it will does things below
         * * Retry connection
         * @returns Node table for display
         */
        this.sendUpdate = () => {
            let result = [];
            const data = [];
            this.targets.forEach(x => {
                var _a;
                if (x.socket.io._readyState == 'closed') {
                    data.push({ cluster: false, uuid: x.uuid, url: (_a = x.url) !== null && _a !== void 0 ? _a : "" });
                }
            });
            data.forEach(d => this.removeByUUID(d.uuid));
            data.forEach(d => {
                this.serverconnect(d.url, d.uuid);
            });
            result = this.targets.map(x => {
                return {
                    s: false,
                    cluster: false,
                    uuid: x.uuid,
                    state: x.socket.io._readyState,
                    url: x.url,
                    connection_rate: x.ms,
                    system: x.information,
                    plugins: x.plugins
                };
            });
            return result;
        };
        /**
         * Remove the package by UUID
         * @param uuid Key
         * @param reason Reason for disconnect
         */
        this.removeByUUID = (uuid, reason) => {
            let index = this.targets.findIndex(x => x.uuid == uuid);
            if (index != -1) {
                if (this.targets[index].socket.io._readyState == 'open') {
                    this.targets[index].socket.close();
                }
                this.targets.splice(index, 1);
            }
        };
        /**
         * Internal update, for checking the ping of every nodes
         */
        this.update = () => {
            const h = { name: 'ping', data: 0 };
            this.targets.forEach(x => {
                if (x.socket.io._readyState != 'open')
                    return;
                x.last = Date.now();
                x.socket.send(JSON.stringify(h));
            });
        };
        /**
         * Recevied the shell text from client node
         */
        this.shell_reply = (data, w) => {
            var _a;
            (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.shellReply(data, w);
        };
        /**
         * Recevied the folders from client node
         */
        this.shell_folder_reply = (data, w) => {
            var _a;
            (_a = this.proxy) === null || _a === void 0 ? void 0 : _a.folderReply(data, w);
        };
        /**
         * Get the system information and assign to the node object
         * @param info Data
         * @param source The node target
         */
        this.system_info = (info, source) => {
            if (source == undefined)
                return;
            source.information = info;
        };
        /**
         * Get the node information and assign to the node object
         * @param info Data
         * @param source The node target
         */
        this.node_info = (info, source) => {
            if (source == undefined)
                return;
            source.load = info;
        };
        /**
         * Get the bouncing back function call\
         * THis method will calculate the time different and assign the node object
         * @param info Dummy number, nothing important, can be ignore
         * @param source The node target
         */
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
//# sourceMappingURL=socket_manager.js.map