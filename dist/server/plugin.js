"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePluginLoader = exports.GetCurrentPlugin = void 0;
const GetCurrentPlugin = async (loader) => {
    return new Promise(async (resolve) => {
        const b = {
            plugins: [],
            templates: []
        };
        const root = loader.join(loader.root, 'template');
        const root2 = loader.join(loader.root, 'plugin');
        if (!loader.exists(root))
            await loader.mkdir(root);
        if (!loader.exists(root2))
            await loader.mkdir(root2);
        const files = (await loader.read_dir_file(root)).filter(x => x.endsWith('.json'));
        const _configs = files.map(file => loader.read_string(loader.join(root, file), { encoding: 'utf-8' }));
        const configs = (await Promise.all(_configs)).map(x => JSON.parse(x));
        for (let index = 0; index < configs.length; index++) {
            const config = configs[index];
            const ps = config.projects.map(x => ({
                value: -1,
                group: x.group,
                filename: x.filename,
                title: x.title
            }));
            const ps2 = config.databases.map(x => ({
                value: -1,
                group: x.group,
                filename: x.filename,
                title: x.title
            }));
            b.templates.push({
                name: files[index].replace('.json', ''),
                project: ps,
                database: ps2,
                url: config.url
            });
        }
        const files2 = (await loader.read_dir_dir(root2)).filter(x => x.endsWith('.json'));
        const p_config2 = files2.map(file => {
            return loader.read_string(loader.join(root2, file), { encoding: 'utf-8' });
        });
        const configs2 = (await Promise.all(p_config2)).map(x => JSON.parse(x));
        for (let index = 0; index < configs2.length; index++) {
            const config = configs2[index];
            config.title = files2[index].replace('.json', '');
            b.plugins.push(config);
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
            memory.templates = cp.templates;
            memory.plugins = cp.plugins;
            return cp;
        },
        get_project: (group, filename) => {
            let find = false;
            let result = undefined;
            for (let x of memory.templates) {
                for (let y of x.project) {
                    if (y.group == group && y.filename == filename) {
                        result = JSON.stringify(y);
                        find = true;
                        break;
                    }
                }
                if (find)
                    break;
            }
            return result;
        },
        get_database: (group, filename) => {
            let find = false;
            let result = undefined;
            for (let x of memory.templates) {
                for (let y of x.database) {
                    if (y.group == group && y.filename == filename) {
                        result = JSON.stringify(y);
                        find = true;
                        break;
                    }
                }
                if (find)
                    break;
            }
            return result;
        },
        get_plugin: async () => {
            return memory;
        },
        import_template: async (name, url, token) => {
            const root = loader.join(loader.root, 'template');
            const error_children = [];
            const tokens = [undefined, ...token.split(' ')];
            const content_folder = loader.join(root, name);
            const project_folder = loader.join(content_folder, 'project');
            const database_folder = loader.join(content_folder, 'database');
            if (!loader.exists(root))
                await loader.mkdir(root);
            let req = {};
            let ob = undefined;
            for (let t of tokens) {
                if (t == undefined) {
                    req = { method: 'GET', cache: "no-store" };
                }
                else {
                    req = {
                        method: 'GET',
                        cache: "no-store",
                        headers: {
                            "Authorization": t ? `Bearer ${t}` : ''
                        }
                    };
                }
                try {
                    const res = await fetch(url, req);
                    const tex = await res.text();
                    ob = JSON.parse(tex);
                    break;
                }
                catch (error) {
                    console.error(error);
                }
            }
            if (ob == undefined) {
                const p = { title: "Import Failed", type: "error", message: `Cannot find the json from url ${url}, or maybe just the wrong token` };
                const h = { name: "makeToast", data: JSON.stringify(p) };
                if (feedback.electron) {
                    feedback.electron("makeToast", JSON.stringify(p));
                }
                if (feedback.socket) {
                    feedback.socket(JSON.stringify(h));
                }
                return memory;
            }
            ob.url = url;
            loader.write_string(loader.join(root, name + '.json'), JSON.stringify(ob, null, 4));
            if (!loader.exists(content_folder))
                loader.mkdir(content_folder);
            if (!loader.exists(project_folder))
                loader.mkdir(project_folder);
            if (!loader.exists(database_folder))
                loader.mkdir(database_folder);
            const folder = url.substring(0, url.lastIndexOf('/'));
            const project_calls = [];
            const database_calls = [];
            ob.projects.forEach((p) => {
                project_calls.push(fetch(folder + "/" + p.filename + '.json', req));
            });
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
            ob.databases.forEach((p) => {
                database_calls.push(fetch(folder + "/" + p.filename + '.json', req));
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
                    feedback.electron("makeToast", JSON.stringify(p));
                }
                if (feedback.socket) {
                    feedback.socket(JSON.stringify(h));
                }
                return memory;
            }
            const cp = await (0, exports.GetCurrentPlugin)(loader);
            memory.templates = cp.templates;
            memory.plugins = cp.plugins;
            return cp;
        },
        import_plugin: async (name, url, token) => {
            const root = loader.join(loader.root, 'plugin');
            const tokens = [undefined, ...token.split(' ')];
            if (!loader.exists(root))
                await loader.mkdir(root);
            let req = {};
            let ob = undefined;
            for (let t of tokens) {
                if (t == undefined) {
                    req = { method: 'GET', cache: "no-store" };
                }
                else {
                    req = {
                        method: 'GET',
                        cache: "no-store",
                        headers: {
                            "Authorization": t ? `Bearer ${t}` : ''
                        }
                    };
                }
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
                    feedback.electron("makeToast", JSON.stringify(p));
                }
                if (feedback.socket) {
                    feedback.socket(JSON.stringify(h));
                }
                return memory;
            }
            ob.url = url;
            loader.write_string(loader.join(root, name + '.json'), JSON.stringify(ob, null, 4));
            const cp = await (0, exports.GetCurrentPlugin)(loader);
            memory.templates = cp.templates;
            memory.plugins = cp.plugins;
            return cp;
        },
        delete_template: async (name) => {
            const root = loader.join(loader.root, 'template');
            if (loader.exists(loader.join(root, name + '.json')))
                await loader.rm(loader.join(root, name + '.json'));
            if (loader.exists(loader.join(root, name)))
                await loader.rm(loader.join(root, name));
        },
        delete_plugin: async (name) => {
            const root = loader.join(loader.root, 'plugin');
            if (loader.exists(loader.join(root, name + '.json')))
                await loader.rm(loader.join(root, name + '.json'));
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
