import { Messager, Messager_log } from '../interface';
export declare class WebhookServerManager {
    private httpss;
    private server;
    private sources;
    private messager;
    private messager_log;
    constructor(_messager: Messager, _messager_log: Messager_log);
    Init: () => Promise<void>;
    Destroy: () => void;
    Release: () => void;
    private get_pem;
}
