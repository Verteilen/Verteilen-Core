import { RecordType } from "../interface";
import { RecordIOLoader, RecordLoader } from "./io";
export interface EventObserverAction {
    loaded: (type: RecordType) => void;
    changed: (type: RecordType) => void;
}
export declare class EventObserver implements RecordLoader {
    loader: RecordLoader;
    action: EventObserverAction;
    constructor(loader: RecordLoader, action: EventObserverAction);
    get project(): RecordIOLoader;
    get task(): RecordIOLoader;
    get job(): RecordIOLoader;
    get database(): RecordIOLoader;
    get node(): RecordIOLoader;
    get log(): RecordIOLoader;
    get lib(): RecordIOLoader;
    get user(): RecordIOLoader;
}
export declare class ProxyRecordIOLoader implements RecordIOLoader {
    loader: RecordIOLoader;
    type: RecordType;
    action: EventObserverAction;
    constructor(loader: RecordIOLoader, type: RecordType, action: EventObserverAction);
    load_all: () => Promise<Array<string>>;
    delete_all: () => Promise<void>;
    list_all: () => Promise<Array<string>>;
    save: (name: string, data: string) => Promise<void>;
    load: (name: string, cache: boolean) => Promise<string>;
    rename: (name: string, newname: string) => Promise<void>;
    delete: (name: string) => Promise<void>;
}
export declare const CreateEventObserver: (loader: RecordLoader, event: EventObserverAction) => EventObserver;
