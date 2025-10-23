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
const pem = __importStar(require("pem"));
const https = __importStar(require("https"));
const ws = __importStar(require("ws"));
let h = undefined;
let w = undefined;
function get_pem() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            pem.createCertificate({ days: 1, selfSigned: true }, (err, keys) => {
                resolve([keys.clientKey, keys.certificate]);
            });
        });
    });
}
function start_server() {
    return __awaiter(this, void 0, void 0, function* () {
        const pems = yield get_pem();
        h = https.createServer({ key: pems[0], cert: pems[1], minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3' }, (req, res) => {
            res.writeHead(200);
            res.end('HTTPS server is running');
        });
        h.addListener('upgrade', (req, res, head) => console.log('UPGRADE:', req.url));
        w = new ws.Server({ server: h });
        w.on('listening', (socket) => {
            console.log("Listen Event");
        });
        w.on('error', (err) => {
            console.log("Error Event");
        });
        w.on('connection', (socket) => {
            socket.on('message', (data) => {
                console.log("Recevied Data: ", data.toString());
            });
        });
        h.listen(10000, () => {
            console.log("Listen to 10000");
        });
    });
}
function start_client() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            const cli = new ws.WebSocket("wss://127.0.0.1:10000", { agent: new https.Agent(), rejectUnauthorized: false });
            cli.on('error', (err) => {
                console.log("Socket Error: ", err);
            });
            setTimeout(() => {
                cli.send("Hello World");
                cli.close();
                resolve(undefined);
            }, 1000);
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield start_server();
        yield start_client();
    });
}
main();
