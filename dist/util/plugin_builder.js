"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginBuild = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const interface_1 = require("../interface");
const PluginBuild = (root, plugins, templates) => {
    console.log("Activate Plugin Build Process...");
    const root_p = path.join(root, 'project');
    const root_d = path.join(root, 'database');
    const m_path = path.join(root, 'manifest.json');
    console.log("Root: ", root);
    if (!fs.existsSync(root))
        fs.mkdirSync(root, { recursive: true });
    if (!fs.existsSync(root_p))
        fs.mkdirSync(root_p, { recursive: true });
    if (!fs.existsSync(root_d))
        fs.mkdirSync(root_d, { recursive: true });
    let manifest = {
        thumbnail: "",
        icon: "",
        owner: "",
        title: "",
        plugins: [],
        projects: [],
        databases: []
    };
    if (fs.existsSync(m_path)) {
        console.log("Detected manifest.json");
        manifest = JSON.parse(fs.readFileSync(m_path).toString());
    }
    manifest.plugins = plugins.plugins;
    manifest.projects = templates.projects.map(x => ({
        title: x.title,
        filename: x.filename,
        group: x.group,
        value: x.value,
    }));
    manifest.databases = templates.databases.map(x => ({
        title: x.title,
        filename: x.filename,
        group: x.group,
        value: x.value,
    }));
    delete manifest.acl;
    delete manifest.permission;
    console.log("Output manifest.json");
    fs.writeFileSync(m_path, JSON.stringify(manifest, null, 4));
    console.log("Output project templates");
    templates.projects.forEach(item => {
        const result = item.template((0, interface_1.CreateDefaultProject)());
        fs.writeFileSync(path.join(root_p, `${item.filename}.json`), JSON.stringify(result, null, 4), 'utf-8');
    });
    console.log("Output database templates");
    templates.databases.forEach(item => {
        const result = item.template();
        fs.writeFileSync(path.join(root_d, `${item.filename}.json`), JSON.stringify(result, null, 4), 'utf-8');
    });
};
exports.PluginBuild = PluginBuild;
