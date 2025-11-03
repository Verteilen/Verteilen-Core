// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { Job, Project, Task } from "../../interface"
import { MemoryData, RecordLoader } from "../io"
import { Server } from "../server"
import { v6 as uuidv6 } from 'uuid'

export class Project_Module {
    server:Server

    constructor(memory:Server) {
        this.server = memory
    }

    public get memory(): MemoryData { return this.server.memory }
    public get loader(): RecordLoader { return this.server.current_loader }

    async ProjectJobCount(uuid:string):Promise<number> {
        await this.loader.project.load(uuid, true)
        const p:Project | undefined = this.memory.projects.find(p=> p.uuid == uuid)
        if(!p) return 0
        const t:Array<Task> = p.tasks_uuid.map(t_uuid => this.memory.tasks.find(t => t.uuid == t_uuid)).filter(t => t != undefined)
        const counts = t.map(x => x.jobs_uuid.length)
        return counts.reduce((a,b) => a + b, 0)
    }
    async ReOrderProjectTask(uuid:string, uuids:Array<string>):Promise<void> {
        await this.loader.project.load(uuid, true)
        const p:Project | undefined = this.memory.projects.find(p=> p.uuid == uuid)
        if(!p) return
        p.tasks_uuid = uuids
        this.loader.project.save(uuid, JSON.stringify(p, null, 4))
    }

    /**
     * Assign real data to instance
     * @param uuid Project UUID
     */
    async PopulateProject(uuid:string):Promise<Project | undefined> {
        await this.loader.project.load(uuid, true)
        const p:Project | undefined = this.memory.projects.find(p=> p.uuid == uuid)
        if(!p) return undefined
        const buffer:Project = Object.assign({}, p) as Project
        const ts = buffer.tasks_uuid.map(x => this.PopulateTask(x))
        buffer.tasks = (await Promise.all(ts)).filter(x => x != undefined)
        return buffer
    }
    /**
     * Assign real data to instance
     * @param uuid Task UUID
     */
    async PopulateTask(uuid:string):Promise<Task | undefined> {
        await this.loader.task.load(uuid, false)
        const p:Task | undefined = this.memory.tasks.find(p=> p.uuid == uuid)
        if(!p) return undefined
        const buffer:Task = Object.assign({}, p) as Task
        const js = buffer.jobs_uuid.map(async x => {
            await this.loader.job.load(uuid, false)
            return this.memory.jobs.find(t => t.uuid == x)
        })
        buffer.jobs = (await Promise.all(js)).filter(x => x != undefined)
        return buffer
    }
    /**
     * Get tasks from project related
     * @param uuid Project UUID
     * @returns Related Tasks
     */
    async GetProjectRelatedTask(uuid:string):Promise<Array<Task>> {
        await this.loader.project.load(uuid, false)
        const p = this.memory.projects.find(x => x.uuid == uuid)
        if(!p) return []
        const r = p.tasks_uuid.map(x => {
            return this.loader.task.load(x, false)
        })
        await Promise.all(r)
        const tasks = p.tasks_uuid.map(x => this.memory.tasks.find(y => y.uuid == x)).filter(x => x != undefined)
        return tasks
    }
    /**
     * Get jobs from task related
     * @param uuid Task UUID
     * @returns Related Jobs
     */
    async GetTaskRelatedJob(uuid:string):Promise<Array<Job>> {
        await this.loader.task.load(uuid, false)
        const p = this.memory.tasks.find(x => x.uuid == uuid)
        if(!p) return []
        const r = p.jobs_uuid.map(x => {
            return this.loader.job.load(x, false)
        })
        await Promise.all(r)
        const jobs = p.jobs_uuid.map(x => this.memory.jobs.find(y => y.uuid == x)).filter(x => x != undefined)
        return jobs
    }
    /**
     * Clone Project Container
     * @param uuids project uuids
     * @returns The new uuids list
     */
    async CloneProjects(uuids:Array<string>):Promise<Array<string>>{
        const p = uuids.map(x => this.loader.project.load(x, false))
        const ps = await Promise.all(p)
        const projects:Array<Project> = ps.map(x => JSON.parse(x))
        projects.forEach((x, i) => x.uuid = uuidv6({}, undefined, i))
        const jus = projects.map(x => this.CloneTasks(x.tasks_uuid))
        const ju = await Promise.all(jus)
        projects.forEach((t, index) => {
            t.tasks_uuid = ju[index]
        })
        const js = projects.map(x => this.loader.project.save(x.uuid, JSON.stringify(x)))
        await Promise.all(js)
        return projects.map(x => x.uuid)
    }
    /**
     * Clone Task Container
     * @param uuids task uuids
     * @returns The new uuids list
     */
    async CloneTasks(uuids:Array<string>):Promise<Array<string>>{
        const p = uuids.map(x => this.loader.task.load(x, false))
        const ps = await Promise.all(p)
        const tasks:Array<Task> = ps.map(x => JSON.parse(x))
        tasks.forEach((x, i) => x.uuid = uuidv6({}, undefined, 2500 + i))
        const jus = tasks.map(x => this.CloneJobs(x.jobs_uuid))
        const ju = await Promise.all(jus)
        tasks.forEach((t, index) => {
            t.jobs_uuid = ju[index]
        })
        const js = tasks.map(x => this.loader.task.save(x.uuid, JSON.stringify(x)))
        await Promise.all(js)
        return tasks.map(x => x.uuid)
    }
    /**
     * Clone Job Container
     * @param uuids job uuids
     * @returns The new uuids list
     */
    async CloneJobs(uuids:Array<string>):Promise<Array<string>>{
        const p = uuids.map(x => this.loader.job.load(x, false))
        const ps = await Promise.all(p)
        const jobs:Array<Job> = ps.map(x => JSON.parse(x))
        jobs.forEach((x, i) => x.uuid = uuidv6({}, undefined, 5000 + i))
        const js = jobs.map(x => this.loader.job.save(x.uuid, JSON.stringify(x)))
        await Promise.all(js)
        return jobs.map(x => x.uuid)
    }
    /**
     * Delete project related data and project itself
     * @param uuid Project UUID
     */
    async CascadeDeleteProject(uuid:string, bind:boolean):Promise<void>{
        await this.loader.project.load(uuid, false)
        const p:Project = this.memory.projects.find(p=> p.uuid == uuid)!
        if(!p) return
        const ps = p.tasks_uuid.map(t_uuid => this.CascadeDeleteTask(t_uuid))
        await Promise.all(ps)
        const db = p.database_uuid
        await this.loader.project.delete(uuid)
        if(bind) await this.Delete_Database_Idle(db)
    }
    /**
     * Delete Task related data and project itself
     * @param uuid Task UUID
     */
    async CascadeDeleteTask(uuid:string):Promise<void>{
        await this.loader.task.load(uuid, false)
        const p:Task = this.memory.tasks.find(p=> p.uuid == uuid)!
        if(!p) return
        const ps = p.jobs_uuid.map(j_uuid => this.loader.job.delete(j_uuid))
        await Promise.all(ps)
        await this.loader.task.delete(uuid)
        const ps2 = this.memory.projects.filter(x => x.tasks_uuid.includes(uuid)).map(x => x.uuid)
        for(let u of ps2){
            const index = this.memory.projects.findIndex(x => x.uuid == u)
            if(index != -1) this.memory.projects.splice(index, 1)
        }
    }
    /**
     * Delete Task related data and project itself
     * @param uuid Task UUID
     */
    async CascadeDeleteJob(uuid:string):Promise<void>{
        await this.loader.job.delete(uuid)
        const ps2 = this.memory.tasks.filter(x => x.jobs_uuid.includes(uuid)).map(x => x.uuid)
        for(let u of ps2){
            const index = this.memory.tasks.findIndex(x => x.uuid == u)
            if(index != -1) this.memory.tasks.splice(index, 1)
        }
    }
    /**
     * Delete idle database
     * @param uuid Database UUID
     */
    async Delete_Database_Idle(uuid:string){
        return this.loader.project.load_all().then(() => {
            const f = this.memory.projects.find(x => x.database_uuid == uuid)
            if(f == undefined){
                this.loader.database.delete(uuid)
            }
        })
    }
}