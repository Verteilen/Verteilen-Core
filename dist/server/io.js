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
exports.CreateRecordMemoryLoader_Browser = void 0;
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
        fetch_all: () => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            return arr.map(x => JSON.stringify(x));
        }),
        load_all: () => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            return arr.map(x => JSON.stringify(x));
        }),
        delete_all: () => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            const p = arr.splice(0, arr.length);
            return p.map(x => x.uuid);
        }),
        list_all: () => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            return arr.map(x => x.uuid);
        }),
        save: (uuid, data) => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            const index = arr.findIndex(x => x.uuid == uuid);
            if (index != -1)
                arr[index] = JSON.parse(data);
            else
                arr.push(JSON.parse(data));
            return true;
        }),
        load: (uuid) => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            const p = arr.find(x => x.uuid == uuid);
            if (p == undefined)
                throw new Error("Item do not exists");
            return JSON.stringify(p);
        }),
        delete: (uuid) => __awaiter(void 0, void 0, void 0, function* () {
            const arr = get_array(type);
            const index = arr.findIndex(x => x.uuid == uuid);
            if (index != -1)
                arr.splice(index, 1);
            return true;
        })
    };
};
const CreateRecordMemoryLoader_Browser = (loader) => {
    return {
        project: _CreateRecordMemoryLoader(loader, interface_1.RecordType.PROJECT),
        task: _CreateRecordMemoryLoader(loader, interface_1.RecordType.TASK),
        job: _CreateRecordMemoryLoader(loader, interface_1.RecordType.JOB),
        database: _CreateRecordMemoryLoader(loader, interface_1.RecordType.DATABASE),
        node: _CreateRecordMemoryLoader(loader, interface_1.RecordType.NODE),
        log: _CreateRecordMemoryLoader(loader, interface_1.RecordType.LOG),
        lib: _CreateRecordMemoryLoader(loader, interface_1.RecordType.LIB),
        user: _CreateRecordMemoryLoader(loader, interface_1.RecordType.USER),
    };
};
exports.CreateRecordMemoryLoader_Browser = CreateRecordMemoryLoader_Browser;
//# sourceMappingURL=io.js.map