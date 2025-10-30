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

    ProjectJobCount(uuid:string):number {
        const p:Project | undefined = this.memory.projects.find(p=> p.uuid == uuid)
        if(!p) return 0
        const t:Array<Task> = p.tasks_uuid.map(t_uuid => this.memory.tasks.find(t => t.uuid == t_uuid)).filter(t => t != undefined)
        const counts = t.map(x => x.jobs_uuid.length)
        return counts.reduce((a,b) => a + b, 0)
    }

    /**
     * Assign real data to instance
     * @param uuid Project UUID
     */
    PopulateProject(uuid:string):Project | undefined {
        const p:Project | undefined = this.memory.projects.find(p=> p.uuid == uuid)
        if(!p) return undefined
        const buffer:Project = Object.assign({}, p) as Project
        for(var x of buffer.tasks_uuid){
            const t:Task | undefined = this.PopulateTask(x)
            if(!t) return undefined
            buffer.tasks.push(t)
        }
        return buffer
    }
    /**
     * Assign real data to instance
     * @param uuid Task UUID
     */
    PopulateTask(uuid:string):Task | undefined {
        const p:Task | undefined = this.memory.tasks.find(p=> p.uuid == uuid)
        if(!p) return undefined
        const buffer:Task = Object.assign({}, p) as Task
        for(var x of buffer.jobs_uuid){
            const t:Job | undefined = this.memory.jobs.find(t => t.uuid == x)
            if(!t) return undefined
            buffer.jobs.push(t)
        }
        return buffer
    }
    /**
     * Get tasks from project related
     * @param uuid Project UUID
     * @returns Related Tasks
     */
    GetProjectRelatedTask(uuid:string):Array<Task> {
        const p = this.memory.projects.find(x => x.uuid == uuid)
        if(!p) return []
        const r = p.tasks_uuid.map(x => {
            return this.memory.tasks.find(y => y.uuid == x)
        }).filter(x => x != undefined)
        return r
    }
    /**
     * Get jobs from task related
     * @param uuid Task UUID
     * @returns Related Jobs
     */
    GetTaskRelatedJob(uuid:string):Array<Job> {
        const p = this.memory.tasks.find(x => x.uuid == uuid)
        if(!p) return []
        const r = p.jobs_uuid.map(x => {
            return this.memory.jobs.find(y => y.uuid == x)
        }).filter(x => x != undefined)
        return r
    }
    /**
     * Clone Project Container
     * @param uuids project uuids
     * @returns The new uuids list
     */
    async CloneProjects(uuids:Array<string>):Promise<Array<string>>{
        const p = uuids.map(x => this.loader.project.load(x, true))
        const ps = await Promise.all(p)
        const projects:Array<Project> = ps.map(x => JSON.parse(x))
        projects.forEach(x => x.uuid = uuidv6())
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
        const p = uuids.map(x => this.loader.task.load(x, true))
        const ps = await Promise.all(p)
        const tasks:Array<Task> = ps.map(x => JSON.parse(x))
        tasks.forEach(x => x.uuid = uuidv6())
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
        const p = uuids.map(x => this.loader.job.load(x, true))
        const ps = await Promise.all(p)
        const jobs:Array<Job> = ps.map(x => JSON.parse(x))
        jobs.forEach(x => x.uuid = uuidv6())
        const js = jobs.map(x => this.loader.job.save(x.uuid, JSON.stringify(x)))
        await Promise.all(js)
        return jobs.map(x => x.uuid)
    }
    /**
     * Delete project related data and project itself
     * @param uuid Project UUID
     */
    CascadeDeleteProject(uuid:string, bind:boolean){
        const p:Project | undefined = this.memory.projects.find(p=> p.uuid == uuid)
        if(!p) return
        p.tasks_uuid.forEach(t_uuid => {
            this.CascadeDeleteTask(t_uuid)
        })
        const db = p.database_uuid
        this.loader.project.delete(p.uuid)
        if(bind) this.Delete_Database_Idle(db)
    }
    /**
     * Delete Task related data and project itself
     * @param uuid Task UUID
     */
    CascadeDeleteTask(uuid:string){
        const p:Task | undefined = this.memory.tasks.find(p=> p.uuid == uuid)
        if(!p) return
        p.jobs_uuid.forEach(j_uuid => {
            this.loader.job.delete(j_uuid)
        })
        this.loader.task.delete(p.uuid)
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