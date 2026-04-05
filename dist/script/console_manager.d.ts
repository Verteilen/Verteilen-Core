import { Socket } from "socket.io-client";
import { BusType, EmitterProxy, Header, RawSend } from "../interface";
export type Listener = (...args: any[]) => void;
/**
 * Console helper, web client side handle cluster server connection instance
 */
export declare class ConsoleManager {
    url: string;
    socket: Socket;
    emitter: EmitterProxy<BusType>;
    messager_log: Function;
    events: Array<[string, Array<Listener>]>;
    events_once: Array<[string, Array<Listener>]>;
    buffer: Array<Header>;
    constructor(url: string, messager_log: Function, emitter: EmitterProxy<BusType>);
    get readyState(): string;
    get connected(): boolean;
    connect: () => void;
    on: (channel: string, listener: Listener) => void;
    once: (channel: string, listener: Listener) => void;
    off: (channel: string, listener: Listener) => void;
    close: () => void;
    send: (data: RawSend) => void;
    received: (h: Header) => void;
}
