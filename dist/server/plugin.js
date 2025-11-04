"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePluginLoader = exports.GetCurrentPlugin = void 0;
const GetCurrentPlugin = async (loader) => {
    return new Promise(async (resolve) => {
        const b = {
            plugins: []
        };
        const root = loader.join(loader.root, 'plugin');
        if (!loader.exists(root))
            await loader.mkdir(root);
        const plugin_folder = await loader.read_dir_dir(root);
        const plugin_folder_files = await Promise.all(plugin_folder.map(x => loader.read_dir_file(x)));
        for (let i = 0; i < plugin_folder_files.length; i++) {
            const files = plugin_folder_files[i];
            const dirname = plugin_folder[i];
            if (!files.includes("manifest.json"))
                continue;
            const manifest_path = loader.join(root, dirname, "manifest.json");
            const manifest = await loader.read_string(manifest_path);
            let header = undefined;
            try {
                header = JSON.parse(manifest);
            }
            catch (e) {
                console.warn(`Reading file error: ${manifest_path}`);
                continue;
            }
            if (header == undefined)
                continue;
            header.projects = header.projects.map(x => ({
                value: -1,
                group: x.group,
                filename: x.filename,
                title: x.title
            }));
            header.databases = header.databases.map(x => ({
                value: -1,
                group: x.group,
                filename: x.filename,
                title: x.title
            }));
            b.plugins.push(header);
        }
        resolve(b);
        return b;
    });
};
exports.GetCurrentPlugin = GetCurrentPlugin;
const CreatePluginLoader = (loader, memory, socket, feedback) => {
    return {
        load_all: async () => {
            const cp = await (0, exports.GetCurrentPlugin)(loader);
            memory.plugins = cp.plugins;
            return cp;
        },
        get_plugins: async () => {
            return memory;
        },
        get_project: (name, group, filename) => {
            const plugin = memory.plugins.find(x => x.title == name);
            if (plugin == undefined)
                return undefined;
            const result = plugin.projects.find(x => x.group == group && x.filename == filename);
            if (result == undefined)
                return undefined;
            return JSON.stringify(result);
        },
        get_database: (name, group, filename) => {
            const plugin = memory.plugins.find(x => x.title == name);
            if (plugin == undefined)
                return undefined;
            const result = plugin.databases.find(x => x.group == group && x.filename == filename);
            if (result == undefined)
                return undefined;
            return JSON.stringify(result);
        },
        import_plugin: async (name, url, token) => {
            const error_children = [];
            const root = loader.join(loader.root, 'plugin');
            const project_folder = loader.join(root, name, 'project');
            const database_folder = loader.join(root, name, 'database');
            if (!loader.exists(root))
                await loader.mkdir(root);
            if (!loader.exists(project_folder))
                await loader.mkdir(project_folder);
            if (!loader.exists(database_folder))
                await loader.mkdir(database_folder);
            const tokens = [undefined, ...token.split(' ')];
            let req = {};
            let ob = undefined;
            for (let t of tokens) {
                req = t == undefined ? { method: 'GET', cache: "no-store" } : {
                    method: 'GET',
                    cache: "no-store",
                    headers: {
                        "Authorization": t ? `Bearer ${t}` : ''
                    }
                };
                let tex = "";
                try {
                    const res = await fetch(url, req);
                    tex = await res.text();
                    ob = JSON.parse(tex);
                    console.log("Fetch plugin json successfully");
                    break;
                }
                catch (error) {
                    console.warn(error, tex);
                }
            }
            if (ob == undefined) {
                const p = { title: "Import Failed", type: "error", message: `Cannot find the json from url ${url}, or maybe just the wrong token` };
                const h = { name: "makeToast", data: JSON.stringify(p) };
                if (feedback.electron) {
                    feedback.electron()?.send("makeToast", JSON.stringify(p));
                }
                if (feedback.socket) {
                    feedback.socket(JSON.stringify(h));
                }
                return memory;
            }
            ob.url = url;
            loader.write_string(loader.join(root, name, 'manifest.json'), JSON.stringify(ob, null, 4));
            const folder = url.substring(0, url.lastIndexOf('/'));
            const project_calls = ob.projects.map(p => fetch(folder + "/" + p.filename + '.json', req));
            const database_calls = ob.databases.map(p => fetch(folder + "/" + p.filename + '.json', req));
            const pss = await Promise.all(project_calls);
            const project_calls2 = pss.map(x => x.text());
            const pss_result = await Promise.all(project_calls2);
            pss_result.forEach((text, index) => {
                const n = ob.projects[index].filename + '.json';
                try {
                    const project = JSON.parse(text);
                    loader.write_string(loader.join(project_folder, n), JSON.stringify(project, null, 4));
                }
                catch (error) {
                    console.log("Parse error:\n", text);
                    error_children.push([`Import Project ${n} Error`, error.message]);
                }
            });
            const pss2 = await Promise.all(database_calls);
            const database_calls2 = pss2.map(x => x.text());
            const pss_result2 = await Promise.all(database_calls2);
            pss_result2.forEach((text, index) => {
                const n = ob.databases[index].filename + '.json';
                try {
                    const database = JSON.parse(text);
                    loader.write_string(loader.join(database_folder, n), JSON.stringify(database, null, 4));
                }
                catch (error) {
                    console.log("Parse error:\n", text);
                    error_children.push([`Import Database ${n} Error`, error.message]);
                }
            });
            for (let x of error_children) {
                const p = { title: x[0], type: "error", message: x[1] };
                const h = { name: "makeToast", data: JSON.stringify(p) };
                if (feedback.electron) {
                    feedback.electron()?.send("makeToast", JSON.stringify(p));
                }
                if (feedback.socket) {
                    feedback.socket(JSON.stringify(h));
                }
                return memory;
            }
            const cp = await (0, exports.GetCurrentPlugin)(loader);
            memory.plugins = cp.plugins;
            return cp;
        },
        delete_plugin: async (name) => {
            const root = loader.join(loader.root, 'plugin', name);
            if (loader.exists(root))
                await loader.rm(root);
        },
        plugin_download: async (uuid, plugin, tokens) => {
            const p = JSON.parse(plugin);
            const p2 = { ...p, token: tokens.split(' ') };
            const t = socket(uuid);
            const h = { name: 'plugin_download', data: p2 };
            t?.websocket.send(JSON.stringify(h));
        },
        plugin_remove: async (uuid, plugin) => {
            const p = JSON.parse(plugin);
            const t = socket(uuid);
            const h = { name: 'plugin_remove', data: p };
            t?.websocket.send(JSON.stringify(h));
        },
    };
};
exports.CreatePluginLoader = CreatePluginLoader;
