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
exports.Client = void 0;
const path = __importStar(require("path"));
const tcp_port_used_1 = require("tcp-port-used");
const ws = __importStar(require("ws"));
const interface_1 = require("../interface");
const analysis_1 = require("./analysis");
const fs_1 = require("fs");
const os = __importStar(require("os"));
const pem = __importStar(require("pem"));
const https = __importStar(require("https"));
class Client {
    plugins = { plugins: [] };
    httpss = undefined;
    client = undefined;
    sources = [];
    messager;
    messager_log;
    analysis;
    updatehandle;
    get count() {
        return this.sources.length;
    }
    get clients() {
        return this.sources;
    }
    constructor(_messager, _messager_log) {
        this.messager = _messager;
        this.messager_log = _messager_log;
        this.analysis = [];
        this.updatehandle = setInterval(this.update, interface_1.CLIENT_UPDATETICK);
        this.loadPlugins();
    }
    Dispose() {
        clearInterval(this.updatehandle);
    }
    Init = async () => {
        let port_result = interface_1.PORT;
        let canbeuse = false;
        while (!canbeuse) {
            await (0, tcp_port_used_1.check)(port_result).then(x => {
                canbeuse = !x;
            }).catch(err => {
                canbeuse = true;
            });
            if (!canbeuse)
                port_result += 1;
        }
        const pems = await this.get_pem();
        this.httpss = https.createServer({ key: pems[0], cert: pems[1], minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3' }, (req, res) => {
            res.writeHead(200);
            res.end('HTTPS server is running');
        });
        this.httpss.addListener('upgrade', (req, res, head) => console.log('UPGRADE:', req.url));
        this.client = new ws.Server({ server: this.httpss });
        this.client.on('listening', () => {
            this.messager_log('[Server] Listen PORT: ' + port_result.toString());
        });
        this.client.on('error', (err) => {
            this.messager_log(`[Server] Error ${err.name}\n\t${err.message}\n\t${err.stack}`);
        });
        this.client.on('close', () => {
            this.messager_log('[Server] Close !');
            this.Release();
        });
        this.client.on('connection', (ws, request) => {
            const a = new analysis_1.ClientAnalysis(this.messager, this.messager_log, this);
            this.analysis.push(a);
            this.sources.push(ws);
            this.messager_log(`[Server] New Connection detected, ${ws.url}`);
            ws.on('close', (code, reason) => {
                const index = this.sources.findIndex(x => x == ws);
                if (index != -1)
                    this.sources.splice(index, 1);
                this.messager_log(`[Source] Close ${code} ${reason}`);
                a.disconnect(ws);
            });
            ws.on('error', (err) => {
                this.messager_log(`[Source] Error ${err.name}\n\t${err.message}\n\t${err.stack}`);
            });
            ws.on('open', () => {
                this.messager_log(`[Source] New source is connected, URL: ${ws?.url}`);
            });
            ws.on('message', (data, isBinery) => {
                const h = JSON.parse(data.toString());
                a.analysis(h, ws);
            });
        });
        this.httpss.listen(port_result, () => {
            this.messager_log('[Server] Select Port: ' + port_result.toString());
        });
    };
    Destroy = () => {
        if (this.client == undefined)
            return;
        this.client.close((err) => {
            this.messager_log(`[Client] Close error ${err}`);
        });
        this.Release();
    };
    Release = () => {
        this.analysis.forEach(x => x.stop_all());
        this.analysis.forEach(x => x.destroy());
        this.analysis = [];
    };
    savePlugin = () => {
        const f = path.join(os.homedir(), interface_1.DATA_FOLDER);
        const pluginPath = path.join(f, 'plugin.json');
        if (!(0, fs_1.existsSync)(f))
            (0, fs_1.mkdirSync)(f, { recursive: true });
        (0, fs_1.writeFileSync)(pluginPath, JSON.stringify(this.plugins, null, 4));
    };
    update = () => {
        this.analysis.forEach(x => x.update(this));
    };
    loadPlugins = () => {
        const f = path.join(os.homedir(), interface_1.DATA_FOLDER);
        const pluginPath = path.join(f, 'plugin.json');
        if (!(0, fs_1.existsSync)(f))
            (0, fs_1.mkdirSync)(f, { recursive: true });
        if (!(0, fs_1.existsSync)(pluginPath)) {
            (0, fs_1.writeFileSync)(pluginPath, JSON.stringify(this.plugins, null, 4));
        }
        else {
            this.plugins = JSON.parse((0, fs_1.readFileSync)(pluginPath).toString());
        }
    };
    get_pem = () => {
        return new Promise((resolve) => {
            const pemFolder = path.join(os.homedir(), interface_1.DATA_FOLDER, 'pem');
            if (!(0, fs_1.existsSync)(pemFolder))
                (0, fs_1.mkdirSync)(pemFolder);
            const clientKey = path.join(pemFolder, "client_clientkey.pem");
            const certificate = path.join(pemFolder, "client_certificate.pem");
            if (!(0, fs_1.existsSync)(clientKey) || !(0, fs_1.existsSync)(certificate)) {
                pem.createCertificate({ selfSigned: true }, (err, keys) => {
                    (0, fs_1.writeFileSync)(clientKey, keys.clientKey, { encoding: 'utf8' });
                    (0, fs_1.writeFileSync)(certificate, keys.certificate, { encoding: 'utf8' });
                    resolve([keys.clientKey, keys.certificate]);
                });
            }
            else {
                resolve([(0, fs_1.readFileSync)(clientKey, 'utf8').toString(), (0, fs_1.readFileSync)(certificate, 'utf8').toString()]);
            }
        });
    };
    static workerPath = (filename = "worker", extension = ".exe") => {
        const isExe = process.pkg?.entrypoint != undefined;
        const exe = process.platform == 'win32' ? filename + extension : filename;
        let workerExe = "";
        let p = 0;
        if (isExe && path.basename(process.execPath) == (process.platform ? "app.exe" : 'app')) {
            workerExe = path.join(process.execPath, "..", "bin", exe);
            p = 1;
        }
        else if ((process.mainModule && process.mainModule.filename.indexOf('app.asar') !== -1) ||
            process.argv.filter(a => a.indexOf('app.asar') !== -1).length > 0) {
            workerExe = path.join("bin", exe);
            p = 2;
        }
        else if (process.env.NODE_ENV === 'development') {
            workerExe = path.join(process.cwd(), "bin", exe);
            p = 3;
        }
        else {
            workerExe = Client.isTypescript() ? path.join(__dirname, "bin", exe) : path.join(__dirname, "..", "bin", exe);
            p = 4;
        }
        return workerExe;
    };
    static isTypescript = () => {
        const extension = path.extname(__filename);
        if (extension === ".ts") {
            return true;
        }
        const lastArg = process.execArgv[process.execArgv.length - 1];
        if (lastArg && path.parse(lastArg).name.indexOf("ts-node") > 0) {
            return true;
        }
        try {
            return process[Symbol.for("ts-node.register.instance")] ||
                (process.env.NODE_ENV === "test" &&
                    process.env.ACTIONHERO_TEST_FILE_EXTENSION !== "js")
                ? true
                : false;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    };
}
exports.Client = Client;
