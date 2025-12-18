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
            p.socket.emit("open_shell", uuid);
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
            p.socket.emit("enter_shell", uuid, text);
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
            p.socket.emit("close_shell", uuid);
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
            p.socket.emit("shell_folder", uuid, path);
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
            let client = (0, socket_io_client_1.io)(url, {
                transports: ['websocket'],
                secure: true,
                rejectUnauthorized: false,
            });
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
            this.analysis(client);
            return client;
        };
        /**
         * The analysis method for the node connection instance
         * @param h Package
         * @param c Connection instance
         */
        this.analysis = (socket) => {
            this.socket_analysis(socket);
            this.onAnalysis(socket);
        };
        this.socket_analysis = (socket) => {
            socket.on('system_info', this.system_info);
            socket.on('shell_reply', this.shell_reply);
            socket.on('shell_folder_reply', this.shell_folder_reply);
            socket.on('node_info', this.node_info);
            socket.on('pong', this.pong);
            socket.on('plugin_info_reply', this.plugin_info_reply);
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
            this.targets.forEach(x => {
                if (x.socket.io._readyState != 'open' || x.socket.id == undefined)
                    return;
                x.last = Date.now();
                x.socket.emit('ping', x.socket.id);
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
        this.system_info = (id, info) => {
            const source = this.targets.find(x => x.socket.id == id);
            if (source == undefined)
                return;
            source.information = info;
        };
        /**
         * Get the node information and assign to the node object
         * @param info Data
         * @param source The node target
         */
        this.node_info = (id, info) => {
            const source = this.targets.find(x => x.socket.id == id);
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
        this.pong = (id) => {
            const source = this.targets.find(x => x.socket.id == id);
            if (source == undefined || source.last == undefined)
                return;
            source.ms = Date.now() - source.last;
        };
        this.plugin_info_reply = (id, data) => {
            const source = this.targets.find(x => x.socket.id == id);
            if (source == undefined)
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