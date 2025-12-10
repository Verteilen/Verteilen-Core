"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerBase = void 0;
const io_1 = require("./io");
const project_1 = require("./module/project");
class ServerBase {
    constructor() {
        this.manager = undefined;
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
        this.admin = undefined;
        /**
         * **Data: Memory**\
         * Load every type of data from disk, store them into memory
         */
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
        /**
         * **Broadcast To Console**\
         * Send messages to all console server
         * @param name channel
         * @param data raw data
         */
        this.Boradcasting = (name, data) => {
            var _a;
            const d = {
                name: name,
                data: data
            };
            (_a = this.manager) === null || _a === void 0 ? void 0 : _a.admins.forEach(x => {
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