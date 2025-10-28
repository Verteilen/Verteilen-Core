"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRecordMongoLoader = exports.CreateRecordIOLoader = exports.CreateRecordMemoryLoader = exports._CreateRecordIOLoader = exports._CreateRecordMemoryLoader = void 0;
const interface_1 = require("../interface");
const _CreateRecordMemoryLoader = (loader, type) => {
    const get_array = (type) => {
        switch (type) {
            default:
            case interface_1.RecordType.PROJECT: return loader.projects;
            case interface_1.RecordType.TASK: return loader.tasks;
            case interface_1.RecordType.JOB: return loader.jobs;
            case interface_1.RecordType.DATABASE: return loader.database;
            case interface_1.RecordType.NODE: return loader.nodes;
            case interface_1.RecordType.LOG: return loader.logs;
            case interface_1.RecordType.LIB: return loader.libs;
            case interface_1.RecordType.USER: return loader.user;
        }
    };
    return {
        load_all: async () => {
            return get_array(type).map(x => JSON.stringify(x));
        },
        delete_all: async () => {
            const arr = get_array(type).map(x => JSON.stringify(x));
            arr.splice(0, arr.length);
        },
        list_all: async () => {
            return get_array(type).map(x => x.uuid);
        },
        save: async (name, data) => {
            const arr = get_array(type);
            const b = arr.findIndex(x => name == x.uuid);
            if (b != -1)
                arr[b] = JSON.parse(data);
            else
                arr.push(JSON.parse(data));
        },
        load: async (name) => {
            const arr = get_array(type);
            const b = arr.find(x => name == x.uuid);
            return b ? JSON.stringify(b) : "";
        },
        rename: async (name, newname) => {
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == name);
            if (b != -1)
                arr[b].uuid = newname;
        },
        delete: async (name) => {
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == name);
            if (b != -1)
                arr.splice(b, 1);
        }
    };
};
exports._CreateRecordMemoryLoader = _CreateRecordMemoryLoader;
const _CreateRecordIOLoader = (loader, memory, type, folder, ext = ".json") => {
    const get_array = (type) => {
        switch (type) {
            default:
            case interface_1.RecordType.PROJECT: return memory.projects;
            case interface_1.RecordType.TASK: return memory.tasks;
            case interface_1.RecordType.JOB: return memory.jobs;
            case interface_1.RecordType.DATABASE: return memory.database;
            case interface_1.RecordType.NODE: return memory.nodes;
            case interface_1.RecordType.LOG: return memory.logs;
            case interface_1.RecordType.LIB: return memory.libs;
            case interface_1.RecordType.USER: return memory.user;
        }
    };
    return {
        load_all: async () => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const files = await loader.read_dir_file(root);
            const r = files.map(x => loader.read_string(loader.join(root, x), { encoding: 'utf8', flag: 'r' }));
            const p = await Promise.all(r);
            const arr = get_array(type);
            arr.splice(0, arr.length);
            arr.push(...p.map(x => JSON.parse(x)));
            return p;
        },
        delete_all: async () => {
            const root = loader.join(loader.root, folder);
            if (loader.exists(root))
                await loader.rm(root);
            await loader.mkdir(root);
            const arr = get_array(type);
            arr.splice(0, arr.length);
        },
        list_all: async () => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            return loader.read_dir_file(root);
        },
        save: async (name, data) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const file = loader.join(root, name + ext);
            await loader.write_string(file, data);
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == name);
            if (b != -1)
                arr.push(JSON.parse(data));
            else
                arr[b] = JSON.parse(data);
        },
        load: async (name, cache) => {
            if (cache) {
                const arr = get_array(type);
                const b = arr.findIndex(x => x.uuid == name);
                if (b != -1)
                    return arr[b];
            }
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const file = loader.join(root, name + ext);
            return loader.read_string(file);
        },
        rename: async (name, newname) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const oldfile = loader.join(root, name + ext);
            const newfile = loader.join(root, newname + ext);
            await loader.cp(oldfile, newfile);
            await loader.rm(oldfile);
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == name);
            if (b != -1)
                arr[b].uuid = newname;
        },
        delete: async (name) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const file = loader.join(root, name + ext);
            await loader.rm(file);
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == name);
            if (b != -1)
                arr.splice(b, 1);
        }
    };
};
exports._CreateRecordIOLoader = _CreateRecordIOLoader;
const CreateRecordMemoryLoader = (loader) => {
    return {
        project: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.PROJECT),
        task: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.TASK),
        job: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.JOB),
        database: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.DATABASE),
        node: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.NODE),
        log: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.LOG),
        lib: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.LIB),
        user: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.USER),
    };
};
exports.CreateRecordMemoryLoader = CreateRecordMemoryLoader;
const CreateRecordIOLoader = (loader, memory) => {
    return {
        project: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.PROJECT, "project"),
        task: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.TASK, "task"),
        job: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.JOB, "job"),
        database: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.DATABASE, "database"),
        node: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.NODE, "node"),
        log: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.LOG, "log"),
        lib: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.LIB, "lib", ""),
        user: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.USER, "user"),
    };
};
exports.CreateRecordIOLoader = CreateRecordIOLoader;
const CreateRecordMongoLoader = (loader, folder, ext = ".json") => {
};
exports.CreateRecordMongoLoader = CreateRecordMongoLoader;
