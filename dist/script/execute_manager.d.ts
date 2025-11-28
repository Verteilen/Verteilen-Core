import { Libraries, WebsocketPack } from "../interface";
import { ExecuteManager_Runner } from "./execute/runner";
/**
 * Cluster server calculation worker\
 * The most important worker in the entire application
 */
export declare class ExecuteManager extends ExecuteManager_Runner {
    /**
     * The update function for let this worker start each iteration
     */
    Update: () => void;
    /**
     * Pause has been called
     */
    Stop: () => void;
    /**
     * Register projects to worker\
     * If failed register, the buffer will remind empty
     * @param projects Target
     * @returns -1: register failed, 0: successfully
     */
    Register: (lib?: Libraries) => number;
    /**
     * This will reset the state, and emppty all the buffer
     */
    Clean: () => void;
    /**
     * Tell clients release lib and database data
     */
    Release: () => void;
    /**
     * When new connection (Node) has benn connected
     * @param source Target
     */
    NewConnection: (source: WebsocketPack) => void;
    Disconnect: (source: WebsocketPack) => void;
    ClearState: (task_index: number) => void;
    /**
     * When user trying to skip project
     * @returns The index of the project
     * -1: Skip to finish
     * -2: Skip failed
     */
    SkipProject: () => number;
    PreviousProject: () => number;
    /**
     * When user trying to skip task
     * @returns The index of the task
     * -1: Skip to finish
     * -2: Skip failed
     */
    SkipTask: () => number;
    PreviousTask: () => number;
    SkipSubTask: (v: number) => number;
    private jumpProject;
    private jumpTask;
    private skipProjectFirst;
    private _jumpProject;
    private skipTaskFirst;
    private previousTaskFirst;
    private skipTask;
    private previousTask;
}
