// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { RecordIOBase } from "./io";
import { 
    Header,
    DatabaseContainer,
    Plugin,
    PluginContainer, 
    PluginPageData, 
    PluginWithToken, 
    Project, 
    TemplateData, 
    TemplateData_Database, 
    TemplateData_Project, 
    TemplateGroup_Project, 
    TemplateGroup_Database, 
    ToastData, 
    WebsocketPack
} from "../interface";
import { PluginFeedback } from "./server";

export type SocketGetter = (uuid:string) => WebsocketPack | undefined

/**
 * **Plugin Function Interface**\
 * Use for access the plugin store function
 */
export interface PluginLoader {
    load_all: () => Promise<PluginPageData>
    get_project: (group:string, filename:string) => string | undefined
    get_database: (group:string, filename:string) => string | undefined
    get_plugin: () => Promise<PluginPageData>
    import_template: (name:string, url:string, token:string) => Promise<PluginPageData>
    import_plugin: (name:string, url:string, token:string) => Promise<PluginPageData>
    delete_template: (name:string) => Promise<void>
    delete_plugin: (name:string) => Promise<void>
    plugin_download: (uuid:string, plugin:string, tokens:string) => Promise<void>
    plugin_remove: (uuid:string, plugin:string) => Promise<void>
}

/**
 * **Get Current Plugin List**
 * @param loader The file io loader
 * @returns Current list in disk storage
 */
export const GetCurrentPlugin = async (loader:RecordIOBase):Promise<PluginPageData> => {
    return new Promise<PluginPageData>(async (resolve) => {
        const b:PluginPageData = {
            plugins: []
        }
        const root = loader.join(loader.root, 'plugin')
        if(!loader.exists(root)) await loader.mkdir(root)

        const plugin_folder = await loader.read_dir_dir(root)
        const plugin_folder_files = await Promise.all(plugin_folder.map(x => loader.read_dir_file(x)))
        for(let i = 0; i < plugin_folder_files.length; i++){
            const files = plugin_folder_files[i]
            const dirname = plugin_folder[i]
            if(!files.includes("manifest.json")) continue

            const manifest_path = loader.join(root, dirname, "manifest.json")
            const manifest = await loader.read_string(manifest_path)
            let header:PluginContainer | undefined = undefined
            try{
                header = JSON.parse(manifest)
            }catch(e:any){
                console.warn(`Reading file error: ${manifest_path}`)
                continue
            }
            if(header == undefined) continue
            header.gen_projects = header.projects.map(x => ({
                value: -1,
                group: x.group,
                filename: x.filename,
                title: x.title
            }))
            header.gen_databases = header.databases.map(x => ({
                value: -1,
                group: x.group,
                filename: x.filename,
                title: x.title
            }))

            b.plugins.push(header)
        }
        resolve(b)
        return b
    })
}

export const CreatePluginLoader = (loader:RecordIOBase, memory:PluginPageData, socket:SocketGetter, feedback:PluginFeedback):PluginLoader => {
    return {
        load_all: async ():Promise<PluginPageData> => {
            const cp = await GetCurrentPlugin(loader)
            memory.plugins = cp.plugins
            return cp
        },
        get_project: (group:string, filename:string):string | undefined => {
            let find = false
            let result:string | undefined = undefined
            for(let x of memory.templates){
                for(let y of x.project){
                    if(y.group == group && y.filename == filename){
                        result = JSON.stringify(y)
                        find = true
                        break
                    }
                }
                if(find) break
            }
            return result
        },
        get_database: (group:string, filename:string):string | undefined => {
            let find = false
            let result:string | undefined = undefined
            for(let x of memory.templates){
                for(let y of x.database){
                    if(y.group == group && y.filename == filename){
                        result = JSON.stringify(y)
                        find = true
                        break
                    }
                }
                if(find) break
            }
            return result
        },
        get_plugin: async ():Promise<PluginPageData> => {
            return memory
        },
        import_template: async (name:string, url:string, token:string):Promise<PluginPageData> => {
            const root = loader.join(loader.root, 'template')
            const error_children:Array<[string, string]> = []
            const tokens = [undefined, ...token.split(' ')]
            const content_folder = loader.join(root, name)
            const project_folder = loader.join(content_folder, 'project')
            const database_folder = loader.join(content_folder, 'database')
            if (!loader.exists(root)) await loader.mkdir(root)
            let req:RequestInit = {}
            let ob:TemplateData | undefined = undefined
            for(let t of tokens){
                if(t == undefined){
                    req = { method: 'GET', cache: "no-store" }
                }else{
                    req = {
                        method: 'GET',
                        cache: "no-store",
                        headers: {
                            "Authorization": t ? `Bearer ${t}` : ''
                        }
                    }
                }
                try{
                    const res = await fetch(url, req)
                    const tex = await res.text()
                    ob = JSON.parse(tex)
                    break
                }catch (error){
                    console.error(error)
                }
            }
            if(ob == undefined) {
                const p:ToastData = { title: "Import Failed", type: "error", message: `Cannot find the json from url ${url}, or maybe just the wrong token` }
                const h:Header = { name: "makeToast", data: JSON.stringify(p) }
                if (feedback.electron){
                    feedback.electron()?.send("makeToast", JSON.stringify(p))
                }
                if (feedback.socket){
                    feedback.socket(JSON.stringify(h))
                }
                return memory
            } 
            ob.url = url
            loader.write_string(loader.join(root, name + '.json'), JSON.stringify(ob, null, 4))
            if(!loader.exists(content_folder)) loader.mkdir(content_folder)
            if(!loader.exists(project_folder)) loader.mkdir(project_folder)
            if(!loader.exists(database_folder)) loader.mkdir(database_folder)
            const folder = url.substring(0, url.lastIndexOf('/'))
            const project_calls:Array<Promise<Response>> = []
            const database_calls:Array<Promise<Response>> = []

            ob.projects.forEach((p:TemplateData_Project) => {
                project_calls.push(fetch(folder + "/" + p.filename + '.json', req))
            })
            const pss = await Promise.all(project_calls)
            const project_calls2:Array<Promise<string>> = pss.map(x => x.text())
            const pss_result = await Promise.all(project_calls2)
            pss_result.forEach((text, index) => {
                const n = ob.projects[index].filename + '.json'
                try{
                    const project:Project = JSON.parse(text)
                    loader.write_string(loader.join(project_folder, n), JSON.stringify(project, null, 4))
                }catch(error:any){
                    console.log("Parse error:\n", text)
                    error_children.push([`Import Project ${n} Error`, error.message])
                }
            })

            ob.databases.forEach((p:TemplateData_Database) => {
                database_calls.push(fetch(folder + "/" + p.filename + '.json', req))
            })
            const pss2 = await Promise.all(database_calls)
            const database_calls2:Array<Promise<string>> = pss2.map(x => x.text())
            const pss_result2 = await Promise.all(database_calls2)
            pss_result2.forEach((text, index) => {
                const n = ob.databases[index].filename + '.json'
                try{
                    const database:Array<DatabaseContainer> = JSON.parse(text)
                    loader.write_string(loader.join(database_folder, n), JSON.stringify(database, null, 4))
                }catch(error:any){
                    console.log("Parse error:\n", text)
                    error_children.push([`Import Database ${n} Error`, error.message])
                }
            })
            for(let x of error_children){
                const p:ToastData = { title: x[0], type: "error", message: x[1] }
                const h:Header = { name: "makeToast", data: JSON.stringify(p) }
                if (feedback.electron){
                    feedback.electron()?.send("makeToast", JSON.stringify(p))
                }
                if (feedback.socket){
                    feedback.socket(JSON.stringify(h))
                }
                return memory
            }
            const cp = await GetCurrentPlugin(loader)
            memory.templates = cp.templates
            memory.plugins = cp.plugins
            return cp
        },
        import_plugin: async (name:string, url:string, token:string):Promise<PluginPageData> => {
            const root = loader.join(loader.root, 'plugin')
            const tokens = [undefined, ...token.split(' ')]
            if (!loader.exists(root)) await loader.mkdir(root);
            let req:RequestInit = {}
            let ob:PluginList | undefined = undefined
            for(let t of tokens){
                if(t == undefined){
                    req = { method: 'GET', cache: "no-store" }
                }else{
                    req = {
                        method: 'GET',
                        cache: "no-store",
                        headers: {
                            "Authorization": t ? `Bearer ${t}` : ''
                        }
                    }
                }
                let tex = ""
                try{
                    const res = await fetch(url, req)
                    tex = await res.text()
                    ob = JSON.parse(tex)
                    console.log("Fetch plugin json successfully")
                    break
                }catch (error){
                    console.warn(error, tex)
                }
            }
            if(ob == undefined) {
                const p:ToastData = { title: "Import Failed", type: "error", message: `Cannot find the json from url ${url}, or maybe just the wrong token` }
                const h:Header = { name: "makeToast", data: JSON.stringify(p) }
                if (feedback.electron){
                    feedback.electron()?.send("makeToast", JSON.stringify(p))
                }
                if (feedback.socket){
                    feedback.socket(JSON.stringify(h))
                }
                return memory
            }
            ob.url = url
            loader.write_string(loader.join(root, name + '.json'), JSON.stringify(ob, null, 4))
            const cp = await GetCurrentPlugin(loader)
            memory.templates = cp.templates
            memory.plugins = cp.plugins
            return cp
        },
        delete_template: async (name:string):Promise<void> => {
            const root = loader.join(loader.root, 'template')
            if(loader.exists(loader.join(root, name + '.json'))) 
                await loader.rm(loader.join(root, name + '.json'));
            if(loader.exists(loader.join(root, name))) 
                await loader.rm(loader.join(root, name));
        },
        delete_plugin: async (name:string):Promise<void> => {
            const root = loader.join(loader.root, 'plugin')
            if(loader.exists(loader.join(root, name + '.json'))) 
                await loader.rm(loader.join(root, name + '.json'));
        },
        plugin_download: async (uuid:string, plugin:string, tokens:string):Promise<void> => {
            const p:Plugin = JSON.parse(plugin)
            const p2:PluginWithToken = {...p, token: tokens.split(' ') }
            const t = socket(uuid)
            const h:Header = { name: 'plugin_download', data: p2 }
            t?.websocket.send(JSON.stringify(h))
        },
        plugin_remove: async (uuid:string, plugin:string):Promise<void> => {
            const p:Plugin = JSON.parse(plugin)
            const t = socket(uuid)
            const h:Header = { name: 'plugin_remove', data: p }
            t?.websocket.send(JSON.stringify(h))
        },
    }
}