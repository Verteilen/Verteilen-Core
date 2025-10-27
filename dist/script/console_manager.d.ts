import { BusType, EmitterProxy, Header, RawSend } from "../interface";
export type Listener = (...args: any[]) => void;
export declare class ConsoleManager {
    url: string;
    ws: WebSocket;
    emitter: EmitterProxy<BusType>;
    messager_log: Function;
    events: Array<[string, Array<Listener>]>;
    events_once: Array<[string, Array<Listener>]>;
    buffer: Array<Header>;
    constructor(_url: string, _messager_log: Function, _emitter: EmitterProxy<BusType>);
    get connected(): boolean;
    on: (channel: string, listener: Listener) => void;
    once: (channel: string, listener: Listener) => void;
    off: (channel: string, listener: Listener) => void;
    send: (data: RawSend) => void;
    received: (h: Header) => void;
}
