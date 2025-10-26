"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRecordMongoLoader = exports.CreateRecordIOLoader = exports.CreateRecordMemoryLoader = exports._CreateRecordIOLoader = exports._CreateRecordMemoryLoader = void 0;
const interface_1 = require("../interface");
const _CreateRecordMemoryLoader = (loader, type) => {
    const get_array = (type) => {
        switch (type) {
            default:
            case interface_1.RecordType.PROJECT: return loader.projects;
            case interface_1.RecordType.Database: return loader.database;
            case interface_1.RecordType.NODE: return loader.nodes;
            case interface_1.RecordType.LOG: return loader.logs;
            case interface_1.RecordType.LIB: return loader.libs;
            case interface_1.RecordType.USER: return loader.user;
        }
    };
    return {
        load_all: () => __awaiter(void 0, void 0, void 0, function* () {
            return get_array(type).map(x => JSON.stringify(x));
        }),
        delete_all: () => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type).map(x => JSON.stringify(x));
            arr.splice(0, arr.length);
        }),
        list_all: () => __awaiter(void 0, void 0, void 0, function* () {
            return get_array(type).map(x => x.uuid);
        }),
        save: (name, data) => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            const b = arr.findIndex(x => name == x.uuid);
            if (b != -1)
                arr[b] = JSON.parse(data);
            else
                arr.push(JSON.parse(data));
        }),
        load: (name) => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            const b = arr.find(x => name == x.uuid);
            return b ? JSON.stringify(b) : "";
        }),
        rename: (name, newname) => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == name);
            if (b != -1)
                arr[b].uuid = newname;
        }),
        delete: (name) => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == name);
            if (b != -1)
                arr.splice(b, 1);
        })
    };
};
exports._CreateRecordMemoryLoader = _CreateRecordMemoryLoader;
const _CreateRecordIOLoader = (loader, memory, type, folder, ext = ".json") => {
    const get_array = (type) => {
        switch (type) {
            default:
            case interface_1.RecordType.PROJECT: return memory.projects;
            case interface_1.RecordType.Database: return memory.database;
            case interface_1.RecordType.NODE: return memory.nodes;
            case interface_1.RecordType.LOG: return memory.logs;
            case interface_1.RecordType.LIB: return memory.libs;
            case interface_1.RecordType.USER: return memory.user;
        }
    };
    return {
        load_all: () => __awaiter(void 0, void 0, void 0, function* () {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                yield loader.mkdir(root);
            const files = yield loader.read_dir_file(root);
            const r = files.map(x => loader.read_string(x, { encoding: 'utf8', flag: 'r' }));
            const p = yield Promise.all(r);
            const arr = get_array(type);
            arr.splice(0, arr.length);
            arr.push(...p.map(x => JSON.parse(x)));
            return p;
        }),
        delete_all: () => __awaiter(void 0, void 0, void 0, function* () {
            const root = loader.join(loader.root, folder);
            if (loader.exists(root))
                yield loader.rm(root);
            yield loader.mkdir(root);
            const arr = get_array(type);
            arr.splice(0, arr.length);
        }),
        list_all: () => __awaiter(void 0, void 0, void 0, function* () {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                yield loader.mkdir(root);
            return loader.read_dir_file(root);
        }),
        save: (name, data) => __awaiter(void 0, void 0, void 0, function* () {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                yield loader.mkdir(root);
            const file = loader.join(root, name + ext);
            yield loader.write_string(file, data);
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == name);
            if (b != -1)
                arr.push(JSON.parse(data));
            else
                arr[b] = JSON.parse(data);
        }),
        load: (name, cache) => __awaiter(void 0, void 0, void 0, function* () {
            if (cache) {
                const arr = get_array(type);
                const b = arr.findIndex(x => x.uuid == name);
                if (b != -1)
                    return arr[b];
            }
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                yield loader.mkdir(root);
            const file = loader.join(root, name + ext);
            return loader.read_string(file);
        }),
        rename: (name, newname) => __awaiter(void 0, void 0, void 0, function* () {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                yield loader.mkdir(root);
            const oldfile = loader.join(root, name + ext);
            const newfile = loader.join(root, newname + ext);
            yield loader.cp(oldfile, newfile);
            yield loader.rm(oldfile);
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == name);
            if (b != -1)
                arr[b].uuid = newname;
        }),
        delete: (name) => __awaiter(void 0, void 0, void 0, function* () {
            const root = loader.join(loader.root, folder);
            if (!loader.exists(root))
                yield loader.mkdir(root);
            const file = loader.join(root, name + ext);
            yield loader.rm(file);
            const arr = get_array(type);
            const b = arr.findIndex(x => x.uuid == name);
            if (b != -1)
                arr.splice(b, 1);
        })
    };
};
exports._CreateRecordIOLoader = _CreateRecordIOLoader;
const CreateRecordMemoryLoader = (loader) => {
    return {
        project: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.PROJECT),
        database: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.Database),
        node: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.NODE),
        log: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.LOG),
        lib: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.LIB),
        user: (0, exports._CreateRecordMemoryLoader)(loader, interface_1.RecordType.USER),
    };
};
exports.CreateRecordMemoryLoader = CreateRecordMemoryLoader;
const CreateRecordIOLoader = (loader, memory) => {
    return {
        project: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.PROJECT, "record"),
        database: (0, exports._CreateRecordIOLoader)(loader, memory, interface_1.RecordType.Database, "database"),
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
