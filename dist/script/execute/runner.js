"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteManager_Runner = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
const interface_1 = require("../../interface");
const feedback_1 = require("./feedback");
const util_parser_1 = require("./util_parser");
/**
 * The execute runner
 */
class ExecuteManager_Runner extends feedback_1.ExecuteManager_Feedback {
    constructor() {
        super(...arguments);
        /**
         * Boradcasting all the database and library to all the websocket nodes
         * @param p Target project
         */
        this.SyncDatabase = (p) => {
            // Get the clone para from it
            this.localPara = JSON.parse(JSON.stringify(p.database));
            this.messager_log("[Execute] Sync Database !");
            this.messager_log("[Execute] Generate local database object");
            // Then phrase the expression to value
            for (let i = 0; i < this.localPara.containers.length; i++) {
                if (this.localPara.containers[i].type == interface_1.DataType.Expression && this.localPara.containers[i].meta != undefined) {
                    const text = `%{${this.localPara.containers[i].meta}}%`;
                    const e = new util_parser_1.Util_Parser([...util_parser_1.Util_Parser.to_keyvalue(this.localPara)]);
                    this.localPara.containers[i].value = e.replacePara(text);
                }
            }
            // Boradcasting
            this.sync_local_para(this.localPara);
        };
    }
}
exports.ExecuteManager_Runner = ExecuteManager_Runner;
//# sourceMappingURL=runner.js.map