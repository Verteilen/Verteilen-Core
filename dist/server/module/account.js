"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account_Module = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const interface_1 = require("../../interface");
class Account_Module {
    loader;
    memory;
    constructor(loader, memory) {
        this.loader = loader;
        this.memory = memory;
    }
    login = async (username, password) => {
        const data = await this.loader.user.load_all(false);
        const users = data.map(x => JSON.parse(x));
        const target = users.find(x => x.name == username && x.password == password);
        if (target != undefined) {
            const payload = {
                user: target.uuid,
                create: Date.now()
            };
            const token = jsonwebtoken_1.default.sign(JSON.stringify(payload), interface_1.SERECT, { algorithm: 'RS256', expiresIn: '7d' });
            return token;
        }
        throw new Error("login.failed");
    };
}
exports.Account_Module = Account_Module;
