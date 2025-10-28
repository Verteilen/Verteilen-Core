"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const io_1 = require("./io");
const project_1 = require("./module/project");
class Server {
    manager = [];
    memory = {
        projects: [],
        tasks: [],
        jobs: [],
        database: [],
        nodes: [],
        logs: [],
        libs: [],
        user: [],
    };
    plugin = {
        templates: [],
        plugins: [],
    };
    io = undefined;
    loader = undefined;
    plugin_loader = undefined;
    memory_loader;
    detail;
    module_project;
    constructor() {
        this.memory_loader = (0, io_1.CreateRecordMemoryLoader)(this.memory);
        this.module_project = new project_1.Project_Module(this);
    }
    get current_loader() {
        if (this.loader)
            return this.loader;
        return this.memory_loader;
    }
    LoadFromDisk = () => {
        const ts = [
            this.current_loader.project.load_all(),
            this.current_loader.task.load_all(),
            this.current_loader.job.load_all(),
            this.current_loader.database.load_all(),
            this.current_loader.node.load_all(),
            this.current_loader.log.load_all(),
            this.current_loader.lib.load_all(),
            this.current_loader.user.load_all(),
        ];
        return Promise.all(ts);
    };
    Boradcasting = (name, data) => {
        const d = {
            name: name,
            data: data
        };
        this.manager.forEach(x => {
            x.ws.send(JSON.stringify(d));
        });
    };
}
exports.Server = Server;
