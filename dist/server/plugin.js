"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePluginLoader = exports.GetCurrentPlugin = void 0;
/**
 * **Get Current Plugin List**
 * @param loader The file io loader
 * @returns Current list in disk storage
 */
const GetCurrentPlugin = (loader) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        const b = {
            plugins: []
        };
        const root = loader.join(loader.root, 'plugin');
        if (!loader.exists(root))
            yield loader.mkdir(root);
        const plugin_folder = yield loader.read_dir_dir(root);
        const plugin_folder_files = yield Promise.all(plugin_folder.map(x => loader.read_dir_file(loader.join(root, x))));
        for (let i = 0; i < plugin_folder_files.length; i++) {
            const files = plugin_folder_files[i];
            const dirname = plugin_folder[i];
            if (!files.includes("manifest.json"))
                continue;
            const manifest_path = loader.join(root, dirname, "manifest.json");
            const manifest = yield loader.read_string(manifest_path);
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
    }));
});
exports.GetCurrentPlugin = GetCurrentPlugin;
const CreatePluginLoader = (loader, memory, socket, feedback) => {
    return {
        load_all: () => __awaiter(void 0, void 0, void 0, function* () {
            const cp = yield (0, exports.GetCurrentPlugin)(loader);
            memory.plugins = cp.plugins;
            return cp;
        }),
        get_plugins: () => __awaiter(void 0, void 0, void 0, function* () {
            return memory;
        }),
        get_project: (name, group, filename) => {
            const path = loader.join(loader.root, "plugin", name, "project", filename);
            return loader.exists(path) ? loader.read_string(path) : undefined;
        },
        get_database: (name, group, filename) => {
            const path = loader.join(loader.root, "plugin", name, "database", filename);
            return loader.exists(path) ? loader.read_string(path) : undefined;
        },
        import_plugin: (name, url, token) => __awaiter(void 0, void 0, void 0, function* () {
            const error_children = [];
            const root = loader.join(loader.root, 'plugin');
            const project_folder = loader.join(root, name, 'project');
            const database_folder = loader.join(root, name, 'database');
            if (!loader.exists(root))
                yield loader.mkdir(root);
            if (!loader.exists(project_folder))
                yield loader.mkdir(project_folder);
            if (!loader.exists(database_folder))
                yield loader.mkdir(database_folder);
            // Trying no token first
            const tokens = [undefined, ...token.split(' ')];
            let req = {};
            let ob = undefined;
            for (let t of tokens) {
                // Do not store cache
                // Even tho, some website have it's own CDN policy, You might still get old data
                // But most of them only sustained couple minutes
                req = t == undefined ? { method: 'GET', cache: "no-store" } : {
                    method: 'GET',
                    cache: "no-store",
                    headers: {
                        "Authorization": t ? `Bearer ${t}` : ''
                    }
                };
                // Get data
                let tex = "";
                try {
                    const res = yield fetch(url, req);
                    tex = yield res.text();
                    ob = JSON.parse(tex);
                    console.log("Fetch plugin json successfully");
                    break;
                }
                catch (error) {
                    console.warn(error, tex);
                }
            }
            if (ob == undefined) {
                // Query data failed
                const p = { title: "Import Failed", type: "error", message: `Cannot find the json from url ${url}, or maybe just the wrong token` };
                const h = { name: "makeToast", data: JSON.stringify(p) };
                if (feedback.socket) {
                    feedback.socket(JSON.stringify(h));
                }
                return memory;
            }
            ob.url = url;
            loader.write_string(loader.join(root, name, 'manifest.json'), JSON.stringify(ob, null, 4));
            const folder = url.substring(0, url.lastIndexOf('/'));
            const project_calls = ob.projects.map(p => fetch(folder + "/project/" + p.filename + '.json', req));
            const database_calls = ob.databases.map(p => fetch(folder + "/database/" + p.filename + '.json', req));
            // * Project template query
            const pss = yield Promise.all(project_calls);
            const project_calls2 = pss.map(x => x.text());
            const pss_result = yield Promise.all(project_calls2);
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
            // * Database template query
            const pss2 = yield Promise.all(database_calls);
            const database_calls2 = pss2.map(x => x.text());
            const pss_result2 = yield Promise.all(database_calls2);
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
                if (feedback.socket) {
                    feedback.socket(JSON.stringify(h));
                }
                return memory;
            }
            const cp = yield (0, exports.GetCurrentPlugin)(loader);
            memory.plugins = cp.plugins;
            return cp;
        }),
        delete_plugin: (name) => __awaiter(void 0, void 0, void 0, function* () {
            const index = memory.plugins.findIndex(x => x.title == name);
            if (index != -1)
                memory.plugins.splice(index, 1);
            const root = loader.join(loader.root, 'plugin', name);
            if (loader.exists(root))
                yield loader.rm(root);
            const cp = yield (0, exports.GetCurrentPlugin)(loader);
            memory.plugins = cp.plugins;
            return cp;
        }),
        plugin_download: (uuid, plugin, tokens) => __awaiter(void 0, void 0, void 0, function* () {
            const p = JSON.parse(plugin);
            const p2 = Object.assign(Object.assign({}, p), { token: tokens.split(' ') });
            const t = socket(uuid);
            const h = { name: 'plugin_download', data: p2 };
            t === null || t === void 0 ? void 0 : t.socket.send(JSON.stringify(h));
        }),
        plugin_remove: (uuid, plugin) => __awaiter(void 0, void 0, void 0, function* () {
            const p = JSON.parse(plugin);
            const t = socket(uuid);
            const h = { name: 'plugin_remove', data: p };
            t === null || t === void 0 ? void 0 : t.socket.send(JSON.stringify(h));
        }),
    };
};
exports.CreatePluginLoader = CreatePluginLoader;
//# sourceMappingURL=plugin.js.map