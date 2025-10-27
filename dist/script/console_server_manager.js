"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleServerManager = void 0;
class ConsoleServerManager {
    ws;
    typeMap;
    messager_log;
    constructor(_ws, _messager_log, _typeMap) {
        this.messager_log = _messager_log;
        this.ws = _ws;
        this.typeMap = _typeMap;
    }
    Analysis = (h) => {
        if (h == undefined) {
            this.messager_log('[Source Analysis] Failed, Get a undefined value');
            return;
        }
        if (h.message != undefined && h.message.length > 0) {
            this.messager_log(`[Source Analysis] ${h.message}`);
        }
        if (h.data == undefined)
            return;
        if (this.typeMap.hasOwnProperty(h.name)) {
            const castingFunc = this.typeMap[h.name];
            if (h.data instanceof Array) {
                if (h.data.length == 1)
                    castingFunc(this.ws, h.data[0]);
                else
                    castingFunc(this.ws, ...h.data);
            }
            else {
                castingFunc(this.ws, h.data);
            }
        }
        else {
            this.messager_log(`[Source Analysis] Failed, Unknown, name: ${h.name}, meta: ${h.meta}`);
        }
    };
}
exports.ConsoleServerManager = ConsoleServerManager;
