import * as path from "path"
import * as os from "os"
import * as fsp from "fs/promises"
import * as fs from "fs"
import { GetCurrentPlugin } from "../../src/server/plugin"
import { DATA_FOLDER } from "../../src/interface"
import { RecordIOBase } from "../../src/server/io"

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

describe("Get plugin test", () => {
    test("Query plugin", async () => {
        const plugin = await GetCurrentPlugin(CreateIO())
        const p = await fsp.readdir(path.join(os.homedir(), DATA_FOLDER, "plugin"), { withFileTypes: true })
        const p2 = p.filter(x => !x.isFile()).map(x => x.name)
        expect(plugin.plugins.length).toBe(p2.length)
    })
})