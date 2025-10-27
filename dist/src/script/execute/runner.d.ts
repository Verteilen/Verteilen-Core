import { Project, Task } from "../../interface";
import { ExecuteManager_Feedback } from "./feedback";
export declare class ExecuteManager_Runner extends ExecuteManager_Feedback {
    protected ExecuteProject: (project: Project) => void;
    private ExecuteTask;
    private ExecuteTask_Cronjob;
    private ExecuteTask_Single;
    private ExecuteTask_Setup;
    private ExecuteTask_AllFinish;
    private ExecuteCronTask;
    private ExecuteJob;
    SyncDatabase: (p: Project) => void;
    protected Init_CronContainer: (task: Task, taskCount: number) => void;
}
