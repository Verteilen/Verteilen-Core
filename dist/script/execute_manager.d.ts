import { Libraries, WebsocketPack } from "../interface";
import { ExecuteManager_Runner } from "./execute/runner";
export declare class ExecuteManager extends ExecuteManager_Runner {
    Update: () => void;
    Stop: () => void;
    Register: (lib?: Libraries) => number;
    Clean: () => void;
    Release: () => void;
    NewConnection: (source: WebsocketPack) => void;
    Disconnect: (source: WebsocketPack) => void;
    ClearState: (task_index: number) => void;
    SkipProject: () => number;
    PreviousProject: () => number;
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
