import { CreateRecordIOLoader, DATA_FOLDER, RecordIOBase, Server } from '../../src/index'
import * as path from 'path'
import * as os from 'os'
import * as fs from "fs";
import * as fsp from "fs/promises";

const CreateIO = ():RecordIOBase => {
    return {
        root: path.join(os.homedir(), DATA_FOLDER),
        join: path.join,
        read_dir: (path:string) => fsp.readdir(path, { withFileTypes: false }),
        read_dir_dir: (path:string) => fsp.readdir(path, { withFileTypes: true }).then(x => x.filter(y => !y.isFile()).map(y => y.name)),
        read_dir_file: (path:string) => fsp.readdir(path, { withFileTypes: true }).then(x => x.filter(y => y.isFile()).map(y => y.name)),
        read_string: (path:string, options?:any) => fsp.readFile(path, options).then(x => x.toString('utf-8')),
        write_string: (path:string, content:string) => fsp.writeFile(path, content),
        exists: (path:string) => fs.existsSync(path),
        mkdir: async (path:string) => { await fsp.mkdir(path, {recursive: true}) },
        rm: (path:string) => fsp.rm(path, {recursive: true}),
        cp: (path:string, newpath:string) => fsp.cp(path, newpath)
    }
}

async function main(){
    const server:Server = new Server()
    server.io = CreateIO()
    server.loader = CreateRecordIOLoader(server.io, server.memory)

    const p = await server.loader.task.load_all()
    console.log(p.map(x => JSON.parse(x)))
}

main()