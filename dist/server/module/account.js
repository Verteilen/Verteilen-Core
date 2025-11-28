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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account_Module = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
//
//  ? This script handle the account port of the server module
//  ? Such as login process
//
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const interface_1 = require("../../interface");
class Account_Module {
    constructor(loader, memory) {
        /**
         * If login failed, it will throw error
         * @param username Login Username Field
         * @param password Login Password Field
         * @returns Token string
         */
        this.login = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.loader.user.load_all();
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
        });
        this.loader = loader;
        this.memory = memory;
    }
}
exports.Account_Module = Account_Module;
//# sourceMappingURL=account.js.map