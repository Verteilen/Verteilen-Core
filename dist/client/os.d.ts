import { Messager, Messager_log, OnePath, TwoPath } from "../interface";
type getstring = () => string;
export declare class ClientOS {
    private messager;
    private messager_log;
    private tag;
    private runtime;
    private children;
    constructor(_tag: getstring, _runtime: getstring, _messager: Messager, _messager_log: Messager_log);
    file_copy: (data: TwoPath) => void;
    dir_copy: (data: TwoPath) => void;
    file_delete: (data: OnePath) => void;
    dir_delete: (data: OnePath) => void;
    rename: (data: TwoPath) => void;
    fs_exist: (data: OnePath) => boolean;
    fs_dir_exist: (data: OnePath) => boolean;
    fs_file_exist: (data: OnePath) => boolean;
    dir_files: (data: OnePath) => Array<string>;
    dir_dirs: (data: OnePath) => Array<string>;
    dir_create: (data: OnePath) => void;
    file_write: (data: TwoPath) => void;
    file_read: (data: OnePath) => string;
    stopall: () => void;
    lib_command: (command: string, args: string) => Promise<string>;
    command: (command: string, args: string, cwd?: string) => Promise<string>;
    command_sync: (command: string, args: string, cwd?: string) => Promise<string>;
    command_exec: (command: string, args: string, cwd?: string) => void;
}
export {};
