import { 
    Project, 
    RecordType, 
    Parameter, 
    UserProfile, 
    Library,
    ExecutionLog,
    Node,
} from "../interface"

export interface MemoryData {
    projects: Array<Project>
    parameter: Array<Parameter>
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
    load_all: () => Promise<Array<string>>
    delete_all: () => Promise<void>
    list_all: () => Promise<Array<string>>
    save: (name:string, data:string) => Promise<void>
    load: (name:string, cache:boolean) => Promise<string>
    rename: (name:string, newname:string) => Promise<void>
    delete: (name:string) => Promise<void>
}

export interface RecordLoader {
    project: RecordIOLoader
    parameter: RecordIOLoader
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

export interface RecordMongoBase {

}

/**
 * **Create the interface for record memory storage**\
 * Generate a loader interface for register to server event
 * @param loader Memory loader interface
 * @param type Type of storage
 * @returns Interface for calling
 */
export const _CreateRecordMemoryLoader = (loader:MemoryData, type:RecordType):RecordIOLoader => {
    const get_array = (type:RecordType):Array<any> => {
        switch(type){
            default:
            case RecordType.PROJECT: return loader.projects
            case RecordType.PARAMETER: return loader.parameter
            case RecordType.NODE: return loader.nodes
            case RecordType.LOG: return loader.logs
            case RecordType.LIB: return loader.libs
            case RecordType.USER: return loader.user
        }
    }
    return {
        load_all: async ():Promise<Array<string>> => {
            return get_array(type).map(x => JSON.stringify(x))
        },
        delete_all: async ():Promise<void> => {
            const arr = get_array(type).map(x => JSON.stringify(x))
            arr.splice(0, arr.length)
        },
        list_all: async ():Promise<Array<string>> => {
            return get_array(type).map(x => x.uuid)
        },
        save: async (name:string, data:string):Promise<void> => {
            const arr = get_array(type)
            const b = arr.findIndex(x => name == x.uuid)
            if(b != -1) arr[b] = JSON.parse(data)
            else arr.push(JSON.parse(data))
        },
        load: async (name:string):Promise<string> => {
            const arr = get_array(type)
            const b = arr.find(x => name == x.uuid)
            return b ? JSON.stringify(b) : ""
        },
        rename: async (name:string, newname:string):Promise<void> => {
            const arr = get_array(type)
            const b = arr.findIndex(x => x.uuid == name)
            if(b != -1) arr[b].uuid = newname
        },
        delete: async (name:string):Promise<void> => {
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
    const get_array = (type:RecordType):Array<any> => {
        switch(type){
            default:
            case RecordType.PROJECT: return memory.projects
            case RecordType.PARAMETER: return memory.parameter
            case RecordType.NODE: return memory.nodes
            case RecordType.LOG: return memory.logs
            case RecordType.LIB: return memory.libs
            case RecordType.USER: return memory.user
        }
    }
    return {
        load_all: async ():Promise<Array<string>> => {
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            const files = await loader.read_dir_file(root)
            const r:Array<Promise<string>> = files.map(x => 
                loader.read_string(x, { encoding: 'utf8', flag: 'r' })
            )
            const p = await Promise.all(r)
            const arr = get_array(type)
            arr.splice(0, arr.length)
            arr.push(...p.map(x => JSON.parse(x)))
            return p
        },
        delete_all: async ():Promise<void> => {
            const root = loader.join(loader.root, folder)
            if(loader.exists(root)) await loader.rm(root)
            await loader.mkdir(root)
            const arr = get_array(type)
            arr.splice(0, arr.length)
        },
        list_all: async ():Promise<Array<string>> => {
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            return loader.read_dir_file(root)
        },
        save: async (name:string, data:string):Promise<void> => {
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            const file = loader.join(root, name + ext)
            await loader.write_string(file, data)
            const arr = get_array(type)
            const b = arr.findIndex(x => x.uuid == name)
            if(b != -1) arr.push(JSON.parse(data))
            else arr[b] = JSON.parse(data)
        },
        load: async (name:string, cache: boolean):Promise<string> => {
            if(cache){
                const arr = get_array(type)
                const b = arr.findIndex(x => x.uuid == name)
                if(b != -1) return arr[b]
            }
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            const file = loader.join(root, name + ext)
            return loader.read_string(file)
        },
        rename: async (name:string, newname:string):Promise<void> => {
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            const oldfile = loader.join(root, name + ext)
            const newfile = loader.join(root, newname + ext)
            await loader.cp(oldfile, newfile)
            await loader.rm(oldfile)
            const arr = get_array(type)
            const b = arr.findIndex(x => x.uuid == name)
            if(b != -1) arr[b].uuid = newname
        },
        delete: async (name:string):Promise<void> => {
            const root = loader.join(loader.root, folder)
            if(!loader.exists(root)) await loader.mkdir(root)
            const file = loader.join(root, name + ext)
            await loader.rm(file)
            const arr = get_array(type)
            const b = arr.findIndex(x => x.uuid == name)
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
        parameter: _CreateRecordMemoryLoader(loader, RecordType.PARAMETER),
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
        project: _CreateRecordIOLoader(loader, memory, RecordType.PROJECT, "record"),
        parameter: _CreateRecordIOLoader(loader, memory, RecordType.PARAMETER, "parameter"),
        node: _CreateRecordIOLoader(loader, memory, RecordType.NODE, "node"),
        log: _CreateRecordIOLoader(loader, memory, RecordType.LOG, "log"),
        lib: _CreateRecordIOLoader(loader, memory, RecordType.LIB, "lib", ""),
        user: _CreateRecordIOLoader(loader, memory, RecordType.USER, "user"),
    }
}

export const CreateRecordMongoLoader = (loader:RecordMongoBase, folder:string, ext:string = ".json") => {

}