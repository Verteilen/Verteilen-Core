"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventObserver = exports.ProxyRecordIOLoader = exports.EventObserver = void 0;
const interface_1 = require("../interface");
class EventObserver {
    loader;
    action;
    constructor(loader, action) {
        this.loader = loader;
        this.action = action;
        this.loader.project = new ProxyRecordIOLoader(loader.project, interface_1.RecordType.PROJECT, action);
        this.loader.task = new ProxyRecordIOLoader(loader.task, interface_1.RecordType.TASK, action);
        this.loader.job = new ProxyRecordIOLoader(loader.job, interface_1.RecordType.JOB, action);
        this.loader.database = new ProxyRecordIOLoader(loader.database, interface_1.RecordType.DATABASE, action);
        this.loader.node = new ProxyRecordIOLoader(loader.node, interface_1.RecordType.NODE, action);
        this.loader.log = new ProxyRecordIOLoader(loader.log, interface_1.RecordType.LOG, action);
        this.loader.lib = new ProxyRecordIOLoader(loader.lib, interface_1.RecordType.LIB, action);
        this.loader.user = new ProxyRecordIOLoader(loader.user, interface_1.RecordType.USER, action);
    }
    get project() { return this.loader.project; }
    get task() { return this.loader.task; }
    get job() { return this.loader.job; }
    get database() { return this.loader.database; }
    get node() { return this.loader.node; }
    get log() { return this.loader.log; }
    get lib() { return this.loader.lib; }
    get user() { return this.loader.user; }
}
exports.EventObserver = EventObserver;
class ProxyRecordIOLoader {
    loader;
    type;
    action;
    constructor(loader, type, action) {
        this.loader = loader;
        this.type = type;
        this.action = action;
    }
    load_all = () => {
        return this.loader.load_all().then(x => {
            this.action.loaded(this.type);
            return x;
        });
    };
    delete_all = () => {
        return this.loader.delete_all().then(() => this.action.changed(this.type));
    };
    list_all = () => this.loader.list_all();
    save = (name, data) => {
        return this.loader.save(name, data).then(() => this.action.changed(this.type));
    };
    load = (name, cache) => {
        return this.loader.load(name, cache).then(x => {
            this.action.loaded(this.type);
            return x;
        });
    };
    rename = (name, newname) => {
        return this.loader.rename(name, newname).then(() => this.action.changed(this.type));
    };
    delete = (name) => {
        return this.loader.delete(name).then(() => this.action.changed(this.type));
    };
}
exports.ProxyRecordIOLoader = ProxyRecordIOLoader;
const CreateEventObserver = (loader, event) => {
    return new EventObserver(loader, event);
};
exports.CreateEventObserver = CreateEventObserver;
