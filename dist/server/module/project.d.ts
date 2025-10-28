import { Project, Task } from "../../interface";
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
    CascadeDeleteProject(uuid: string): void;
    CascadeDeleteTask(uuid: string): void;
}
