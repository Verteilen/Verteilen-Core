import { BusAnalysis } from "../../interface";
import { ExecuteManager_Base } from "./base";
export declare class ExecuteManager_Feedback extends ExecuteManager_Base {
    Analysis: (d: BusAnalysis) => void;
    private feedback_message;
    private feedback_job;
    private feedback_string;
    private feedback_number;
    private feedback_object;
    private feedback_boolean;
    private GetCronAndWork;
}
