"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientShell = void 0;
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
const child_process_1 = require("child_process");
const os_1 = require("./os");
class ClientShell {
    constructor(_messager, _messager_log, _client) {
        this.shell_workers = [];
        /**
         * Open shell consolet
         */
        this.open_shell = (uuid, source) => {
            const shell = this.shell_workers.find(x => x[0] == uuid);
            if (shell != undefined) {
                this.messager_log(`[Shell] Error the source already open the shell`);
                return;
            }
            const program = process.platform === "win32" ? 'cmd' : 'bash';
            const child = (0, child_process_1.spawn)(program, [], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
                windowsHide: true,
                env: Object.assign({}, process.env)
            });
            this.shell_workers.push([uuid, source, child]);
            let t = "";
            const workerFeedback = (str) => {
                for (let i = 0; i < str.length; i++) {
                    if (str[i] == '\n') {
                        const data = {
                            data: t
                        };
                        source.emit("shell_reply", data);
                        t = "";
                    }
                    else {
                        t += str[i];
                    }
                }
            };
            child.on('exit', (code, signal) => {
                const index = this.shell_workers.findIndex(x => x[1] == source);
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
        /**
         * Open shell console
         * @param input
         */
        this.enter_shell = (uuid, input) => {
            var _a, _b, _c;
            const shell = this.shell_workers.find(x => x[0] == uuid);
            if (shell == undefined) {
                this.messager_log(`[Shell] Cannot find shell instance`);
                return;
            }
            (_a = shell[2].stdin) === null || _a === void 0 ? void 0 : _a.write(input + '\n');
            if (process.platform == 'win32')
                (_b = shell[2].stdin) === null || _b === void 0 ? void 0 : _b.write("echo %cd%" + '\n');
            else
                (_c = shell[2].stdin) === null || _c === void 0 ? void 0 : _c.write("pwd" + '\n');
        };
        /**
         * Open shell console
         * @param input
         */
        this.close_shell = (uuid) => {
            const shell = this.shell_workers.find(x => x[0] == uuid);
            if (shell == undefined) {
                this.messager_log(`[Shell] Cannot find shell instance`);
                return;
            }
            shell[2].kill();
        };
        /**
         * Open shell console
         * @param input
         */
        this.close_shell_all = () => {
            this.shell_workers.forEach(p => {
                if (p == undefined) {
                    this.messager_log(`[Shell] Cannot find shell instance`);
                    return;
                }
                p[2].kill();
            });
            this.shell_workers = [];
        };
        this.shell_folder = (uuid, path) => {
            const shell = this.shell_workers.find(x => x[0] == uuid);
            if (shell == undefined) {
                this.messager_log(`[Shell] Cannot find shell instance`);
                return;
            }
            if (path.length == 0) {
                path = process.cwd();
            }
            if (!this.os.fs_dir_exist({ path: path })) {
                path = process.cwd();
            }
            const d = {
                path: path,
                cwd: process.cwd(),
                folders: this.os.dir_dirs({ path: path }),
                files: this.os.dir_files({ path: path })
            };
            shell[1].emit("shell_folder_reply", d);
        };
        this.disconnect = (uuid) => {
            const shell = this.shell_workers.find(x => x[0] == uuid);
            if (shell == undefined)
                return;
            shell[2].kill();
        };
        this.disconnect2 = (source) => {
            const shell = this.shell_workers.find(x => x[1] == source);
            if (shell == undefined)
                return;
            shell[2].kill();
        };
        this.os = new os_1.ClientOS(() => "SHELL", () => "", () => undefined, _messager, _messager_log);
        this.messager = _messager;
        this.messager_log = _messager_log;
    }
}
exports.ClientShell = ClientShell;
//# sourceMappingURL=shell.js.map