"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const io_1 = require("./io");
class Server {
    constructor() {
        this.memory = {
            projects: [],
            parameter: [],
            nodes: [],
            logs: [],
            libs: [],
            user: [],
        };
        this.plugin = {
            templates: [],
            plugins: [],
        };
        this.io = undefined;
        this.loader = undefined;
        this.plugin_loader = undefined;
        this.LoadFromDisk = () => {
            const ts = [
                this.current_loader.project.load_all(),
                this.current_loader.parameter.load_all(),
                this.current_loader.node.load_all(),
                this.current_loader.log.load_all(),
                this.current_loader.lib.load_all(),
                this.current_loader.user.load_all(),
            ];
            return Promise.all(ts);
        };
        this.memory_loader = (0, io_1.CreateRecordMemoryLoader)(this.memory);
    }
    get current_loader() {
        if (this.loader)
            return this.loader;
        return this.memory_loader;
    }
}
exports.Server = Server;
