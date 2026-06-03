import { Socket } from "socket.io";
import { Setter } from "../interface";
/**
 * The database feedback helper\
 * Update the main database container on the cluster server
 */
export declare class ClientDatabase {
    private source;
    constructor(_source: Socket | undefined);
    /**
     * Update database number on the cluster server
     * @param data Target KeyValue
     */
    feedbacknumber: (data: Setter) => void;
    /**
     * Update database boolean on the cluster server
     * @param data Target KeyValue
     */
    feedbackboolean: (data: Setter) => void;
    /**
     * Update database string on the cluster server
     * @param data Target KeyValue
     */
    feedbackstring: (data: Setter) => void;
    feedbackobject: (data: Setter) => void;
    feedbacklist: (data: Setter) => void;
    feedbackselect: (data: Setter) => void;
    private feedback;
}
