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
    ProjectJobCount(socket, uuid, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.project.load(uuid, token);
            const p = this.memory.projects.find(p => p.uuid == uuid);
            if (!p)
                return;
            const t = p.tasks_uuid.map(t_uuid => this.memory.tasks.find(t => t.uuid == t_uuid)).filter(t => t != undefined);
            const counts = t.map(x => x.jobs_uuid.length);
            const v = counts.reduce((a, b) => a + b, 0);
            socket === null || socket === void 0 ? void 0 : socket.emit("project_module:get_job_count-feedback", v);
        });
    }
    ReOrderProjectTask(socket, uuid, uuids, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.project.load(uuid, token);
            const p = this.memory.projects.find(p => p.uuid == uuid);
            if (!p)
                return;
            p.tasks_uuid = uuids;
            this.loader.project.save(uuid, JSON.stringify(p, null, 4), token);
        });
    }
    PopulateProject(socket, uuid, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const v = yield this._PopulateProject(socket, uuid, token);
            socket === null || socket === void 0 ? void 0 : socket.emit("project_module:populate_project-feedback", v);
        });
    }
    /**
     * Assign real data to instance
     * @param uuid Project UUID
     */
    _PopulateProject(socket, uuid, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.project.load(uuid, token);
            const p = this.memory.projects.find(p => p.uuid == uuid);
            if (!p)
                return;
            const buffer = Object.assign({}, p);
            const ts = buffer.tasks_uuid.map(x => this.PopulateTask(socket, x, token));
            buffer.tasks = (yield Promise.all(ts)).filter(x => x != undefined);
            return buffer;
        });
    }
    PopulateTask(socket, uuid, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const v = yield this._PopulateTask(socket, uuid, token);
            socket === null || socket === void 0 ? void 0 : socket.emit("project_module:populate_task-feedback", v);
        });
    }
    /**
     * Assign real data to instance
     * @param uuid Task UUID
     */
    _PopulateTask(socket, uuid, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.task.load(uuid, token);
            const p = this.memory.tasks.find(p => p.uuid == uuid);
            if (!p)
                return undefined;
            const buffer = Object.assign({}, p);
            const js = buffer.jobs_uuid.map((x) => __awaiter(this, void 0, void 0, function* () {
                yield this.loader.job.load(uuid, token);
                return this.memory.jobs.find(t => t.uuid == x);
            }));
            buffer.jobs = (yield Promise.all(js)).filter(x => x != undefined);
            return buffer;
        });
    }
    /**
     * Get tasks from project related
     * @param uuid Project UUID
     * @returns Related Tasks
     */
    GetProjectRelatedTask(socket, uuid, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.project.load(uuid, token);
            const p = this.memory.projects.find(x => x.uuid == uuid);
            if (!p) {
                socket === null || socket === void 0 ? void 0 : socket.emit("project_module:get_tasks-feedback", []);
                return;
            }
            const r = p.tasks_uuid.map(x => {
                return this.loader.task.load(x, token);
            });
            yield Promise.all(r);
            const tasks = p.tasks_uuid.map(x => this.memory.tasks.find(y => y.uuid == x)).filter(x => x != undefined);
            socket === null || socket === void 0 ? void 0 : socket.emit("project_module:get_tasks-feedback", tasks);
        });
    }
    /**
     * Get jobs from task related
     * @param uuid Task UUID
     * @returns Related Jobs
     */
    GetTaskRelatedJob(socket, uuid, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.task.load(uuid, token);
            const p = this.memory.tasks.find(x => x.uuid == uuid);
            if (!p) {
                socket === null || socket === void 0 ? void 0 : socket.emit("project_module:get_jobs-feedback", []);
                return;
            }
            const r = p.jobs_uuid.map(x => {
                return this.loader.job.load(x, token);
            });
            yield Promise.all(r);
            const jobs = p.jobs_uuid.map(x => this.memory.jobs.find(y => y.uuid == x)).filter(x => x != undefined);
            socket === null || socket === void 0 ? void 0 : socket.emit("project_module:get_jobs-feedback", jobs);
        });
    }
    CloneProjects(socket, uuids, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const v = yield this._CloneProjects(socket, uuids, token);
            socket === null || socket === void 0 ? void 0 : socket.emit("project_module:clone_projects-feedback", v);
        });
    }
    /**
     * Clone Project Container
     * @param uuids project uuids
     * @returns The new uuids list
     */
    _CloneProjects(socket, uuids, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = uuids.map(x => this.loader.project.load(x, token));
            const ps = yield Promise.all(p);
            const projects = ps.map(x => JSON.parse(x));
            projects.forEach((x, i) => x.uuid = (0, uuid_1.v6)({}, undefined, i));
            const jus = projects.map(x => this._CloneTasks(socket, x.tasks_uuid, token));
            const ju = yield Promise.all(jus);
            projects.forEach((t, index) => {
                t.tasks_uuid = ju[index];
            });
            const js = projects.map(x => this.loader.project.save(x.uuid, JSON.stringify(x), token));
            yield Promise.all(js);
            return projects.map(x => x.uuid);
        });
    }
    CloneTasks(socket, uuids, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const v = yield this._CloneTasks(socket, uuids, token);
            socket === null || socket === void 0 ? void 0 : socket.emit("project_module:clone_tasks-feedback", v);
        });
    }
    /**
     * Clone Task Container
     * @param uuids task uuids
     * @returns The new uuids list
     */
    _CloneTasks(socket, uuids, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = uuids.map(x => this.loader.task.load(x, token));
            const ps = yield Promise.all(p);
            const tasks = ps.map(x => JSON.parse(x));
            tasks.forEach((x, i) => x.uuid = (0, uuid_1.v6)({}, undefined, 2500 + i));
            const jus = tasks.map(x => this._CloneJobs(socket, x.jobs_uuid, token));
            const ju = yield Promise.all(jus);
            tasks.forEach((t, index) => {
                t.jobs_uuid = ju[index];
            });
            const js = tasks.map(x => this.loader.task.save(x.uuid, JSON.stringify(x), token));
            yield Promise.all(js);
            return tasks.map(x => x.uuid);
        });
    }
    CloneJobs(socket, uuids, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const v = yield this._CloneJobs(socket, uuids, token);
            socket === null || socket === void 0 ? void 0 : socket.emit("project_module:clone_jobs-feedback", v);
        });
    }
    /**
     * Clone Job Container
     * @param uuids job uuids
     * @returns The new uuids list
     */
    _CloneJobs(socket, uuids, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = uuids.map(x => this.loader.job.load(x, token));
            const ps = yield Promise.all(p);
            const jobs = ps.map(x => JSON.parse(x));
            jobs.forEach((x, i) => x.uuid = (0, uuid_1.v6)({}, undefined, 5000 + i));
            const js = jobs.map(x => this.loader.job.save(x.uuid, JSON.stringify(x), token));
            yield Promise.all(js);
            return jobs.map(x => x.uuid);
        });
    }
    /**
     * Delete project related data and project itself
     * @param uuid Project UUID
     */
    CascadeDeleteProject(socket, uuid, bind, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loader.project.load(uuid, token);
            const p = this.memory.projects.find(p => p.uuid == uuid);
            if (!p)
                return;
            const ps = p.tasks_uuid.map(t_uuid => this.CascadeDeleteTask(socket, t_uuid, false, token));
            yield Promise.all(ps);
            const del = yield this.loader.project.delete(uuid, token);
            console.log("Delete project: ", del);
            const db = p.database_uuid;
            if (bind)
                yield this.Delete_Database_Idle(socket, db, token);
        });
    }
    /**
     * Delete Task related data and project itself
     * @param uuid Task UUID
     */
    CascadeDeleteTask(socket_1, uuid_2) {
        return __awaiter(this, arguments, void 0, function* (socket, uuid, project_change = true, token) {
            yield this.loader.task.load(uuid, token);
            const p = this.memory.tasks.find(p => p.uuid == uuid);
            if (!p)
                return;
            const ps = p.jobs_uuid.map(j_uuid => this.loader.job.delete(j_uuid, token));
            yield Promise.all(ps);
            yield this.loader.task.delete(uuid, token);
            // The project with task uuid includes
            if (!project_change)
                return;
            const caller = [];
            const ps2 = this.memory.projects.filter(x => x.tasks_uuid.includes(uuid)).map(x => x.uuid);
            for (let u of ps2) {
                const index = this.memory.projects.findIndex(x => x.uuid == u);
                if (index == -1) {
                    if (process.env.NODE_ENV == 'development')
                        console.error(`[Project:Module] Cascade:Task command, get projects index failed: ${u}`);
                    continue;
                }
                const buffer = JSON.parse(JSON.stringify(this.memory.projects[index]));
                const task_index = buffer.tasks_uuid.findIndex(x => x == uuid);
                if (task_index == -1) {
                    if (process.env.NODE_ENV == 'development')
                        console.error(`[Project:Module] Cascade:Task command, get projects task_index failed: ${u}`);
                    continue;
                }
                buffer.tasks_uuid.splice(task_index, 1);
                caller.push(this.loader.project.save(u, JSON.stringify(buffer, null, 4)));
            }
            yield Promise.all(caller);
        });
    }
    /**
     * Delete Task related data and project itself
     * @param uuid Task UUID
     */
    CascadeDeleteJob(socket_1, uuid_2) {
        return __awaiter(this, arguments, void 0, function* (socket, uuid, task_change = true, token) {
            yield this.loader.job.delete(uuid, token);
            if (!task_change)
                return;
            const caller = [];
            const ps2 = this.memory.tasks.filter(x => x.jobs_uuid.includes(uuid)).map(x => x.uuid);
            for (let u of ps2) {
                const index = this.memory.tasks.findIndex(x => x.uuid == u);
                if (index == -1) {
                    if (process.env.NODE_ENV == 'development')
                        console.error(`[Project:Module] Cascade:Job command, get tasks index failed: ${u}`);
                    continue;
                }
                const buffer = JSON.parse(JSON.stringify(this.memory.tasks[index]));
                const job_index = buffer.jobs_uuid.findIndex(x => x == uuid);
                if (job_index == -1) {
                    if (process.env.NODE_ENV == 'development')
                        console.error(`[Project:Module] Cascade:Job command, get tasks job_index failed: ${u}`);
                    continue;
                }
                buffer.jobs_uuid.splice(job_index, 1);
                caller.push(this.loader.task.save(u, JSON.stringify(buffer, null, 4)));
            }
            yield Promise.all(caller);
        });
    }
    /**
     * Delete idle database
     * @param uuid Database UUID
     */
    Delete_Database_Idle(socket, uuid, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.project.load_all(token).then(() => {
                const f = this.memory.projects.find(x => x.database_uuid == uuid);
                if (f == undefined) {
                    this.loader.database.delete(uuid, token);
                }
            });
        });
    }
}
exports.Project_Module = Project_Module;
//# sourceMappingURL=project.js.map