"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleManager = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
//
//  ? Handle admin -> server
//  ? This thing exist in admin client space
//
const socket_io_client_1 = require("socket.io-client");
/**
 * Console helper, web client side handle cluster server connection instance
 */
class ConsoleManager {
    constructor(url, messager_log, emitter) {
        this.buffer = [];
        this.connect = () => {
        };
        this.on = (channel, listener) => {
            const index = this.events.findIndex(x => x[0] == channel);
            if (index == -1) {
                this.events.push([channel, [listener]]);
            }
            else {
                this.events[index][1].push(listener);
            }
        };
        this.once = (channel, listener) => {
            const index = this.events.findIndex(x => x[0] == channel);
            if (index == -1) {
                this.events_once.push([channel, [listener]]);
            }
            else {
                this.events_once[index][1].push(listener);
            }
        };
        this.off = (channel, listener) => {
            const index = this.events.findIndex(x => x[0] == channel);
            if (index == -1) {
                return;
            }
            else {
                const index2 = this.events[index][1].findIndex(x => x == listener);
                if (index2 != -1)
                    this.events[index][1].splice(index2, 1);
            }
        };
        this.close = () => {
            if (this.connected) {
                this.socket.close();
            }
        };
        this.send = (data) => {
            const d = {
                name: data.name,
                token: data.token,
                data: data.data
            };
            if (this.socket.io._readyState !== 'open') {
                this.buffer.push(d);
            }
            else {
                this.socket.send(JSON.stringify(d));
            }
        };
        this.received = (h) => {
            if (h == undefined) {
                this.messager_log('[Source Analysis] Analysis Failed, Value is undefined');
                return;
            }
            if (h.message != undefined && h.message.length > 0) {
                this.messager_log(`[Source Analysis] ${h.message}`);
            }
            if (h.data == undefined)
                return;
            const index = this.events.findIndex(x => x[0] == h.name);
            const index2 = this.events_once.findIndex(x => x[0] == h.name);
            let p = false;
            if (index != -1) {
                const castingFunc = this.events[index][1];
                castingFunc.forEach(x => {
                    if (h.data instanceof Array) {
                        if (h.data.length == 1)
                            x(h.data[0]);
                        else
                            x(...h.data);
                    }
                    else {
                        x(h.data);
                    }
                });
                p = true;
            }
            if (index2 != -1) {
                const castingFunc = this.events_once[index2][1];
                castingFunc.forEach(x => {
                    if (h.data instanceof Array) {
                        if (h.data.length == 1)
                            x(h.data[0]);
                        else
                            x(...h.data);
                    }
                    else {
                        x(h.data);
                    }
                });
                this.events_once.splice(index2, 1);
                p = true;
            }
            if (!p) {
                this.messager_log(`[Source Analysis] Analysis Failed, Unknowed header, name: ${h.name}, meta: ${h.meta}`);
            }
        };
        this.messager_log = messager_log;
        this.url = url;
        this.emitter = emitter;
        this.events = [];
        this.events_once = [];
        this.socket = (0, socket_io_client_1.io)(this.url, {
            transports: ['websocket'],
            secure: true,
            rejectUnauthorized: false,
        });
        this.socket.io.on('error', (err) => {
            this.messager_log(`[Error] Express Connection failed ${this.url}`);
        });
        this.socket.io.on('close', (reason, des) => {
            this.messager_log(`[Close] Express Client close, ${des}, ${reason}`);
            this.buffer = [];
        });
        this.socket.io.on('open', () => {
            this.messager_log('[Connection] Express New Connection !');
            for (let i = 0; i < this.buffer.length; i++) {
                this.socket.send(JSON.stringify(this.buffer[i]));
            }
            this.buffer = [];
        });
        this.socket.io.on('packet', (packet) => {
            this.received(packet.data);
        });
    }
    get readyState() {
        return this.socket.io._readyState;
    }
    get connected() {
        return this.readyState === 'open';
    }
}
exports.ConsoleManager = ConsoleManager;
//# sourceMappingURL=console_manager.js.map