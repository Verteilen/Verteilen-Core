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
exports.WebhookServerManager = void 0;
const path = __importStar(require("path"));
const ws = __importStar(require("ws"));
const pem = __importStar(require("pem"));
const https = __importStar(require("https"));
const os = __importStar(require("os"));
const interface_1 = require("../interface");
const tcp_port_used_1 = require("tcp-port-used");
const fs_1 = require("fs");
class WebhookServerManager {
    constructor(_messager, _messager_log) {
        this.httpss = undefined;
        this.server = undefined;
        this.sources = [];
        this.Init = () => __awaiter(this, void 0, void 0, function* () {
            let port_result = interface_1.WebHookPORT;
            let canbeuse = false;
            while (!canbeuse) {
                yield (0, tcp_port_used_1.check)(port_result).then(x => {
                    canbeuse = !x;
                }).catch(err => {
                    canbeuse = true;
                });
                if (!canbeuse)
                    port_result += 1;
            }
            const pems = yield this.get_pem();
            this.httpss = https.createServer({ key: pems[0], cert: pems[1], minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3' }, (req, res) => {
                res.writeHead(200);
                res.end('HTTPS server is running');
            });
            this.httpss.addListener('upgrade', (req, res, head) => console.log('UPGRADE:', req.url));
            this.server = new ws.Server({ server: this.httpss });
            this.server.on('listening', () => {
                this.messager_log('[Server] Listen PORT: ' + port_result.toString());
            });
            this.server.on('error', (err) => {
                this.messager_log(`[Server] Error ${err.name}\n\t${err.message}\n\t${err.stack}`);
            });
            this.server.on('close', () => {
                this.messager_log('[Server] Close !');
                this.Release();
            });
            this.server.on('connection', (ws, request) => {
                this.messager_log(`[Server] New Connection detected, ${ws.url}`);
                ws.on('close', (code, reason) => {
                    this.messager_log(`[Source] Close ${code} ${reason}`);
                });
                ws.on('error', (err) => {
                    this.messager_log(`[Source] Error ${err.name}\n\t${err.message}\n\t${err.stack}`);
                });
                ws.on('open', () => {
                    this.messager_log(`[Source] New source is connected, URL: ${ws === null || ws === void 0 ? void 0 : ws.url}`);
                });
                ws.on('message', (data, isBinery) => {
                    const h = JSON.parse(data.toString());
                });
            });
            this.httpss.listen(port_result, () => {
                this.messager_log('[Server] Select Port: ' + port_result.toString());
            });
        });
        this.Destroy = () => {
            if (this.server == undefined)
                return;
            this.server.close((err) => {
                this.messager_log(`[Client] Close error ${err}`);
            });
            this.Release();
        };
        this.Release = () => {
        };
        this.get_pem = () => {
            return new Promise((resolve) => {
                const pemFolder = path.join(os.homedir(), interface_1.DATA_FOLDER, 'pem');
                if (!(0, fs_1.existsSync)(pemFolder))
                    (0, fs_1.mkdirSync)(pemFolder);
                const clientKey = path.join(pemFolder, "cluster_clientkey.pem");
                const certificate = path.join(pemFolder, "cluster_certificate.pem");
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
        this.messager = _messager;
        this.messager_log = _messager_log;
    }
}
exports.WebhookServerManager = WebhookServerManager;
