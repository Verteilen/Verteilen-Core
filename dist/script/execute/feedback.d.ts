import { BusAnalysis } from "../../interface";
import { ExecuteManager_Base } from "./base";
/**
 * Recevied the information from the nodes\
 * This include job feedback and error feedback and pong and other stuff
 */
export declare class ExecuteManager_Feedback extends ExecuteManager_Base {
    /**
     * The analysis method for decoding the information where the nodes is sending
     * @param d Package info
     */
    Analysis: (d: BusAnalysis) => void;
    /**
     * Print information, sended by the node worker
     * @param data feedback data, any type
     * @param source The node target
     */
    private feedback_message;
    /**
     * The job has been finish executing, sended by the node worker
     * @param data feedback data
     * @param source The node target
     */
    private feedback_job;
    /**
     * When one of the node decide to change the database of string value
     * @param data The assigner
     */
    private feedback_string;
    /**
     * When one of the node decide to change the database of number value
     * @param data The assigner
     */
    private feedback_number;
    /**
     * When one of the node decide to change the database of object value
     * @param data The assigner
     */
    private feedback_object;
    /**
     * When one of the node decide to change the database of boolean value
     * @param data The assigner
     */
    private feedback_boolean;
    private GetCronAndWork;
}
