// ========================
//                           
//      Share Codebase     
//                           
// ========================
//
//  ? Handle server -> admin
//  ? This thing exist in computed server space
//
import { Socket } from 'socket.io';
import { v6 as uuidv6 } from 'uuid'

type calltype = Array<[string, (...args: Array<any>) => void]>

export interface ConsoleServerContainer {
    uuid: string
    socket:Socket
    typeMap: calltype
}

/**
 * Console server helper, cluster server side handle web client connection instances
 */
export class ConsoleServerManager {
    /**
     * Websocket instance for admin
     */
    admins: Array<ConsoleServerContainer> = []
    messager_log:Function

    constructor(_messager_log:Function){
        this.messager_log = _messager_log
    }

    Added = (socket:Socket, typeMap: calltype):ConsoleServerContainer | undefined => {
        const buffer:ConsoleServerContainer = {
            uuid: uuidv6(),
            socket: socket,
            typeMap: typeMap
        }

        const target = this.admins.find(x => x.socket == socket)
        if(target != undefined){
            this.messager_log('[Source Analysis] Failed, Socket is already in record')
            return target;
        }

        socket.on('disconnect', (reason, des) => {
            const index = this.admins.findIndex(x => x.socket == socket)
            if(index != -1){
                this.admins.splice(index, 1)
            }
        })

        typeMap.forEach(x => {
            socket.on(x[0], x[1])
        })
        
        return buffer
    }
}