"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RUN = RUN;
const interface_1 = require("../interface");
const http_1 = require("./http");
const job_execute_1 = require("./job_execute");
const resource_1 = require("./resource");
let worker = undefined;
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
    if (chunk.toString().startsWith("kill")) {
        if (worker != undefined) {
            worker.stop_all();
        }
        setTimeout(process.exit(1), 1000);
    }
});
const messager = (msg, tag) => {
    const d = {
        name: 'messager',
        meta: tag,
        data: msg
    };
    console.log(JSON.stringify(d));
};
const messager_log = (msg, tag, meta) => {
    const d = {
        name: 'messager_log',
        meta: meta,
        data: `[${tag}] ${msg}`
    };
    console.log(JSON.stringify(d));
};
const ERROR = (err) => {
    const d = {
        name: "error",
        meta: "Execute job failed",
        data: `(${err.code ?? 'unknown'}) ${err.message}`,
    };
    console.log(JSON.stringify(d));
    process.exit(1);
};
const execute_job = () => {
    if (process.env.job == undefined || process.env.plugin == undefined) {
        process.exit(1);
    }
    const d = JSON.parse(process.env.job);
    const p = JSON.parse(process.env.plugin);
    worker = new job_execute_1.ClientJobExecute(messager, messager_log, d, undefined, p);
    worker.execute().then(x => {
        messager_log(x);
        process.exit(0);
    })
        .catch(err => ERROR(err));
};
const execute_resource = () => {
    const r = new resource_1.ClientResource();
    messager("Resource query");
    const cache = process.env.cache == undefined ? undefined : JSON.parse(process.env.cache);
    const type = cache == undefined ? interface_1.ResourceType.ALL : interface_1.ResourceType.BATTERY | interface_1.ResourceType.LOAD | interface_1.ResourceType.NETWORK | interface_1.ResourceType.RAM;
    r.Query(cache, type).then(x => {
        const h = {
            name: 'resource',
            data: x
        };
        console.log(JSON.stringify(h));
    }).catch(err => ERROR(err));
};
const execute_http = () => {
    const m = process.env.method || 'GET';
    const u = process.env.url || '';
    const p = process.env.params;
    const r = new http_1.ClientHTTP(u, m, p);
    r.RUN();
};
function RUN() {
    switch (process.env.type) {
        case 'JOB':
            execute_job();
            break;
        case 'RESOURCE':
            execute_resource();
            break;
        case 'HTTP':
            execute_http();
            break;
        default:
            process.exit(1);
    }
}
