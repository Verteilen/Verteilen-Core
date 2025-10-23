"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientOS = void 0;
const child_process_1 = require("child_process");
const tree_kill_1 = __importDefault(require("tree-kill"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const interface_1 = require("../interface");
class ClientOS {
    constructor(_tag, _runtime, _messager, _messager_log) {
        this.children = [];
        this.file_copy = (data) => {
            this.messager(`[OS Action] File copy, ${data.from} => ${data.to}`, this.tag());
            fs.copyFileSync(data.from, data.to);
        };
        this.dir_copy = (data) => {
            this.messager(`[OS Action] Folder copy, ${data.from} => ${data.to}`, this.tag());
            fs.cpSync(data.from, data.to, { recursive: true, force: true });
        };
        this.file_delete = (data) => {
            this.messager(`[OS Action] File delete, ${data.path}`, this.tag());
            fs.rmSync(data.path);
        };
        this.dir_delete = (data) => {
            this.messager(`[OS Action] Folder delete, ${data.path}`, this.tag());
            fs.rmSync(data.path, { recursive: true, force: true });
        };
        this.rename = (data) => {
            this.messager(`[OS Action] File or dir rename, ${data.from} => ${data.to}`, this.tag());
            fs.renameSync(data.from, data.to);
        };
        this.fs_exist = (data) => {
            const v = fs.existsSync(data.path);
            this.messager(`[OS Action] Check path exists, ${data.path}`, this.tag());
            return v;
        };
        this.fs_dir_exist = (data) => {
            const p = this.fs_exist(data);
            if (!p)
                return false;
            const stat = fs.statSync(data.path);
            return stat.isDirectory();
        };
        this.fs_file_exist = (data) => {
            const p = this.fs_exist(data);
            if (!p)
                return false;
            const stat = fs.statSync(data.path);
            return stat.isFile();
        };
        this.dir_files = (data) => {
            const r = fs.readdirSync(data.path, { withFileTypes: true }).filter(x => x.isFile()).map(x => x.name);
            return r;
        };
        this.dir_dirs = (data) => {
            const r = fs.readdirSync(data.path, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name);
            return r;
        };
        this.dir_create = (data) => {
            this.messager(`[OS Action] Create folder, ${data.path}`, this.tag());
            fs.mkdirSync(data.path, { recursive: true });
        };
        this.file_write = (data) => {
            this.messager(`[OS Action] Create file, ${data.from}`, this.tag());
            fs.writeFileSync(data.from, data.to);
        };
        this.file_read = (data) => {
            return fs.readFileSync(data.path).toString();
        };
        this.stopall = () => {
            this.children.forEach(x => {
                x.stdin.write('q');
                x.stdin.end();
                (0, tree_kill_1.default)(x.pid, 'SIGKILL');
            });
            this.children = [];
        };
        this.lib_command = (command, args) => __awaiter(this, void 0, void 0, function* () {
            const cc = process.platform == "win32" ? command : "./" + command;
            return this.command(cc, args, path.join(os.homedir(), interface_1.DATA_FOLDER, "exe"));
        });
        this.command = (command, args, cwd) => __awaiter(this, void 0, void 0, function* () {
            this.messager_log(`[OS Action] Command cwd: ${cwd}`, this.tag());
            this.messager_log(`[OS Action] Command command: ${command}`, this.tag());
            this.messager_log(`[OS Action] Command args: ${args}`, this.tag());
            return new Promise((resolve, reject) => {
                const child = (0, child_process_1.spawn)(command, args.split(' '), {
                    cwd: cwd,
                    shell: true,
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                child.stdin.setDefaultEncoding('utf8');
                child.on('spawn', () => {
                    this.children.push(child);
                    this.messager_log(`[Command] Spawn process`, this.tag());
                });
                child.on('error', (err) => {
                    this.messager_log(`[Command] Error: ${err}`, this.tag());
                    reject(`Error ${err}`);
                });
                child.on('exit', (code, signal) => {
                    this.messager_log(`[Command] Process Exit: ${code}`, this.tag());
                });
                child.on('message', (message, sendHandle) => {
                    this.messager_log(`[Command] : ${message.toString()}`, this.tag());
                });
                child.on('close', (code, signal) => {
                    this.messager_log(`[Command] Process Close: ${code}`, this.tag());
                    const index = this.children.findIndex(x => x.pid == child.pid);
                    if (index != -1)
                        this.children.splice(index, 1);
                    resolve(`Successfully ${code}`);
                });
                child.stdout.setEncoding('utf8');
                child.stdout.on('data', (chunk) => {
                    this.messager_log(`[Command Info] : ${chunk.toString()}`, this.tag());
                });
                child.stderr.setEncoding('utf8');
                child.stderr.on('data', (chunk) => {
                    this.messager_log(`[Command Error] : ${chunk.toString()}`, this.tag());
                });
            });
        });
        this.command_sync = (command, args, cwd) => __awaiter(this, void 0, void 0, function* () {
            return this.command(command, args, cwd);
        });
        this.command_exec = (command, args, cwd) => {
            this.messager_log(`[OS Action] Command cwd: ${cwd}`, this.tag());
            this.messager_log(`[OS Action] Command command: ${command}`, this.tag());
            this.messager_log(`[OS Action] Command args: ${args}`, this.tag());
            const child = (0, child_process_1.exec)(`${command} ${args}`, {
                cwd: cwd
            });
            child.on('spawn', () => {
                this.messager_log(`[Command] Spawn process`, this.tag());
            });
            child.on('error', (err) => {
                this.messager_log(`[Command] Error: ${err}`, this.tag());
            });
            child.on('exit', (code, signal) => {
                this.messager_log(`[Command] Process Exit: ${code}`, this.tag());
            });
            child.on('message', (message, sendHandle) => {
                this.messager_log(`[Command] : ${message.toString()}`, this.tag());
            });
            child.on('close', (code, signal) => {
                this.messager_log(`[Command] Process Close: ${code}`, this.tag());
            });
        };
        this.tag = _tag;
        this.runtime = _runtime;
        this.messager = _messager;
        this.messager_log = _messager_log;
    }
}
exports.ClientOS = ClientOS;
