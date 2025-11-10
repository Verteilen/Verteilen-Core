"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRecordMongoLoader = exports.CreateRecordIOLoader = exports.CreateRecordMemoryLoader = exports._CreateRecordMongoLoader = exports._CreateRecordIOLoader = exports._CreateRecordMemoryLoader = void 0;
const mongodb_1 = require("mongodb");
const interface_1 = require("../interface");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const permissionHelper = (x, uuid) => {
    const ispublic = x.owner == undefined || x.acl == interface_1.ACLType.PUBLIC;
    if (ispublic)
        return true;
    const isowner = x.owner == uuid;
    if (isowner)
        return true;
    const canbeshared = x.acl != interface_1.ACLType.PRIVATE;
    if (!canbeshared)
        return false;
    if (!x.shared)
        return false;
    const target = x.shared.find(x => x.user == uuid);
    if (target == undefined)
        return false;
    return true;
};
const permissionGetPublic = (v) => {
    return v.filter(x => x.owner == undefined || x.acl == interface_1.ACLType.PUBLIC);
};
const obsoleteSupport = async (loader, type, folder) => {
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
        load_all: async (cache, token) => {
            return new Promise((resolve, reject) => {
                const arr = get_array(type);
                const pub = permissionGetPublic(arr).map(x => JSON.stringify(x));
                const default_behaviour = (v) => resolve(v);
                if (token == undefined) {
                    default_behaviour(pub);
                    return;
                }
                jsonwebtoken_1.default.verify(token, interface_1.SERECT, { complete: true }, (err, decode) => {
                    if (err) {
                        reject(err.name);
                        return;
                    }
                    if (decode == undefined) {
                        default_behaviour(pub);
                        return;
                    }
                    const payload = JSON.parse(decode.payload);
                    return arr.filter(x => permissionHelper(x, payload.user))
                        .map(x => JSON.stringify(x));
                });
            });
        },
        delete_all: async (token) => {
            return new Promise((resolve, reject) => {
                const arr = get_array(type);
                const pub = permissionGetPublic(arr);
                const default_behaviour = (kill) => {
                    const r = kill.map(x => x.uuid);
                    kill.forEach(x => {
                        const index = arr.findIndex(y => y.uuid == x.uuid);
                        arr.slice(index, 1);
                    });
                    resolve(r);
                };
                if (token == undefined) {
                    default_behaviour(pub);
                    return;
                }
                jsonwebtoken_1.default.verify(token, interface_1.SERECT, { complete: true }, (err, decode) => {
                    if (err) {
                        reject(err.name);
                        return;
                    }
                    if (decode == undefined) {
                        default_behaviour(pub);
                        return;
                    }
                    const payload = JSON.parse(decode.payload);
                    const targets = arr.filter(x => permissionHelper(x, payload.user));
                    default_behaviour(targets);
                });
            });
        },
        list_all: async (token) => {
            return new Promise((resolve, reject) => {
                const arr = get_array(type);
                const pub = permissionGetPublic(arr);
                const default_behaviour = () => {
                    resolve(pub.map(x => x.uuid));
                };
                if (token == undefined) {
                    default_behaviour();
                    return;
                }
                jsonwebtoken_1.default.verify(token, interface_1.SERECT, { complete: true }, (err, decode) => {
                    if (err) {
                        reject(err.name);
                        return;
                    }
                    if (decode == undefined) {
                        default_behaviour();
                        return;
                    }
                    const payload = JSON.parse(decode.payload);
                    const targets = arr.filter(x => permissionHelper(x, payload.user));
                    resolve(targets.map(x => x.uuid));
                });
            });
        },
        save: async (uuid, data, token) => {
            return new Promise((resolve, reject) => {
                const arr = get_array(type);
                const index = arr.findIndex(x => x.uuid == uuid);
                const exist = index == -1 ? undefined : arr[index];
                if (!exist) {
                    arr.push(JSON.parse(data));
                    resolve(true);
                    return;
                }
                const ispublic = exist.owner == undefined || exist.acl == interface_1.ACLType.PUBLIC;
                if (ispublic) {
                    arr[index] = Object.assign(exist, JSON.parse(data));
                    resolve(true);
                    return;
                }
                if (token == undefined) {
                    reject("Require Token");
                    return;
                }
                jsonwebtoken_1.default.verify(token, interface_1.SERECT, { complete: true }, (err, decode) => {
                    if (err) {
                        reject(err.name);
                        return;
                    }
                    if (decode == undefined) {
                        reject("Require Token");
                        return;
                    }
                    const payload = JSON.parse(decode.payload);
                    if (permissionHelper(exist, payload.user)) {
                        arr[index] = Object.assign(exist, JSON.parse(data));
                    }
                    else {
                        reject("Permission Denied");
                    }
                });
            });
        },
        load: async (uuid, token) => {
            return new Promise((resolve, reject) => {
                const arr = get_array(type);
                const index = arr.findIndex(x => uuid == x.uuid);
                const exist = index == -1 ? undefined : arr[index];
                if (exist == undefined) {
                    reject("Item do not exists");
                    return;
                }
                const ispublic = exist.owner == undefined || exist.acl == interface_1.ACLType.PUBLIC;
                if (ispublic) {
                    resolve(JSON.stringify(exist));
                    return;
                }
                if (token == undefined) {
                    reject("Require Token");
                    return;
                }
                jsonwebtoken_1.default.verify(token, interface_1.SERECT, { complete: true }, (err, decode) => {
                    if (err) {
                        reject(err.name);
                        return;
                    }
                    if (decode == undefined) {
                        reject("Require Token");
                        return;
                    }
                    const payload = JSON.parse(decode.payload);
                    if (permissionHelper(exist, payload.user)) {
                        resolve(JSON.stringify(exist));
                    }
                    else {
                        reject("Permission Denied");
                    }
                });
            });
        },
        delete: async (uuid, token) => {
            return new Promise((resolve, reject) => {
                const arr = get_array(type);
                const index = arr.findIndex(x => uuid == x.uuid);
                const exist = index == -1 ? undefined : arr[index];
                const default_behaviour = () => {
                    arr.splice(index, 1);
                    resolve(true);
                };
                if (exist == undefined) {
                    resolve(false);
                    return;
                }
                const ispublic = exist.owner == undefined || exist.acl == interface_1.ACLType.PUBLIC;
                if (ispublic) {
                    default_behaviour();
                    return;
                }
                if (token == undefined) {
                    reject("Require Token");
                    return;
                }
                jsonwebtoken_1.default.verify(token, interface_1.SERECT, { complete: true }, (err, decode) => {
                    if (err) {
                        reject(err.name);
                        return;
                    }
                    if (decode == undefined) {
                        reject("Require Token");
                        return;
                    }
                    const payload = JSON.parse(decode.payload);
                    if (permissionHelper(exist, payload.user)) {
                        default_behaviour();
                    }
                    else {
                        reject("Permission Denied");
                    }
                });
            });
        }
    };
};
exports._CreateRecordMemoryLoader = _CreateRecordMemoryLoader;
const _CreateRecordIOLoader = (loader, memory, type, folder, ext = ".json") => {
    const mem = (0, exports._CreateRecordMemoryLoader)(memory, type);
    return {
        load_all: async (cache, token) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            if (cache)
                return mem.load_all(cache, token);
            await obsoleteSupport(loader, type, folder);
            const files = await loader.read_dir_file(root);
            const r = files.map(x => loader.read_string(loader.join(root, x), { encoding: 'utf8', flag: 'r' }));
            const p = await Promise.all(r);
            const saver = p.map(x => {
                const data = JSON.parse(x);
                return mem.save(data.uuid, x, token);
            });
            await Promise.all(saver);
            return mem.load_all(cache, token);
        },
        delete_all: async (token) => {
            const root = loader.join(loader.root, folder);
            const c = await mem.delete_all(token);
            const kill_all = c.map(x => {
                return loader.rm(loader.join(root, x + ext));
            });
            await Promise.all(kill_all);
            return c;
        },
        list_all: async (token) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            return mem.list_all(token);
        },
        save: async (uuid, data, token) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const r = await mem.save(uuid, data, token);
            if (!r)
                return false;
            const file = loader.join(root, uuid + ext);
            await loader.write_string(file, data);
            return true;
        },
        load: async (uuid, token) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            return mem.load(uuid, token);
        },
        delete: async (uuid, token) => {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                await loader.mkdir(root);
            const r = await mem.delete(uuid, token);
            if (!r)
                return false;
            const file = loader.join(root, uuid + ext);
            if (loader.exists(file)) {
                await loader.rm(file);
            }
            return true;
        }
    };
};
exports._CreateRecordIOLoader = _CreateRecordIOLoader;
const _CreateRecordMongoLoader = (loader, memory, type, db, collection) => {
    const mem = (0, exports._CreateRecordMemoryLoader)(memory, type);
    return {
        load_all: async (cache, token) => {
            if (cache)
                return mem.load_all(cache, token);
            const database = loader.db(db);
            const col = database.collection(collection);
            const data = await col.find({}).toArray();
            const exec = data.map(x => {
                return mem.save(x.uuid, JSON.stringify(x), token);
            });
            await Promise.all(exec);
            return mem.load_all(cache, token);
        },
        delete_all: async (token) => {
            const c = await mem.delete_all(token);
            const database = loader.db(db);
            const col = database.collection(collection);
            const exec = c.map(x => {
                return col.deleteOne({ uuid: x });
            });
            await Promise.all(exec);
            return c;
        },
        list_all: async (token) => {
            return mem.list_all(token);
        },
        save: async (uuid, data, token) => {
            const r = await mem.save(uuid, data, token);
            if (!r)
                return false;
            const database = loader.db(db);
            const col = database.collection(collection);
            col.findOneAndUpdate({ uuid: uuid }, JSON.parse(data));
            return true;
        },
        load: async (uuid, token) => {
            return mem.load(uuid, token);
        },
        delete: async (uuid, token) => {
            const r = await mem.delete(uuid, token);
            if (!r)
                return false;
            const database = loader.db(db);
            const col = database.collection(collection);
            await col.deleteOne({ uuid: uuid });
            return true;
        }
    };
};
exports._CreateRecordMongoLoader = _CreateRecordMongoLoader;
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
        lib: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.LIB, "lib"),
        user: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.USER, "user"),
    };
};
exports.CreateRecordIOLoader = CreateRecordIOLoader;
const CreateRecordMongoLoader = (url, memory) => {
    const loader = new mongodb_1.MongoClient(url);
    return {
        project: (0, exports._CreateRecordMongoLoader)(loader, memory, interface_1.RecordType.PROJECT, interface_1.MONGODB_NAME, "project"),
        task: (0, exports._CreateRecordMongoLoader)(loader, memory, interface_1.RecordType.TASK, interface_1.MONGODB_NAME, "task"),
        job: (0, exports._CreateRecordMongoLoader)(loader, memory, interface_1.RecordType.JOB, interface_1.MONGODB_NAME, "job"),
        database: (0, exports._CreateRecordMongoLoader)(loader, memory, interface_1.RecordType.DATABASE, interface_1.MONGODB_NAME, "database"),
        node: (0, exports._CreateRecordMongoLoader)(loader, memory, interface_1.RecordType.NODE, interface_1.MONGODB_NAME, "node"),
        log: (0, exports._CreateRecordMongoLoader)(loader, memory, interface_1.RecordType.LOG, interface_1.MONGODB_NAME, "log"),
        lib: (0, exports._CreateRecordMongoLoader)(loader, memory, interface_1.RecordType.LIB, interface_1.MONGODB_NAME, "lib"),
        user: (0, exports._CreateRecordMongoLoader)(loader, memory, interface_1.RecordType.USER, interface_1.MONGODB_NAME, "user"),
    };
};
exports.CreateRecordMongoLoader = CreateRecordMongoLoader;
