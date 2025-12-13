// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { Socket } from "socket.io";
import { Setter } from "../interface";

/**
 * The database feedback helper\
 * Update the main database container on the cluster server
 */
export class ClientDatabase {
    private source:Socket | undefined

    constructor(_source:Socket | undefined){
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
        this.source.emit(title, data)
    }
}