import { ExecuteState } from "./enum";
export interface ExecuteData {
    uuid: string;
    state: ExecuteState;
}
export interface RecordHeader {
    projects: Array<string>;
    nodes: Array<string>;
}
export interface PluginToken {
    name: string;
    token: string;
}
export interface Preference_Recover {
    projects: Array<[string | null, string | null]>;
    nodes: Array<string | null>;
}
export interface Preference {
    lan: string;
    notification: boolean;
    theme: string;
    font: number;
    log: boolean;
    plugin_token: Array<PluginToken>;
    animation: boolean;
    recover?: Preference_Recover;
    mode?: number;
    url?: string;
}
export interface Library {
    uuid: string;
    name: string;
    load: boolean;
    content: string;
}
export interface Libraries {
    libs: Array<Library>;
}
export interface FileState {
    name: string;
    size: number;
    time: Date;
}
export declare const CreatePreference: () => Preference;
