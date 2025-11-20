import * as fs from 'fs'
import * as path from 'path'
import { CreateDefaultProject, DatabaseContainer, PluginBase, PluginContainer, PluginGenData, PluginNode, Project } from '../interface'

export const PluginBuild = (root:string, plugins:PluginNode, templates:PluginGenData, data:PluginBase) => {
    console.log("Activate Plugin Build Process...")
    const root_p = path.join(root, 'project')
    const root_d = path.join(root, 'database')
    const m_path = path.join(root, 'manifest.json')
    console.log("Root: ", root)
    if(!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true })
    if(!fs.existsSync(root_p)) fs.mkdirSync(root_p, { recursive: true })
    if(!fs.existsSync(root_d)) fs.mkdirSync(root_d, { recursive: true })

    let manifest:PluginContainer = {
        ...data,
        plugins: [],
        projects: [],
        databases: []
    }

    if(fs.existsSync(m_path)){
        console.log("Detected manifest.json")
        manifest = JSON.parse(fs.readFileSync(m_path).toString())
    }
    
    manifest.plugins = plugins.plugins
    manifest.projects = templates.projects.map(x => ({
        title: x.title,
        filename: x.filename,
        group: x.group,
        value: x.value,
    }))
    manifest.databases = templates.databases.map(x => ({
        title: x.title,
        filename: x.filename,
        group: x.group,
        value: x.value,
    }))

    delete manifest.acl
    delete manifest.permission
    console.log("Output manifest.json")
    if(fs.existsSync(m_path)) fs.unlinkSync(m_path)
    fs.writeFileSync(m_path, JSON.stringify(manifest, null, 4))

    console.log("Output project templates")
    templates.projects.forEach(item => {
        const result:Project = item.template(CreateDefaultProject())
        const n_patn = path.join(root_p, `${item.filename}.json`)
        if(fs.existsSync(n_patn)) fs.unlinkSync(n_patn)
        fs.writeFileSync(
            n_patn, 
            JSON.stringify(result, null, 4), 'utf-8')
    })

    console.log("Output database templates")
    templates.databases.forEach(item => {
        const result:Array<DatabaseContainer> = item.template()
        const n_patn = path.join(root_d, `${item.filename}.json`)
        if(fs.existsSync(n_patn)) fs.unlinkSync(n_patn)
        fs.writeFileSync(
            n_patn, 
            JSON.stringify(result, null, 4), 'utf-8')
    })
    console.log("Finish build")
}