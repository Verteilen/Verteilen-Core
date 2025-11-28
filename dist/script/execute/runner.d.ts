import { Project } from "../../interface";
import { ExecuteManager_Feedback } from "./feedback";
/**
 * The execute runner
 */
export declare class ExecuteManager_Runner extends ExecuteManager_Feedback {
    /**
     * Boradcasting all the database and library to all the websocket nodes
     * @param p Target project
     */
    SyncDatabase: (p: Project) => void;
}
