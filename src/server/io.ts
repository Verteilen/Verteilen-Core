// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { 
    Project, 
    RecordType, 
    Database, 
    UserProfile, 
    Library,
    ExecutionLog,
    Node,
    Task,
    Job,
    Shareable,
    ACLType,
    JWT,
    SERECT,
    DataHeader,
} from "../interface"
import jwt from 'jsonwebtoken'

/**
 * **Record Data**
 */
export interface MemoryData {
    projects: Array<Project>
    tasks: Array<Task>
    jobs: Array<Job>
    database: Array<Database>
    nodes: Array<Node>
    logs: Array<ExecutionLog>
    libs: Array<Library>
    user: Array<UserProfile>
}

/**
 * **Server Use Interface**\
 * FOr backend server action
 */
export interface RecordIOLoader {
    load_all: (cache:boolean, token?:string) => Promise<Array<string>>
    delete_all: (token?:string) => Promise<void>
    list_all: (token?:string) => Promise<Array<string>>
    save: (name:string, data:string, token?:string) => Promise<void>
    load: (name:string, cache:boolean, token?:string) => Promise<string>
    rename: (name:string, newname:string, token?:string) => Promise<void>
    delete: (name:string, token?:string) => Promise<void>
}
/**
 * **IO Loader Worker**\
 * Fetch data from storage space, could be disk or mongoDB
 */
export interface RecordLoader {
    project: RecordIOLoader
    task: RecordIOLoader
    job: RecordIOLoader
    database: RecordIOLoader
    node: RecordIOLoader
    log: RecordIOLoader
    lib: RecordIOLoader
    user: RecordIOLoader
}
/**
 * **IO Function Interface**\
 * Use for access the file store function
 */
export interface RecordIOBase {
    root: string
    join: (...paths:Array<string>) => string
    read_dir: (path:string) => Promise<Array<string>>
    read_dir_dir: (path:string) => Promise<Array<string>>
    read_dir_file: (path:string) => Promise<Array<string>>
    read_string: (path:string, options?:any) => Promise<string>
    write_string: (path:string, content:string) => Promise<void>
    exists: (path:string) => boolean
    mkdir: (path:string) => Promise<void>
    rm: (path:string) => Promise<void>
    cp: (path:string, newpath:string) => Promise<void>
}
/**
 * **Mongo Function Interface**\
 * Use for access the MongoDB store function
 */
export interface RecordMongoBase {

}

const permissionHelper = (x:Shareable & DataHeader, uuid:string) => {
    const ispublic = x.owner == undefined || x.acl == ACLType.PUBLIC
    if(ispublic) return true
    const isowner = x.owner == uuid
    if(isowner) return true
    const canbeshared = x.acl != ACLType.PRIVATE
    if(!canbeshared) return false
    if(!x.shared) return false
    const target = x.shared.find(x => x.user == uuid)
    if(target == undefined) return false
    return true
}
const permissionGetPublic = (v:Array<Shareable & DataHeader>):Array<Shareable & DataHeader> => {
    return v.filter(x => x.owner == undefined || x.acl == ACLType.PUBLIC)
}

const obsoleteSupport = async (loader:RecordIOBase, type:RecordType, folder:string) => {
    if(type == RecordType.PROJECT){
        const path = loader.join(loader.root, "record")
        if(!loader.exists(path)) return
        const p = await loader.read_dir_file(path)
        const ps = p.filter(x => x.endsWith(".json")).map(x => {
            const path_r = loader.join(path, x)
            return loader.read_string(path_r)
        })
        const allRecordText:Array<string> = await Promise.all(ps)
        const allRecord:Array<any> = allRecordText.map(x => JSON.parse(x))

        const execute_project:Array<Promise<any>> = []
        const execute_task:Array<Promise<any>> = []
        const execute_job:Array<Promise<any>> = []
        for(let x of allRecord){
            const tasks:Array<any> = x.task
            x.tasks = []
            x.database_uuid = x.parameter_uuid
            x.tasks_uuid = tasks.map(y => y.uuid)
            delete x.parameter_uuid
            delete x.task

            for(let y of tasks){
                const jobs = y.jobs
                y.jobs = []
                y.jobs_uuid = jobs.map(z => z.uuid)

                for(let z of jobs){
                    z.id_args = []
                    const d3 = loader.join(loader.root, "job", `${z.uuid}.json`)
                    execute_job.push(loader.write_string(d3, JSON.stringify(z, null, 4)))
                }
                const d2 = loader.join(loader.root, "task", `${y.uuid}.json`)
                execute_task.push(loader.write_string(d2, JSON.stringify(y, null, 4)))
            }
            const d1 = loader.join(loader.root, "project", `${x.uuid}.json`)
            execute_project.push(loader.write_string(d1, JSON.stringify(x, null, 4)))
        }
        await Promise.all(execute_project)
        await Promise.all(execute_task)
        await Promise.all(execute_job)
        await loader.rm(path)
    }
    else if(type == RecordType.DATABASE){
        const path = loader.join(loader.root, "parameter")
        if(!loader.exists(path)) return
        const p = await loader.read_dir_file(path)
        const ps = p.filter(x => x.endsWith(".json")).map(x => {
            const path2 = loader.join(path, x)
            const path3 = loader.join(loader.root, folder, x)
            return loader.cp(path2, path3)
        })
        await Promise.all(ps)
        loader.rm(path)
    }
}

/**
 * **Create the interface for record memory storage**\
 * Generate a loader interface for register to server event
 * @param loader Memory loader interface
 * @param type Type of storage
 * @returns Interface for calling
 */
export const _CreateRecordMemoryLoader = (loader:MemoryData, type:RecordType):RecordIOLoader => {
    const get_array = (type:RecordType):Array<Shareable & DataHeader> => {
        switch(type){
            default:
            case RecordType.PROJECT: return loader.projects
            case RecordType.TASK: return loader.tasks
            case RecordType.JOB: return loader.jobs
            case RecordType.DATABASE: return loader.database
            case RecordType.NODE: return loader.nodes
            case RecordType.LOG: return loader.logs
            case RecordType.LIB: return loader.libs
            case RecordType.USER: return loader.user
        }
    }
    return {
        load_all: async (cache:boolean, token?:string):Promise<Array<string>> => {
            return new Promise<Array<string>>((resolve, reject) => {
                const arr = get_array(type)
                const pub = permissionGetPublic(arr).map(x => JSON.stringify(x))
                const default_behaviour = (v:Array<string>) => resolve(v)
                if(token == undefined){
                    default_behaviour(pub)
                    return
                }

                jwt.verify(token, SERECT, { complete: true }, (err, decode) => {
                    if(err){
                        reject(err.name)
                        return
                    }
                    if(decode == undefined){
                        default_behaviour(pub)
                        return
                    }
                    const payload:JWT = JSON.parse(decode.payload as string)
                    return arr.filter(x => permissionHelper(x, payload.user))
                        .map(x => JSON.stringify(x))
                })
            })
        },
        delete_all: async (token?:string):Promise<void> => {
            return new Promise<void>((resolve, reject) => {
                const arr = get_array(type)
                const pub = permissionGetPublic(arr)
                const default_behaviour = (kill:Array<Shareable & DataHeader>) => {
                    pub.forEach(x => {
                        const index = arr.findIndex(y => y.uuid == x.uuid)
                        arr.slice(index, 1)
                    })
                    resolve()
                }
                if(token == undefined){
                    default_behaviour(pub)
                    return
                }

                jwt.verify(token, SERECT, { complete: true }, (err, decode) => {
                    if(err){
                        reject(err.name)
                        return
                    }
                    if(decode == undefined){
                        default_behaviour(pub)
                        return
                    }
                    const payload:JWT = JSON.parse(decode.payload as string)
                    const targets = arr.filter(x => permissionHelper(x, payload.user))
                    default_behaviour(targets)
                })
            })
        },
        list_all: async (token?:string):Promise<Array<string>> => {
            return get_array(type).map(x => x.uuid)
        },
        save: async (name:string, data:string, token?:string):Promise<void> => {
            const arr = get_array(type)
            const b = arr.findIndex(x => name == x.uuid)
            if(b != -1) arr[b] = JSON.parse(data)
            else arr.push(JSON.parse(data))
        },
        load: async (name:string, cache:boolean, token?:string):Promise<string> => {
            const arr = get_array(type)
            const b = arr.find(x => name == x.uuid)
            return b ? JSON.stringify(b) : ""
        },
        rename: async (name:string, newname:string, token?:string):Promise<void> => {
            const arr = get_array(type)
            const b = arr.findIndex(x => x.uuid == name)
            if(b != -1) arr[b].uuid = newname
        },
        delete: async (name:string, token?:string):Promise<void> => {
            const arr = get_array(type)
            const b = arr.findIndex(x => x.uuid == name)
            if(b != -1) arr.splice(b, 1)
        }
    }
}
/**
 * **Create the interface for record files storage**\
 * Generate a loader interface for register to server event
 * @param loader IO loader interface
 * @param folder Folder name
 * @param ext Store file extension
 * @returns Interface for calling
 */
export const _CreateRecordIOLoader = (loader:RecordIOBase, memory:MemoryData, type:RecordType, folder:string, ext:string = ".json"):RecordIOLoader => {
    const mem = _CreateRecordMemoryLoader(memory, type)
    return {
        load_all: async (cache:boolean, token?:string):Promise<Array<string>> => {
            if(cache){
                return mem.load_all(cache, token)
            }
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            await obsoleteSupport(loader, type, folder)
            const files = await loader.read_dir_file(root)
            const r:Array<Promise<string>> = files.map(x => 
                loader.read_string(loader.join(root, x), { encoding: 'utf8', flag: 'r' })
            )
            const p = await Promise.all(r)
            const saver = p.map(x => {
                const data = JSON.parse(x)
                return mem.save(data.uuid, x, token)
            })
            await Promise.all(saver)
            return mem.load_all(cache, token)
        },
        delete_all: async (token?:string):Promise<void> => {
            const root = loader.join(loader.root, folder)
            if(loader.exists(root)) await loader.rm(root)
            await loader.mkdir(root)
            const arr = get_array(type)
            arr.splice(0, arr.length)
        },
        list_all: async (token?:string):Promise<Array<string>> => {
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            return loader.read_dir_file(root)
        },
        save: async (uuid:string, data:string, token?:string):Promise<void> => {
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            const file = loader.join(root, uuid + ext)
            await loader.write_string(file, data)
            const arr = get_array(type)
            const b = arr.findIndex(x => x.uuid == uuid)
            if(b != -1) arr[b] = JSON.parse(data)
            else arr.push(JSON.parse(data))
        },
        load: async (uuid:string, cache: boolean, token?:string):Promise<string> => {
            const arr:Array<any> = get_array(type)
            if(cache){
                const b = arr.findIndex(x => x.uuid == uuid)
                if(b != -1) return JSON.stringify(arr[b])
            }
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            const file = loader.join(root, uuid + ext)
            if(!loader.exists(file)){
                const b = arr.findIndex(x => x.uuid == uuid)
                if(b != -1) arr.splice(b, 1)
                return ""
            }
            const a = await loader.read_string(file)
            if(cache) arr.push(JSON.parse(a))
            return a
        },
        rename: async (uuid:string, newuuid:string, token?:string):Promise<void> => {
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            const oldfile = loader.join(root, uuid + ext)
            const newfile = loader.join(root, newuuid + ext)
            await loader.cp(oldfile, newfile)
            await loader.rm(oldfile)
            const arr = get_array(type)
            const b = arr.findIndex(x => x.uuid == uuid)
            if(b != -1) arr[b].uuid = newuuid
        },
        delete: async (uuid:string, token?:string):Promise<void> => {
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            const file = loader.join(root, uuid + ext)
            if(loader.exists(file)){
                await loader.rm(file)
            }
            const arr = get_array(type)
            const b = arr.findIndex(x => x.uuid == uuid)
            if(b != -1) arr.splice(b, 1)
        }
    }
}

/**
 * **Create the interface for record memory storage**\
 * Generate a loader interface for register to server event
 * @param loader loader memory loader interface
 * @returns Interface for server calling
 */
export const CreateRecordMemoryLoader = (loader:MemoryData):RecordLoader => {
    return {
        project: _CreateRecordMemoryLoader(loader, RecordType.PROJECT),
        task: _CreateRecordMemoryLoader(loader, RecordType.TASK),
        job: _CreateRecordMemoryLoader(loader, RecordType.JOB),
        database: _CreateRecordMemoryLoader(loader, RecordType.DATABASE),
        node: _CreateRecordMemoryLoader(loader, RecordType.NODE),
        log: _CreateRecordMemoryLoader(loader, RecordType.LOG),
        lib: _CreateRecordMemoryLoader(loader, RecordType.LIB),
        user: _CreateRecordMemoryLoader(loader, RecordType.USER),
    }
}
/**
 * **Create the interface for record files storage**\
 * Generate a loader interface for register to server event
 * @param loader loader IO loader interface
 * @param user should include user
 * @returns Interface for server calling
 */
export const CreateRecordIOLoader = (loader:RecordIOBase, memory:MemoryData):RecordLoader => {
    return {
        project: _CreateRecordIOLoader(loader, memory, RecordType.PROJECT, "project"),
        task: _CreateRecordIOLoader(loader, memory, RecordType.TASK, "task"),
        job: _CreateRecordIOLoader(loader, memory, RecordType.JOB, "job"),
        database: _CreateRecordIOLoader(loader, memory, RecordType.DATABASE, "database"),
        node: _CreateRecordIOLoader(loader, memory, RecordType.NODE, "node"),
        log: _CreateRecordIOLoader(loader, memory, RecordType.LOG, "log"),
        lib: _CreateRecordIOLoader(loader, memory, RecordType.LIB, "lib", ""),
        user: _CreateRecordIOLoader(loader, memory, RecordType.USER, "user"),
    }
}

export const CreateRecordMongoLoader = (loader:RecordMongoBase, folder:string, ext:string = ".json") => {

}