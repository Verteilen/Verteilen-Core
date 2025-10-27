"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientShell = void 0;
const child_process_1 = require("child_process");
const os_1 = require("./os");
class ClientShell {
    messager;
    messager_log;
    os;
    shell_workers = [];
    constructor(_messager, _messager_log, _client) {
        this.os = new os_1.ClientOS(() => "SHELL", () => "", _messager, _messager_log);
        this.messager = _messager;
        this.messager_log = _messager_log;
    }
    open_shell = (data, source) => {
        if (this.shell_workers.find(x => x[0] == source)) {
            this.messager_log(`[Shell] Error the source already open the shell`);
            return;
        }
        const program = process.platform === "win32" ? 'cmd' : 'bash';
        const child = (0, child_process_1.spawn)(program, [], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
            windowsHide: true,
            env: {
                ...process.env,
            }
        });
        this.shell_workers.push([source, child]);
        let t = "";
        const workerFeedback = (str) => {
            for (let i = 0; i < str.length; i++) {
                if (str[i] == '\n') {
                    const data = {
                        data: t
                    };
                    const d = {
                        name: "shell_reply",
                        data: data
                    };
                    source.send(JSON.stringify(d));
                    t = "";
                }
                else {
                    t += str[i];
                }
            }
        };
        child.on('exit', (code, signal) => {
            const index = this.shell_workers.findIndex(x => x[0] == source);
            if (index != -1)
                this.shell_workers.splice(index, 1);
        });
        child.on('message', (message, sendHandle) => {
            workerFeedback(message.toString());
        });
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            workerFeedback(chunk.toString());
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk) => {
            workerFeedback(chunk.toString());
        });
    };
    enter_shell = (input, source) => {
        const p = this.shell_workers.find(x => x[0] == source);
        if (p == undefined) {
            this.messager_log(`[Shell] Cannot find shell instance`);
            return;
        }
        p[1].stdin?.write(input + '\n');
        if (process.platform == 'win32')
            p[1].stdin?.write("echo %cd%" + '\n');
        else
            p[1].stdin?.write("pwd" + '\n');
    };
    close_shell = (data, source) => {
        const p = this.shell_workers.find(x => x[0] == source);
        if (p == undefined) {
            this.messager_log(`[Shell] Cannot find shell instance`);
            return;
        }
        p[1].kill();
    };
    close_shell_all = (data) => {
        this.shell_workers.forEach(p => {
            if (p == undefined) {
                this.messager_log(`[Shell] Cannot find shell instance`);
                return;
            }
            p[1].kill();
        });
    };
    shell_folder = (data, source) => {
        if (data.length == 0) {
            data = process.cwd();
        }
        if (!this.os.fs_dir_exist({ path: data })) {
            data = process.cwd();
        }
        const d = {
            path: data,
            cwd: process.cwd(),
            folders: this.os.dir_dirs({ path: data }),
            files: this.os.dir_files({ path: data })
        };
        const h = {
            name: "shell_folder_reply",
            data: d
        };
        source.send(JSON.stringify(h));
    };
    disconnect = (source) => {
        const p = this.shell_workers.find(x => x[0] == source);
        if (p == undefined)
            return;
        p[1].kill();
    };
}
exports.ClientShell = ClientShell;
