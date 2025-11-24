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
exports.PortAvailable = void 0;
const tcp_port_used_1 = __importDefault(require("tcp-port-used"));
const PortAvailable = (start) => __awaiter(void 0, void 0, void 0, function* () {
    let port_result = start;
    let canbeuse = false;
    while (!canbeuse) {
        yield tcp_port_used_1.default.check(port_result).then(x => {
            canbeuse = !x;
        }).catch(err => {
            canbeuse = true;
        });
        if (!canbeuse)
            port_result += 1;
    }
    return port_result;
});
exports.PortAvailable = PortAvailable;
//# sourceMappingURL=port.js.map