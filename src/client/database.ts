// ========================
//                           
//      Share Codebase     
//                           
// ========================
import WebSocket from "ws";
import { Header, Setter } from "../interface";

/**
 * The database feedback helper\
 * Update the main database container on the cluster server
 */
export class ClientDatabase {
    private source:WebSocket | undefined

    constructor(_source:WebSocket | undefined){
        this.source = _source
    }

    /**
     * Update database number on the cluster server
     * @param data Target KeyValue
     */
    feedbacknumber = (data:Setter) => {
        this.feedback("feedback_number", data)
    }
    /**
     * Update database boolean on the cluster server
     * @param data Target KeyValue
     */
    feedbackboolean = (data:Setter) => {
        this.feedback("feedback_boolean", data)
    }
    /**
     * Update database string on the cluster server
     * @param data Target KeyValue
     */
    feedbackstring = (data:Setter) => {
        this.feedback("feedback_string", data)
    }
    feedbackobject = (data:Setter) => {
        this.feedback("feedback_object", data)
    }
    feedbacklist = (data:Setter) => {
        this.feedback("feedback_list", data)
    }
    feedbackselect = (data:Setter) => {
        this.feedback("feedback_select", data)
    }
    private feedback = (title:string, data:Setter) => {
        if(this.source == undefined) return
        const p:Header = {
            name: title,
            data: data
        }
        this.source.send(JSON.stringify(p, null, 2))
    }
}