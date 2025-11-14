"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project_Module = void 0;
const uuid_1 = require("uuid");
class Project_Module {
    server;
    constructor(memory) {
        this.server = memory;
    }
    get memory() { return this.server.memory; }
    get loader() { return this.server.current_loader; }
    async ProjectJobCount(uuid) {
        await this.loader.project.load(uuid);
        const p = this.memory.projects.find(p => p.uuid == uuid);
        if (!p)
            return 0;
        const t = p.tasks_uuid.map(t_uuid => this.memory.tasks.find(t => t.uuid == t_uuid)).filter(t => t != undefined);
        const counts = t.map(x => x.jobs_uuid.length);
        return counts.reduce((a, b) => a + b, 0);
    }
    async ReOrderProjectTask(uuid, uuids) {
        await this.loader.project.load(uuid);
        const p = this.memory.projects.find(p => p.uuid == uuid);
        if (!p)
            return;
        p.tasks_uuid = uuids;
        this.loader.project.save(uuid, JSON.stringify(p, null, 4));
    }
    async PopulateProject(uuid) {
        await this.loader.project.load(uuid);
        const p = this.memory.projects.find(p => p.uuid == uuid);
        if (!p)
            return undefined;
        const buffer = Object.assign({}, p);
        const ts = buffer.tasks_uuid.map(x => this.PopulateTask(x));
        buffer.tasks = (await Promise.all(ts)).filter(x => x != undefined);
        return buffer;
    }
    async PopulateTask(uuid) {
        await this.loader.task.load(uuid);
        const p = this.memory.tasks.find(p => p.uuid == uuid);
        if (!p)
            return undefined;
        const buffer = Object.assign({}, p);
        const js = buffer.jobs_uuid.map(async (x) => {
            await this.loader.job.load(uuid);
            return this.memory.jobs.find(t => t.uuid == x);
        });
        buffer.jobs = (await Promise.all(js)).filter(x => x != undefined);
        return buffer;
    }
    async GetProjectRelatedTask(uuid) {
        await this.loader.project.load(uuid);
        const p = this.memory.projects.find(x => x.uuid == uuid);
        if (!p)
            return [];
        const r = p.tasks_uuid.map(x => {
            return this.loader.task.load(x);
        });
        await Promise.all(r);
        const tasks = p.tasks_uuid.map(x => this.memory.tasks.find(y => y.uuid == x)).filter(x => x != undefined);
        return tasks;
    }
    async GetTaskRelatedJob(uuid) {
        await this.loader.task.load(uuid);
        const p = this.memory.tasks.find(x => x.uuid == uuid);
        if (!p)
            return [];
        const r = p.jobs_uuid.map(x => {
            return this.loader.job.load(x);
        });
        await Promise.all(r);
        const jobs = p.jobs_uuid.map(x => this.memory.jobs.find(y => y.uuid == x)).filter(x => x != undefined);
        return jobs;
    }
    async CloneProjects(uuids) {
        const p = uuids.map(x => this.loader.project.load(x));
        const ps = await Promise.all(p);
        const projects = ps.map(x => JSON.parse(x));
        projects.forEach((x, i) => x.uuid = (0, uuid_1.v6)({}, undefined, i));
        const jus = projects.map(x => this.CloneTasks(x.tasks_uuid));
        const ju = await Promise.all(jus);
        projects.forEach((t, index) => {
            t.tasks_uuid = ju[index];
        });
        const js = projects.map(x => this.loader.project.save(x.uuid, JSON.stringify(x)));
        await Promise.all(js);
        return projects.map(x => x.uuid);
    }
    async CloneTasks(uuids) {
        const p = uuids.map(x => this.loader.task.load(x));
        const ps = await Promise.all(p);
        const tasks = ps.map(x => JSON.parse(x));
        tasks.forEach((x, i) => x.uuid = (0, uuid_1.v6)({}, undefined, 2500 + i));
        const jus = tasks.map(x => this.CloneJobs(x.jobs_uuid));
        const ju = await Promise.all(jus);
        tasks.forEach((t, index) => {
            t.jobs_uuid = ju[index];
        });
        const js = tasks.map(x => this.loader.task.save(x.uuid, JSON.stringify(x)));
        await Promise.all(js);
        return tasks.map(x => x.uuid);
    }
    async CloneJobs(uuids) {
        const p = uuids.map(x => this.loader.job.load(x));
        const ps = await Promise.all(p);
        const jobs = ps.map(x => JSON.parse(x));
        jobs.forEach((x, i) => x.uuid = (0, uuid_1.v6)({}, undefined, 5000 + i));
        const js = jobs.map(x => this.loader.job.save(x.uuid, JSON.stringify(x)));
        await Promise.all(js);
        return jobs.map(x => x.uuid);
    }
    async CascadeDeleteProject(uuid, bind) {
        await this.loader.project.load(uuid);
        const p = this.memory.projects.find(p => p.uuid == uuid);
        if (!p)
            return;
        const ps = p.tasks_uuid.map(t_uuid => this.CascadeDeleteTask(t_uuid));
        await Promise.all(ps);
        const db = p.database_uuid;
        await this.loader.project.delete(uuid);
        if (bind)
            await this.Delete_Database_Idle(db);
    }
    async CascadeDeleteTask(uuid) {
        await this.loader.task.load(uuid);
        const p = this.memory.tasks.find(p => p.uuid == uuid);
        if (!p)
            return;
        const ps = p.jobs_uuid.map(j_uuid => this.loader.job.delete(j_uuid));
        await Promise.all(ps);
        await this.loader.task.delete(uuid);
        const ps2 = this.memory.projects.filter(x => x.tasks_uuid.includes(uuid)).map(x => x.uuid);
        for (let u of ps2) {
            const index = this.memory.projects.findIndex(x => x.uuid == u);
            if (index != -1)
                this.memory.projects.splice(index, 1);
        }
    }
    async CascadeDeleteJob(uuid) {
        await this.loader.job.delete(uuid);
        const ps2 = this.memory.tasks.filter(x => x.jobs_uuid.includes(uuid)).map(x => x.uuid);
        for (let u of ps2) {
            const index = this.memory.tasks.findIndex(x => x.uuid == u);
            if (index != -1)
                this.memory.tasks.splice(index, 1);
        }
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
