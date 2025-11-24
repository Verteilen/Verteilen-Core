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
exports.Project_Module = void 0;
const uuid_1 = require("uuid");
class Project_Module {
    constructor(memory) {
        this.server = memory;
    }
    get memory() { return this.server.memory; }
    get loader() { return this.server.current_loader; }
    ProjectJobCount(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.project.load(uuid);
            const p = this.memory.projects.find(p => p.uuid == uuid);
            if (!p)
                return 0;
            const t = p.tasks_uuid.map(t_uuid => this.memory.tasks.find(t => t.uuid == t_uuid)).filter(t => t != undefined);
            const counts = t.map(x => x.jobs_uuid.length);
            return counts.reduce((a, b) => a + b, 0);
        });
    }
    ReOrderProjectTask(uuid, uuids) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.project.load(uuid);
            const p = this.memory.projects.find(p => p.uuid == uuid);
            if (!p)
                return;
            p.tasks_uuid = uuids;
            this.loader.project.save(uuid, JSON.stringify(p, null, 4));
        });
    }
    PopulateProject(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.project.load(uuid);
            const p = this.memory.projects.find(p => p.uuid == uuid);
            if (!p)
                return undefined;
            const buffer = Object.assign({}, p);
            const ts = buffer.tasks_uuid.map(x => this.PopulateTask(x));
            buffer.tasks = (yield Promise.all(ts)).filter(x => x != undefined);
            return buffer;
        });
    }
    PopulateTask(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.task.load(uuid);
            const p = this.memory.tasks.find(p => p.uuid == uuid);
            if (!p)
                return undefined;
            const buffer = Object.assign({}, p);
            const js = buffer.jobs_uuid.map((x) => __awaiter(this, void 0, void 0, function* () {
                yield this.loader.job.load(uuid);
                return this.memory.jobs.find(t => t.uuid == x);
            }));
            buffer.jobs = (yield Promise.all(js)).filter(x => x != undefined);
            return buffer;
        });
    }
    GetProjectRelatedTask(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.project.load(uuid);
            const p = this.memory.projects.find(x => x.uuid == uuid);
            if (!p)
                return [];
            const r = p.tasks_uuid.map(x => {
                return this.loader.task.load(x);
            });
            yield Promise.all(r);
            const tasks = p.tasks_uuid.map(x => this.memory.tasks.find(y => y.uuid == x)).filter(x => x != undefined);
            return tasks;
        });
    }
    GetTaskRelatedJob(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.task.load(uuid);
            const p = this.memory.tasks.find(x => x.uuid == uuid);
            if (!p)
                return [];
            const r = p.jobs_uuid.map(x => {
                return this.loader.job.load(x);
            });
            yield Promise.all(r);
            const jobs = p.jobs_uuid.map(x => this.memory.jobs.find(y => y.uuid == x)).filter(x => x != undefined);
            return jobs;
        });
    }
    CloneProjects(uuids) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = uuids.map(x => this.loader.project.load(x));
            const ps = yield Promise.all(p);
            const projects = ps.map(x => JSON.parse(x));
            projects.forEach((x, i) => x.uuid = (0, uuid_1.v6)({}, undefined, i));
            const jus = projects.map(x => this.CloneTasks(x.tasks_uuid));
            const ju = yield Promise.all(jus);
            projects.forEach((t, index) => {
                t.tasks_uuid = ju[index];
            });
            const js = projects.map(x => this.loader.project.save(x.uuid, JSON.stringify(x)));
            yield Promise.all(js);
            return projects.map(x => x.uuid);
        });
    }
    CloneTasks(uuids) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = uuids.map(x => this.loader.task.load(x));
            const ps = yield Promise.all(p);
            const tasks = ps.map(x => JSON.parse(x));
            tasks.forEach((x, i) => x.uuid = (0, uuid_1.v6)({}, undefined, 2500 + i));
            const jus = tasks.map(x => this.CloneJobs(x.jobs_uuid));
            const ju = yield Promise.all(jus);
            tasks.forEach((t, index) => {
                t.jobs_uuid = ju[index];
            });
            const js = tasks.map(x => this.loader.task.save(x.uuid, JSON.stringify(x)));
            yield Promise.all(js);
            return tasks.map(x => x.uuid);
        });
    }
    CloneJobs(uuids) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = uuids.map(x => this.loader.job.load(x));
            const ps = yield Promise.all(p);
            const jobs = ps.map(x => JSON.parse(x));
            jobs.forEach((x, i) => x.uuid = (0, uuid_1.v6)({}, undefined, 5000 + i));
            const js = jobs.map(x => this.loader.job.save(x.uuid, JSON.stringify(x)));
            yield Promise.all(js);
            return jobs.map(x => x.uuid);
        });
    }
    CascadeDeleteProject(uuid, bind) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.project.load(uuid);
            const p = this.memory.projects.find(p => p.uuid == uuid);
            if (!p)
                return;
            const ps = p.tasks_uuid.map(t_uuid => this.CascadeDeleteTask(t_uuid));
            yield Promise.all(ps);
            yield this.loader.project.delete(uuid);
            const db = p.database_uuid;
            if (bind)
                yield this.Delete_Database_Idle(db);
        });
    }
    CascadeDeleteTask(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.task.load(uuid);
            const p = this.memory.tasks.find(p => p.uuid == uuid);
            if (!p)
                return;
            const ps = p.jobs_uuid.map(j_uuid => this.loader.job.delete(j_uuid));
            yield Promise.all(ps);
            yield this.loader.task.delete(uuid);
            const ps2 = this.memory.projects.filter(x => x.tasks_uuid.includes(uuid)).map(x => x.uuid);
            for (let u of ps2) {
                const index = this.memory.projects.findIndex(x => x.uuid == u);
                if (index != -1)
                    this.memory.projects.splice(index, 1);
            }
        });
    }
    CascadeDeleteJob(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.job.delete(uuid);
            const ps2 = this.memory.tasks.filter(x => x.jobs_uuid.includes(uuid)).map(x => x.uuid);
            for (let u of ps2) {
                const index = this.memory.tasks.findIndex(x => x.uuid == u);
                if (index != -1)
                    this.memory.tasks.splice(index, 1);
            }
        });
    }
    Delete_Database_Idle(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.project.load_all().then(() => {
                const f = this.memory.projects.find(x => x.database_uuid == uuid);
                if (f == undefined) {
                    this.loader.database.delete(uuid);
                }
            });
        });
    }
}
exports.Project_Module = Project_Module;
//# sourceMappingURL=project.js.map