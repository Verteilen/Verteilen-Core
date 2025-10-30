"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project_Module = void 0;
class Project_Module {
    server;
    constructor(memory) {
        this.server = memory;
    }
    get memory() { return this.server.memory; }
    get loader() { return this.server.current_loader; }
    ProjectJobCount(uuid) {
        const p = this.memory.projects.find(p => p.uuid == uuid);
        if (!p)
            return 0;
        const t = p.tasks_uuid.map(t_uuid => this.memory.tasks.find(t => t.uuid == t_uuid)).filter(t => t != undefined);
        const counts = t.map(x => x.jobs_uuid.length);
        return counts.reduce((a, b) => a + b, 0);
    }
    PopulateProject(uuid) {
        const p = this.memory.projects.find(p => p.uuid == uuid);
        if (!p)
            return undefined;
        const buffer = Object.assign({}, p);
        for (var x of buffer.tasks_uuid) {
            const t = this.PopulateTask(x);
            if (!t)
                return undefined;
            buffer.tasks.push(t);
        }
        return buffer;
    }
    PopulateTask(uuid) {
        const p = this.memory.tasks.find(p => p.uuid == uuid);
        if (!p)
            return undefined;
        const buffer = Object.assign({}, p);
        for (var x of buffer.jobs_uuid) {
            const t = this.memory.jobs.find(t => t.uuid == x);
            if (!t)
                return undefined;
            buffer.jobs.push(t);
        }
        return buffer;
    }
    GetProjectRelatedTask(uuid) {
        const p = this.memory.projects.find(x => x.uuid == uuid);
        if (!p)
            return [];
        const r = p.tasks_uuid.map(x => {
            return this.memory.tasks.find(y => y.uuid == x);
        }).filter(x => x != undefined);
        return r;
    }
    GetTaskRelatedJob(uuid) {
        const p = this.memory.tasks.find(x => x.uuid == uuid);
        if (!p)
            return [];
        const r = p.jobs_uuid.map(x => {
            return this.memory.jobs.find(y => y.uuid == x);
        }).filter(x => x != undefined);
        return r;
    }
    CascadeDeleteProject(uuid, bind) {
        const p = this.memory.projects.find(p => p.uuid == uuid);
        if (!p)
            return;
        p.tasks_uuid.forEach(t_uuid => {
            this.CascadeDeleteTask(t_uuid);
        });
        const db = p.database_uuid;
        this.loader.project.delete(p.uuid);
        if (bind)
            this.Delete_Database_Idle(db);
    }
    CascadeDeleteTask(uuid) {
        const p = this.memory.tasks.find(p => p.uuid == uuid);
        if (!p)
            return;
        p.jobs_uuid.forEach(j_uuid => {
            this.loader.job.delete(j_uuid);
        });
        this.loader.task.delete(p.uuid);
    }
    async Delete_Database_Idle(uuid) {
        return this.loader.project.load_all().then(() => {
            const f = this.memory.projects.find(x => x.database_uuid == uuid);
            if (f == undefined) {
                this.loader.database.delete(uuid);
            }
        });
    }
}
exports.Project_Module = Project_Module;
