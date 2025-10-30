import { RecordType } from "../interface";
import { RecordIOLoader, RecordLoader } from "./io";

export interface EventObserverAction {
    loaded:(type:RecordType) => void
    changed:(type:RecordType) => void
}

export class EventObserver implements RecordLoader {
    loader:RecordLoader
    action:EventObserverAction

    constructor(loader:RecordLoader, action:EventObserverAction){
        this.loader = loader
        this.action = action
        this.loader.project = new ProxyRecordIOLoader(loader.project, RecordType.PROJECT, action)
        this.loader.task = new ProxyRecordIOLoader(loader.task, RecordType.TASK, action)
        this.loader.job = new ProxyRecordIOLoader(loader.job, RecordType.JOB, action)
        this.loader.database = new ProxyRecordIOLoader(loader.database, RecordType.DATABASE, action)
        this.loader.node = new ProxyRecordIOLoader(loader.node, RecordType.NODE, action)
        this.loader.log = new ProxyRecordIOLoader(loader.log, RecordType.LOG, action)
        this.loader.lib = new ProxyRecordIOLoader(loader.lib, RecordType.LIB, action)
        this.loader.user = new ProxyRecordIOLoader(loader.user, RecordType.USER, action)
    }

    public get project() : RecordIOLoader { return this.loader.project }
    public get task() : RecordIOLoader { return this.loader.task }
    public get job() : RecordIOLoader { return this.loader.job }
    public get database() : RecordIOLoader { return this.loader.database }
    public get node() : RecordIOLoader { return this.loader.node }
    public get log() : RecordIOLoader { return this.loader.log }
    public get lib() : RecordIOLoader { return this.loader.lib }
    public get user() : RecordIOLoader { return this.loader.user }
}

export class ProxyRecordIOLoader implements RecordIOLoader {
    loader:RecordIOLoader
    type: RecordType
    action:EventObserverAction

    constructor(loader:RecordIOLoader, type: RecordType, action:EventObserverAction){
        this.loader = loader
        this.type = type
        this.action = action
    }

    load_all = (): Promise<Array<string>> => {
        return this.loader.load_all().then(x => {
            this.action.loaded(this.type)
            return x
        })
    }
    delete_all = (): Promise<void> => {
        return this.loader.delete_all().then(() => this.action.changed(this.type))
    }
    list_all = (): Promise<Array<string>> => this.loader.list_all()
    save = (name: string, data: string): Promise<void> => {
        return this.loader.save(name, data).then(() => this.action.changed(this.type))
    }
    load = (name: string, cache: boolean): Promise<string> => {
        return this.loader.load(name, cache).then(x => {
            this.action.loaded(this.type)
            return x
        })
    }
    rename = (name: string, newname: string): Promise<void> => {
        return this.loader.rename(name, newname).then(() => this.action.changed(this.type))
    }
    delete = (name: string): Promise<void> => {
        return this.loader.delete(name).then(() => this.action.changed(this.type))
    }
}

export const CreateEventObserver = (loader:RecordLoader, event:EventObserverAction):EventObserver => {
    return new EventObserver(loader, event)
}