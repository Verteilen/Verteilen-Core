import * as vm from 'vm';
import { Job, Libraries, Messager, Messager_log, Database } from '../interface';
import { ClientJobDatabase } from './job_database';
import { ClientOS } from './os';
export declare const safeEval: (code: string, context?: any, opts?: vm.RunningCodeInNewContextOptions | string) => any;
type Getlib = () => Libraries | undefined;
type Getpara = () => Database | undefined;
type Getjob = () => Job | undefined;
export declare class ClientJavascript {
    path: any;
    os: any;
    env: any;
    message: any;
    http: any;
    constructor(_messager: Messager, _messager_log: Messager_log, _getjob: Getjob);
    /**
     * Before running the js scripts, We must init first.\
     * ! Otherwise it won't work or throw error
     * @param _messager Message habndle
     * @param _messager_log Message habndle with print on screen feature
     * @param _clientos OS worker
     * @param _para Database worker
     * @param _getlib library getter method
     * @param _getpara Database getter method
     * @param _getjob Job getter method
     */
    static Init: (_messager: Messager, _messager_log: Messager, _clientos: ClientOS, _para: ClientJobDatabase, _getlib: Getlib, _getpara: Getpara, _getjob: Getjob) => void;
    /**
     * Running js\
     * With reference libraries\
     * @param js js script text
     * @param libs Libraries header names
     * @returns Calcuate result
     */
    JavascriptExecuteWithLib: (javascript: string, libs: Array<string>, log?: Messager) => Promise<any>;
    /**
     * Running js
     * @param js js script text
     * @returns Calcuate result
     */
    JavascriptExecute: (javascript: string, log?: Messager) => Promise<any>;
    private getJavascriptEnv;
    private filename;
    private extname;
    private dirname;
    private exec;
    private command;
    private plugin_exec;
    private plugin_command;
    private copyfile;
    private copydir;
    private deletefile;
    private deletedir;
    private rename;
    private exist;
    private listfile;
    private listdir;
    private createdir;
    private writefile;
    private readfile;
    private wait;
    private sleep;
    private httpGet;
    private httpPost;
    private httpDelete;
    private httpPatch;
    private httpPut;
    private httpGo;
}
export {};
