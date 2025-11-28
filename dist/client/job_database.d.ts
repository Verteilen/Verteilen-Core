import { Setter } from "../interface";
export declare class ClientJobDatabase {
    /**
     * Update database number on the cluster server
     * @param data Target KeyValue
     */
    feedbacknumber: (data: Setter) => void;
    feedbackboolean: (data: Setter) => void;
    feedbackstring: (data: Setter) => void;
    feedbackobject: (data: Setter) => void;
    feedbacklist: (data: Setter) => void;
    feedbackselect: (data: Setter) => void;
    private feedback;
}
