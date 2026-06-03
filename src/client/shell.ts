// ========================
//                           
//      Share Codebase     
//                           
// ========================
//
//  ? Shell module
//  ? Run raw command directly to computed node
//  ! It's unrelated to the job execution
//
import { ChildProcess, spawn } from "child_process";
import { Socket } from 'socket.io';
import { Messager, ShellFolder, Single } from "../interface";
import { Client } from "./client";
import { ClientOS } from "./os";


export class ClientShell {
    private messager:Messager
    private messager_log:Messager
    private os:ClientOS
    private shell_workers:Array<[string, Socket, ChildProcess]> = []

    constructor(_messager:Messager, _messager_log:Messager, _client:Client){
        this.os = new ClientOS(() => "SHELL", () => "", () => undefined, _messager, _messager_log)
        this.messager = _messager
        this.messager_log = _messager_log
    }

    /**
     * Open shell consolet 
     */
    open_shell = (uuid:string, source:Socket) => {
        const shell = this.shell_workers.find(x => x[0] == uuid)
        if(shell != undefined){
            this.messager_log(`[Shell] Error the source already open the shell`)
            return
        }
        const program = process.platform === "win32" ? 'cmd' : 'bash'
        const child = spawn(program, [], 
            { 
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
                windowsHide: true,
                env: {
                    ...process.env,
                }
        })
        this.shell_workers.push([uuid, source, child])
        let t = ""
        const workerFeedback = (str:string) => {
            for(let i = 0; i < str.length; i++){
                if(str[i] == '\n'){
                    const data:Single = {
                        data: t
                    }
                    source.emit("shell_reply", data)
                    t = ""
                }else{
                    t += str[i]
                }
            }
        }
        child.on('exit', (code, signal) => {
            const index = this.shell_workers.findIndex(x => x[1] == source)
            if(index != -1) this.shell_workers.splice(index, 1)
        })
        child.on('message', (message, sendHandle) => {
            workerFeedback(message.toString())
        })
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            workerFeedback(chunk.toString())
        })
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk) => {
            workerFeedback(chunk.toString())
        })
    }

    /**
     * Open shell console
     * @param input
     */
    enter_shell = (uuid:string, input:string) => {
        const shell = this.shell_workers.find(x => x[0] == uuid)
        if(shell == undefined){
            this.messager_log(`[Shell] Cannot find shell instance`)
            return
        }
        shell[2].stdin?.write(input + '\n')
        if(process.platform == 'win32') shell[2].stdin?.write("echo %cd%" + '\n')
        else shell[2].stdin?.write("pwd" + '\n')
    }

    /**
     * Open shell console
     * @param input 
     */
    close_shell = (uuid:string) => {
        const shell = this.shell_workers.find(x => x[0] == uuid)
        if(shell == undefined){
            this.messager_log(`[Shell] Cannot find shell instance`)
            return
        }
        shell[2].kill()
    }

    /**
     * Open shell console
     * @param input 
     */
    close_shell_all = () => {
        this.shell_workers.forEach(p => {
            if(p == undefined){
                this.messager_log(`[Shell] Cannot find shell instance`)
                return
            }
            p[2].kill()
        })
        this.shell_workers = []
    }

    shell_folder = (uuid:string, path:string) => {
        const shell = this.shell_workers.find(x => x[0] == uuid)
        if(shell == undefined){
            this.messager_log(`[Shell] Cannot find shell instance`)
            return
        }
        if(path.length == 0){
            path = process.cwd()
        }
        if(!this.os.fs_dir_exist({path: path})){
            path = process.cwd()
        }
        const d:ShellFolder = {
            path: path,
            cwd: process.cwd(),
            folders: this.os.dir_dirs({path: path}),
            files: this.os.dir_files({path: path})
        }
        shell[1].emit("shell_folder_reply", d)
    }

    disconnect = (uuid:string) => {
        const shell = this.shell_workers.find(x => x[0] == uuid)
        if(shell == undefined) return
        shell[2].kill()
    }

    disconnect2 = (source:Socket) => {
        const shell = this.shell_workers.find(x => x[1] == source)
        if(shell == undefined) return
        shell[2].kill()
    }
}