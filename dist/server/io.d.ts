import { MongoClient } from "mongodb";
import { Project, RecordType, Database, UserProfile, Library, ExecutionLog, Node, Task, Job } from "../interface";
export interface MemoryData {
    projects: Array<Project>;
    tasks: Array<Task>;
    jobs: Array<Job>;
    database: Array<Database>;
    nodes: Array<Node>;
    logs: Array<ExecutionLog>;
    libs: Array<Library>;
    user: Array<UserProfile>;
}
export interface RecordIOLoader {
    load_all: (cache: boolean, token?: string) => Promise<Array<string>>;
    delete_all: (token?: string) => Promise<Array<string>>;
    list_all: (token?: string) => Promise<Array<string>>;
    save: (uuid: string, data: string, token?: string) => Promise<boolean>;
    load: (uuid: string, token?: string) => Promise<string>;
    delete: (uuid: string, token?: string) => Promise<boolean>;
}
export interface RecordLoader {
    project: RecordIOLoader;
    task: RecordIOLoader;
    job: RecordIOLoader;
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
export declare const _CreateRecordMemoryLoader: (loader: MemoryData, type: RecordType) => RecordIOLoader;
export declare const _CreateRecordIOLoader: (loader: RecordIOBase, memory: MemoryData, type: RecordType, folder: string, ext?: string) => RecordIOLoader;
export declare const _CreateRecordMongoLoader: (loader: MongoClient, memory: MemoryData, type: RecordType, db: string, collection: string) => RecordIOLoader;
export declare const CreateRecordMemoryLoader: (loader: MemoryData) => RecordLoader;
export declare const CreateRecordIOLoader: (loader: RecordIOBase, memory: MemoryData) => RecordLoader;
export declare const CreateRecordMongoLoader: (url: string, memory: MemoryData) => RecordLoader;
