// ========================
//                           
//      Share Codebase     
//                           
// ========================
//
//  ? Handle server -> admin
//  ? This thing exist in computed server space
//
import * as ws from 'ws';
import { Header } from "../interface";
import { v6 as uuidv6 } from 'uuid'

type calltype = { [key:string]:Function }

export interface ConsoleServerContainer {
    uuid: string
    ws:ws.WebSocket
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

    static Create = (_ws:ws.WebSocket, _typeMap: calltype):ConsoleServerContainer => {
        return {
            uuid: uuidv6(),
            ws: _ws,
            typeMap: _typeMap
        }
    }

    Analysis = (ws:ws.WebSocket, h:Header) => {
        const target = this.admins.find(x => x.ws == ws)
        if(target == undefined){
            this.messager_log('[Source Analysis] Failed, websocket not found in record')
            return;
        }
        if (h == undefined){
            this.messager_log('[Source Analysis] Failed, Get a undefined value')
            return;
        }
        if (h.message != undefined && h.message.length > 0){
            this.messager_log(`[Source Analysis] ${h.message}`)
        }
        if (h.data == undefined) return
        if(target.typeMap.hasOwnProperty(h.name)){
            const castingFunc = target.typeMap[h.name]
            if(h.data instanceof Array){
                if(h.data.length == 1) castingFunc(target.ws, h.data[0])
                else castingFunc(target.ws, ...h.data)
            }else{
                castingFunc(target.ws, h.data)
            }
        }else{
            this.messager_log(`[Source Analysis] Failed, Unknown, name: ${h.name}, meta: ${h.meta}`)
        }
    }
}