"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRecordMongoLoader = exports.CreateRecordIOLoader = exports.CreateRecordMemoryLoader = exports._CreateRecordIOLoader = exports.ObsoleteSupport = exports._CreateRecordMemoryLoader = void 0;
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
const ObsoleteSupport = async (loader, type, folder) => {
    if (type == interface_1.RecordType.PROJECT) {
        const path = loader.join(loader.root, "record");
        if (!loader.exists(path))
            return;
        const p = await loader.read_dir_file(path);
        const ps = p.filter(x => x.endsWith(".json")).map(x => {
            const path_r = loader.join(path, x);
            return loader.read_string(path_r);
        });
        const allRecordText = await Promise.all(ps);
        const allRecord = allRecordText.map(x => JSON.parse(x));
        const execute_project = [];
        const execute_task = [];
        const execute_job = [];
        for (let x of allRecord) {
            const tasks = x.task;
            x.tasks = [];
            x.database_uuid = x.parameter_uuid;
            x.tasks_uuid = tasks.map(y => y.uuid);
            delete x.parameter_uuid;
            delete x.task;
            for (let y of tasks) {
                const jobs = y.jobs;
                y.jobs = [];
                y.jobs_uuid = jobs.map(z => z.uuid);
                for (let z of jobs) {
                    z.id_args = [];
                    const d3 = loader.join(loader.root, "job", `${z.uuid}.json`);
                    execute_job.push(loader.write_string(d3, JSON.stringify(z, null, 4)));
                }
                const d2 = loader.join(loader.root, "task", `${y.uuid}.json`);
                execute_task.push(loader.write_string(d2, JSON.stringify(y, null, 4)));
            }
            const d1 = loader.join(loader.root, "project", `${x.uuid}.json`);
            execute_project.push(loader.write_string(d1, JSON.stringify(x, null, 4)));
        }
        await Promise.all(execute_project);
        await Promise.all(execute_task);
        await Promise.all(execute_job);
        await loader.rm(path);
    }
    else if (type == interface_1.RecordType.DATABASE) {
        const path = loader.join(loader.root, "parameter");
        if (!loader.exists(path))
            return;
        const p = await loader.read_dir_file(path);
        const ps = p.filter(x => x.endsWith(".json")).map(x => {
            const path2 = loader.join(path, x);
            const path3 = loader.join(loader.root, folder, x);
            return loader.cp(path2, path3);
        });
        await Promise.all(ps);
        loader.rm(path);
    }
};
exports.ObsoleteSupport = ObsoleteSupport;
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
            await (0, exports.ObsoleteSupport)(loader, type, folder);
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
        save: async (uuid, data) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const file = loader.join(root, uuid + ext);
            await loader.write_string(file, data);
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == uuid);
            if (b != -1)
                arr[b] = JSON.parse(data);
            else
                arr.push(JSON.parse(data));
        },
        load: async (uuid, cache) => {
            const arr = get_array(type);
            if (cache) {
                const b = arr.findIndex(x => x.uuid == uuid);
                if (b != -1)
                    return JSON.stringify(arr[b]);
            }
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const file = loader.join(root, uuid + ext);
            if (!loader.exists(file)) {
                const b = arr.findIndex(x => x.uuid == uuid);
                if (b != -1)
                    arr.splice(b, 1);
                return "";
            }
            const a = await loader.read_string(file);
            if (cache)
                arr.push(JSON.parse(a));
            return a;
        },
        rename: async (uuid, newuuid) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const oldfile = loader.join(root, uuid + ext);
            const newfile = loader.join(root, newuuid + ext);
            await loader.cp(oldfile, newfile);
            await loader.rm(oldfile);
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == uuid);
            if (b != -1)
                arr[b].uuid = newuuid;
        },
        delete: async (uuid) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const file = loader.join(root, uuid + ext);
            if (loader.exists(file)) {
                await loader.rm(file);
            }
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == uuid);
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
