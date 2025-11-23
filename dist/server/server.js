"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerBase = void 0;
const io_1 = require("./io");
const project_1 = require("./module/project");
class ServerBase {
    constructor() {
        this.manager = [];
        this.memory = {
            projects: [],
            tasks: [],
            jobs: [],
            database: [],
            nodes: [],
            logs: [],
            libs: [],
            user: [],
        };
        this.plugin = {
            plugins: [],
        };
        this.io = undefined;
        this.loader = undefined;
        this.plugin_loader = undefined;
        this.LoadFromDisk = () => {
            const ts = [
                this.current_loader.project.fetch_all(),
                this.current_loader.task.fetch_all(),
                this.current_loader.job.fetch_all(),
                this.current_loader.database.fetch_all(),
                this.current_loader.node.fetch_all(),
                this.current_loader.log.fetch_all(),
                this.current_loader.lib.fetch_all(),
                this.current_loader.user.fetch_all(),
            ];
            return Promise.all(ts);
        };
        this.Boradcasting = (name, data) => {
            const d = {
                name: name,
                data: data
            };
            this.manager.forEach(x => {
                x.ws.send(JSON.stringify(d));
            });
        };
        this.memory_loader = (0, io_1.CreateRecordMemoryLoader_Browser)(this.memory);
        this.module_project = new project_1.Project_Module(this);
    }
    get current_loader() {
        if (this.loader)
            return this.loader;
        return this.memory_loader;
    }
}
exports.ServerBase = ServerBase;
//# sourceMappingURL=server.js.map