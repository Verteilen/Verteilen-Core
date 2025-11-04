import { Job, Database, Project, Task } from "./base";
import { ExecuteState } from "./enum";
import { ExecutionLog, Log } from "./log";
import { Preference } from "./record";
import { Login } from "./server";
import { FeedBack, Header, Setter, ShellFolder, Single, WebsocketPack } from "./struct";
import { DatabaseTable, NodeTable, ProjectTable } from "./table";
import { ToastData } from "./ui";
type Handler<T = unknown> = (event: T) => void;
export type Messager = (msg: string, tag?: string) => void;
export type Messager_log = (msg: string, tag?: string, meta?: string) => void;
export interface BusAnalysis {
    name: string;
    h: Header;
    c: WebsocketPack | undefined;
}
export interface Rename {
    oldname: string;
    newname: string;
}
export interface RawSend {
    name: string;
    token?: string;
    data: any;
}
export interface EmitterProxy<T> {
    on<Key extends keyof T>(type: T, handler: Handler<T[Key]>): void;
    off<Key extends keyof T>(type: T, handler: Handler<T[Key]>): void;
    emit<Key extends keyof T>(type: T, handler: T[Key]): void;
}
export interface ExecuteProxy {
    executeProjectStart: (data: [Project, number]) => void;
    executeProjectFinish: (data: [Project, number]) => void;
    executeTaskStart: (data: [Task, number]) => void;
    executeTaskFinish: (data: Task) => void;
    executeSubtaskStart: (data: [Task, number, string]) => void;
    executeSubtaskUpdate: (data: [Task, number, string, ExecuteState]) => void;
    executeSubtaskFinish: (data: [Task, number, string]) => void;
    executeJobStart: (data: [Job, number, string]) => void;
    executeJobFinish: (data: [Job, number, string, number]) => void;
    feedbackMessage: (data: FeedBack) => void;
    updateDatabase: (data: Database) => void;
}
export interface NodeProxy {
    shellReply: (data: Single, w?: WebsocketPack) => void;
    folderReply: (data: ShellFolder, w?: WebsocketPack) => void;
}
export type BusType = {
    setting: void;
    guide: void;
    makeToast: ToastData;
    modeSelect: boolean;
    createProject: void;
    recoverProject: ProjectTable;
    recoverDatabase: DatabaseTable;
    relogin: void;
    loginGuest: void;
    login: Login;
    logout: void;
    selectDatabase: string;
    updateLocate: void;
    updateNode: Array<NodeTable>;
    updateCurrent: ExecutionLog;
    updateLog: Log;
    updateHandle: void;
    slowUpdateHandle: void;
    shellReply: Single;
    folderReply: ShellFolder;
    feedbackMessage: FeedBack;
    savePreference: Preference;
    renameScript: Rename;
    deleteScript: string;
    analysis: BusAnalysis;
    debuglog: string;
    hotkey: string;
    isExpress: boolean;
    delay: Setter;
    system: Setter;
};
export type BusWebType = {
    raw_send: RawSend;
    locate: string;
    load_preference: string;
    load_cookie: void;
    get_token: string;
};
export {};
