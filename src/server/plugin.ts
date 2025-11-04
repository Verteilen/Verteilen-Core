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
    ToastData, 
    WebsocketPack
} from "../interface";
import { PluginFeedback } from "./server";

/**
 * Get socket from websocket client method
 */
export type SocketGetter = (uuid:string) => WebsocketPack | undefined

/**
 * **Plugin Function Interface**\
 * Use for access the plugin store function
 */
export interface PluginLoader {
    /**
     * Loading all plugins
     */
    load_all: () => Promise<PluginPageData>
    /**
     * Loading plugins from cache
     */
    get_plugins: () => Promise<PluginPageData>
    /**
     * Get project template
     * @param name Plugin name
     * @param group Group search
     * @param filename Template filename
     */
    get_project: (name:string, group:string, filename:string) => string | undefined
    /**
     * Get database template
     * @param name Plugin name
     * @param group Group search
     * @param filename Template filename
     */
    get_database: (name:string, group:string, filename:string) => string | undefined
    /**
     * Import plugin from web
     * @param name Plugin name
     * @param url The URL for plugin manifest
     * @param token Token list, use space to seperate
     */
    import_plugin: (name:string, url:string, token:string) => Promise<PluginPageData>
    /**
     * Delete plugin by name
     * @param name Plugin name
     */
    delete_plugin: (name:string) => Promise<void>
    /**
     * Telling node Download plugin
     * @param uuid Node ID
     * @param plugin Plugin name
     * @param token Token list, use space to seperate
     */
    plugin_download: (uuid:string, plugin:string, tokens:string) => Promise<void>
    /**
     * Telling node Remove plugin
     * @param uuid Node ID
     * @param plugin Plugin name
     */
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
            header.projects = header.projects.map(x => ({
                value: -1,
                group: x.group,
                filename: x.filename,
                title: x.title
            }))
            header.databases = header.databases.map(x => ({
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
        get_plugins: async ():Promise<PluginPageData> => {
            return memory
        },
        get_project: (name:string, group:string, filename:string):string | undefined => {
            const plugin = memory.plugins.find(x => x.title == name)
            if(plugin == undefined) return undefined
            const result = plugin.projects.find(x => x.group == group && x.filename == filename)
            if(result == undefined) return undefined
            return JSON.stringify(result)
        },
        get_database: (name:string, group:string, filename:string):string | undefined => {
            const plugin = memory.plugins.find(x => x.title == name)
            if(plugin == undefined) return undefined
            const result = plugin.databases.find(x => x.group == group && x.filename == filename)
            if(result == undefined) return undefined
            return JSON.stringify(result)
        },
        import_plugin: async (name:string, url:string, token:string):Promise<PluginPageData> => {
            const error_children:Array<[string, string]> = []
            const root = loader.join(loader.root, 'plugin')
            const project_folder = loader.join(root, name, 'project')
            const database_folder = loader.join(root, name, 'database')
            if (!loader.exists(root)) await loader.mkdir(root);
            if (!loader.exists(project_folder)) await loader.mkdir(project_folder)
            if (!loader.exists(database_folder)) await loader.mkdir(database_folder)
            // Trying no token first
            const tokens = [undefined, ...token.split(' ')]
            let req:RequestInit = {}
            let ob:PluginContainer | undefined = undefined
            for(let t of tokens){
                // Do not store cache
                // Even tho, some website have it's own CDN policy, You might still get old data
                // But most of them only sustained couple minutes
                req = t == undefined ? { method: 'GET', cache: "no-store" } :  {
                    method: 'GET',
                    cache: "no-store",
                    headers: {
                        "Authorization": t ? `Bearer ${t}` : ''
                }}
                // Get data
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
                // Query data failed
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
            loader.write_string(loader.join(root, name, 'manifest.json'), JSON.stringify(ob, null, 4))

            const folder = url.substring(0, url.lastIndexOf('/'))
            const project_calls:Array<Promise<Response>> = ob.projects.map(p => fetch(folder + "/" + p.filename + '.json', req))
            const database_calls:Array<Promise<Response>> = ob.databases.map(p => fetch(folder + "/" + p.filename + '.json', req))
            // * Project template query
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
            // * Database template query
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
            memory.plugins = cp.plugins
            return cp
        },
        delete_plugin: async (name:string):Promise<void> => {
            const root = loader.join(loader.root, 'plugin', name)
            if(loader.exists(root)) 
                await loader.rm(root);
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