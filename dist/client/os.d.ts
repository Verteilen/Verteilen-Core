import { Messager, Messager_log, OnePath, PluginNode, TwoPath } from "../interface";
type getstring = () => string;
type getplugin = () => PluginNode | undefined;
/**
 * The operation system related actions utility\
 * If you want to do something related to things below
 * * File operation
 * * Folder checker
 * * Writing a file
 * * Call a exe file
 *
 * Please get a instance of this, and call the methods instead using fs youself
 */
export declare class ClientOS {
    private messager;
    private messager_log;
    private tag;
    private runtime;
    private children;
    private plugins;
    /**
     *
     * @param _tag The tag getter that put in the prefix of the message
     * @param _messager Message method
     * @param _messager_log Message method with output on the screen feature
     */
    constructor(_tag: getstring, _runtime: getstring, plugins: getplugin, _messager: Messager, _messager_log: Messager_log);
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
    /**
     * Kill all current running processes
     */
    stopall: () => void;
    lib_command: (command: string, args: string) => Promise<string>;
    /**
     * Call command on terminal
     * @param cwd The system location
     * @param command Command name, Or you can put filename here
     * @param args Arguments, It will split by space afterward
     * @returns
     */
    command: (command: string, args: string, cwd?: string) => Promise<string>;
    command_sync: (command: string, args: string, cwd?: string) => Promise<string>;
    command_exec: (command: string, args: string, cwd?: string) => void;
    /**
     * Append the plugin folder into
     * @returns
     */
    get_env: () => NodeJS.ProcessEnv;
}
export {};
