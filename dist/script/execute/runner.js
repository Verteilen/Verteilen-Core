"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteManager_Runner = void 0;
const interface_1 = require("../../interface");
const feedback_1 = require("./feedback");
const util_parser_1 = require("./util_parser");
class ExecuteManager_Runner extends feedback_1.ExecuteManager_Feedback {
    SyncDatabase = (p) => {
        this.localPara = JSON.parse(JSON.stringify(p.database));
        this.messager_log("[Execute] Sync Database !");
        this.messager_log("[Execute] Generate local database object");
        for (let i = 0; i < this.localPara.containers.length; i++) {
            if (this.localPara.containers[i].type == interface_1.DataType.Expression && this.localPara.containers[i].meta != undefined) {
                const text = `%{${this.localPara.containers[i].meta}}%`;
                const e = new util_parser_1.Util_Parser([...util_parser_1.Util_Parser.to_keyvalue(this.localPara)]);
                this.localPara.containers[i].value = e.replacePara(text);
            }
        }
        this.sync_local_para(this.localPara);
    };
}
exports.ExecuteManager_Runner = ExecuteManager_Runner;
