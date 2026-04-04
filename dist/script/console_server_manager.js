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
        /**
         * Adding a frontend socket to the list\
         * This include add auto delete event when socket disconnect
         * @param socket Target frontend
         * @param typeMap The event map
         * @returns The socket record
         */
        this.Add = (socket, typeMap) => {
            const buffer = {
                uuid: (0, uuid_1.v6)(),
                socket: socket,
                typeMap: typeMap
            };
            const target = this.admins.find(x => x.socket == socket);
            if (target != undefined) {
                this.messager_log('[Source Analysis] Failed, Socket is already in record');
                return target;
            }
            socket.on('disconnect', (reason, des) => {
                const index = this.admins.findIndex(x => x.socket == socket);
                if (index != -1) {
                    this.admins.splice(index, 1);
                }
            });
            typeMap.forEach(x => {
                socket.on(x[0], x[1]);
            });
            return buffer;
        };
        /**
         * Manually remove the frontend socket
         * @param socket Target frontend
         */
        this.Remove = (socket) => {
            const target = this.admins.findIndex(x => x.socket.id == socket.id);
            if (target != -1) {
                this.admins.splice(target, 1);
            }
            else {
                this.messager_log('[Source Remove Analysis] Failed, Socket is not in record');
            }
        };
        this.messager_log = _messager_log;
    }
}
exports.ConsoleServerManager = ConsoleServerManager;
//# sourceMappingURL=console_server_manager.js.map