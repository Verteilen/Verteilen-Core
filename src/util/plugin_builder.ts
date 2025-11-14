import * as fs from 'fs'
import * as path from 'path'
import { CreateDefaultProject, DatabaseContainer, PluginContainer, PluginGenData, PluginNode, Project } from '../interface'

export const PluginBuild = (root:string, plugins:PluginNode, templates:PluginGenData) => {
    console.log("Activate Plugin Build Process...")
    const root_p = path.join(root, 'project')
    const root_d = path.join(root, 'database')
    const m_path = path.join(root, 'manifest.json')
    console.log("Root: ", root)
    if(!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true })
    if(!fs.existsSync(root_p)) fs.mkdirSync(root_p, { recursive: true })
    if(!fs.existsSync(root_d)) fs.mkdirSync(root_d, { recursive: true })

    let manifest:PluginContainer = {
        thumbnail: "",
        icon: "",
        owner: "",
        title: "",
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
    fs.writeFileSync(m_path, JSON.stringify(manifest, null, 4))

    console.log("Output project templates")
    templates.projects.forEach(item => {
        const result:Project = item.template(CreateDefaultProject())
        fs.writeFileSync(
            path.join(root_p, `${item.filename}.json`), 
            JSON.stringify(result, null, 4), 'utf-8')
    })

    console.log("Output database templates")
    templates.databases.forEach(item => {
        const result:Array<DatabaseContainer> = item.template()
        fs.writeFileSync(
            path.join(root_d, `${item.filename}.json`), 
            JSON.stringify(result, null, 4), 'utf-8')
    })
}