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
exports.ClientResource = void 0;
const systeminformation_1 = __importDefault(require("systeminformation"));
const interface_1 = require("../interface");
class ClientResource {
    constructor() {
        this.is_query = false;
        this.Query = (...args_1) => __awaiter(this, [...args_1], void 0, function* (src = undefined, type = interface_1.ResourceType.ALL) {
            this.is_query = true;
            const result = src != undefined ? src : this.create_new();
            const _system = (type & interface_1.ResourceType.SYSTEM) == interface_1.ResourceType.SYSTEM ? systeminformation_1.default.system() : undefined;
            const _cpu = systeminformation_1.default.cpu();
            const _ram = systeminformation_1.default.mem();
            const _battery = systeminformation_1.default.battery();
            const _load = systeminformation_1.default.currentLoad();
            const _os = systeminformation_1.default.osInfo();
            const _gpu = systeminformation_1.default.graphics();
            const _disk = systeminformation_1.default.fsSize();
            const _net = systeminformation_1.default.networkStats();
            this.is_query = false;
            return yield Promise.all([_system, _cpu, _ram, _battery, _load, _os, _gpu, _disk, _net]).then(x => {
                const system = x[0];
                const cpu = x[1];
                const ram = x[2];
                const battery = x[3];
                const load = x[4];
                const os = x[5];
                const gpu = x[6];
                const disk = x[7];
                const net = x[8];
                if (system != undefined) {
                    result.system_name = `${system.manufacturer} ${system.model}`;
                    result.virtual = system.virtual;
                }
                if (os != undefined) {
                    result.platform = process.platform;
                    result.arch = process.arch;
                    result.hostname = os.hostname;
                }
                if (cpu != undefined) {
                    result.cpu_name = `${cpu.manufacturer} ${cpu.brand} ${cpu.speed}`;
                    result.cpu_core = cpu.cores;
                }
                if (load != undefined) {
                    result.cpu_usage = load.currentLoadGuest + load.currentLoadIrq + load.currentLoadSystem + load.currentLoad + load.currentLoadSteal + load.currentLoadNice;
                }
                if (ram != undefined) {
                    result.ram_usage = ram.used;
                    result.ram_free = ram.free;
                    result.ram_total = ram.total;
                }
                if (battery != undefined) {
                    result.battery = battery.hasBattery ? battery.percent : 1;
                    result.charging = battery.isCharging;
                }
                if (gpu != undefined) {
                    result.gpu = gpu.controllers.map(x => ({
                        gpu_name: `${x.vendor} ${x.model}`
                    }));
                }
                if (disk != undefined) {
                    result.disk = disk.map(x => ({
                        disk_name: x.fs,
                        disk_type: x.type,
                        disk_free: x.available,
                        disk_total: x.size,
                        disk_usage: x.used,
                        disk_percentage: x.use,
                    }));
                }
                if (net != undefined) {
                    result.net = net.map(x => ({
                        net_name: x.iface,
                        download: x.rx_sec,
                        upload: x.tx_sec
                    }));
                }
                result.pid_usage = process.pid;
                return result;
            });
        });
        this.create_new = () => {
            return {
                system_name: '',
                virtual: false,
                platform: '',
                arch: '',
                hostname: '',
                cpu_name: '',
                cpu_core: 0,
                cpu_usage: 0,
                ram_usage: 0,
                ram_free: 0,
                ram_total: 0,
                battery: 0,
                charging: false,
                gpu: [],
                disk: [],
                net: [],
                pid_usage: 0
            };
        };
    }
}
exports.ClientResource = ClientResource;
