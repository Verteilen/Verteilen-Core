import { Project, Database, UserProfile, Library, ExecutionLog, Node, Task, Job } from "../interface";
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
    fetch_all: () => Promise<Array<string>>;
    load_all: (token?: string) => Promise<Array<string>>;
    delete_all: (token?: string) => Promise<Array<string>>;
    list_all: (token?: string) => Promise<Array<string>>;
    save: (uuid: string, data: string, token?: string) => Promise<boolean>;
    load: (uuid: string, token?: string) => Promise<string>;
    delete: (uuid: string, token?: string) => Promise<boolean>;
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
export declare const CreateRecordMemoryLoader_Browser: (loader: MemoryData) => RecordLoader;
