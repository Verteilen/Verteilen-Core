import { Project, RecordType, Database, UserProfile, Library, ExecutionLog, Node } from "../interface";
export interface MemoryData {
    projects: Array<Project>;
    database: Array<Database>;
    nodes: Array<Node>;
    logs: Array<ExecutionLog>;
    libs: Array<Library>;
    user: Array<UserProfile>;
}
export interface RecordIOLoader {
    load_all: () => Promise<Array<string>>;
    delete_all: () => Promise<void>;
    list_all: () => Promise<Array<string>>;
    save: (name: string, data: string) => Promise<void>;
    load: (name: string, cache: boolean) => Promise<string>;
    rename: (name: string, newname: string) => Promise<void>;
    delete: (name: string) => Promise<void>;
}
export interface RecordLoader {
    project: RecordIOLoader;
    database: RecordIOLoader;
    node: RecordIOLoader;
    log: RecordIOLoader;
    lib: RecordIOLoader;
    user: RecordIOLoader;
}
export interface RecordIOBase {
    root: string;
    join: (...paths: Array<string>) => string;
    read_dir: (path: string) => Promise<Array<string>>;
    read_dir_dir: (path: string) => Promise<Array<string>>;
    read_dir_file: (path: string) => Promise<Array<string>>;
    read_string: (path: string, options?: any) => Promise<string>;
    write_string: (path: string, content: string) => Promise<void>;
    exists: (path: string) => boolean;
    mkdir: (path: string) => Promise<void>;
    rm: (path: string) => Promise<void>;
    cp: (path: string, newpath: string) => Promise<void>;
}
export interface RecordMongoBase {
}
export declare const _CreateRecordMemoryLoader: (loader: MemoryData, type: RecordType) => RecordIOLoader;
export declare const _CreateRecordIOLoader: (loader: RecordIOBase, memory: MemoryData, type: RecordType, folder: string, ext?: string) => RecordIOLoader;
export declare const CreateRecordMemoryLoader: (loader: MemoryData) => RecordLoader;
export declare const CreateRecordIOLoader: (loader: RecordIOBase, memory: MemoryData) => RecordLoader;
export declare const CreateRecordMongoLoader: (loader: RecordMongoBase, folder: string, ext?: string) => void;
