import { Job, Project, Task } from "../../interface";
import { MemoryData, RecordLoader } from "../io";
import { Server } from "../server";
export declare class Project_Module {
    server: Server;
    constructor(memory: Server);
    get memory(): MemoryData;
    get loader(): RecordLoader;
    ProjectJobCount(uuid: string): number;
    PopulateProject(uuid: string): Project | undefined;
    PopulateTask(uuid: string): Task | undefined;
    GetProjectRelatedTask(uuid: string): Array<Task>;
    GetTaskRelatedJob(uuid: string): Array<Job>;
    CascadeDeleteProject(uuid: string, bind: boolean): void;
    CascadeDeleteTask(uuid: string): void;
    Delete_Database_Idle(uuid: string): Promise<void>;
}
