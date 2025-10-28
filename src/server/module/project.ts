// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { Job, Project, Task } from "../../interface"
import { MemoryData, RecordLoader } from "../io"
import { Server } from "../server"

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
     * Delete project related data and project itself
     * @param uuid Project UUID
     */
    CascadeDeleteProject(uuid:string){
        const p:Project | undefined = this.memory.projects.find(p=> p.uuid == uuid)
        if(!p) return
        p.tasks_uuid.forEach(t_uuid => {
            this.CascadeDeleteTask(t_uuid)
        })
        this.loader.project.delete(p.uuid)
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
}