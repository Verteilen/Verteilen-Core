import { Project } from "../../interface";
import { ExecuteManager_Feedback } from "./feedback";
export declare class ExecuteManager_Runner extends ExecuteManager_Feedback {
    SyncDatabase: (p: Project) => void;
}
