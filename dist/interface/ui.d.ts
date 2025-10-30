import { BackendType } from "./enum";
export interface AppConfig {
    isExpress: boolean;
    isElectron: boolean;
    isAdmin: boolean;
    haveBackend: boolean;
    login: boolean;
    backendType: BackendType;
}
export interface IMessage {
    ison: boolean;
    timer: number;
    variant: any;
    title: string;
    content: string;
    stack: Array<string>;
}
export interface ClientLog {
    s: boolean;
    tag: string;
    title: string;
    text: Array<string>;
}
export interface ToastData {
    type: string;
    title: string;
    message: string;
    stack?: Array<string>;
}
