"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleServerManager = void 0;
const uuid_1 = require("uuid");
/**
 * Console server helper, cluster server side handle web client connection instances
 */
class ConsoleServerManager {
    constructor(_messager_log) {
        /**
         * Websocket instance for admin
         */
        this.admins = [];
        this.Analysis = (ws, h) => {
            const target = this.admins.find(x => x.ws == ws);
            if (target == undefined) {
                this.messager_log('[Source Analysis] Failed, websocket not found in record');
                return;
            }
            if (h == undefined) {
                this.messager_log('[Source Analysis] Failed, Get a undefined value');
                return;
            }
            if (h.message != undefined && h.message.length > 0) {
                this.messager_log(`[Source Analysis] ${h.message}`);
            }
            if (h.data == undefined)
                return;
            if (target.typeMap.hasOwnProperty(h.name)) {
                const castingFunc = target.typeMap[h.name];
                if (h.data instanceof Array) {
                    if (h.data.length == 1)
                        castingFunc(target.ws, h.data[0]);
                    else
                        castingFunc(target.ws, ...h.data);
                }
                else {
                    castingFunc(target.ws, h.data);
                }
            }
            else {
                this.messager_log(`[Source Analysis] Failed, Unknown, name: ${h.name}, meta: ${h.meta}`);
            }
        };
        this.messager_log = _messager_log;
    }
}
exports.ConsoleServerManager = ConsoleServerManager;
ConsoleServerManager.Create = (_ws, _typeMap) => {
    return {
        uuid: (0, uuid_1.v6)(),
        ws: _ws,
        typeMap: _typeMap
    };
};
//# sourceMappingURL=console_server_manager.js.map