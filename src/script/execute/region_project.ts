// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { ExecuteState, Project } from "../../interface"
import { ExecuteManager } from "../execute_manager"
import { Region_Task } from "./region_task"

export class Region_Project {
    target:ExecuteManager
    project: Project
    runner: Region_Task | undefined

    constructor(_target:ExecuteManager, _project:Project){
        this.project = _project
        this.target = _target
    }

    RUN = () => {
        if(this.runner == undefined && this.project.tasks.length > 0 && this.target.t_state != ExecuteState.FINISH){
            // When we are just start it, the project run
            this.runner = new Region_Task(this.target, this.project.tasks[0])
            this.target.messager_log(`[Execute] Task Start ${this.runner.task.uuid}`)
            this.target.messager_log(`[Execute] Task cron state: ${this.runner.task.cronjob}`)
        } else if (this.project.tasks.length == 0){
            this.runner = undefined
        }

        /**
         * In any case, if the task has value, this mean we are in the task stage, so, just ignore everything.\
         * Go for the task stage
         */
        if(this.runner != undefined){
            this.runner.RUN()
        }else{
            /**
             * If we are here, task is none by this case. This can only be 
             * * A: We are finish all the tasks, And there is no next project, So just mark as finish for entire process
             * * B: We are finish all the tasks, Go to next project
             */
            const index = this.target.current_projects.findIndex(x => x.uuid == this.project.uuid)
            if(index < this.target.current_projects.length - 1){
                // * Case A: Next project
                this.target.messager_log(`[Execute] Project Finish ${this.project.uuid}`)
                this.target.proxy?.executeProjectFinish([this.project, index])
                this.target.runner = new Region_Project(this.target, this.target.current_projects[index + 1])
                this.target.proxy?.executeProjectStart([this.project, index + 1])
                this.target.t_state = ExecuteState.NONE
            }else{
                // * Case B: Finish entire thing
                this.target.messager_log(`[Execute] Project Finish ${this.project.uuid}`)
                this.target.proxy?.executeProjectFinish([this.project, index])
                this.target.runner = undefined
                this.target.state = ExecuteState.FINISH
                this.target.t_state = ExecuteState.NONE
            }
        }
    }
}