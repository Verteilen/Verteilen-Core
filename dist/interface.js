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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.I18N = exports.MONGODB_NAME = exports.DATA_FOLDER = exports.IGNORE_CHARACTER = exports.ENV_CHARACTER = exports.SCROLL_LIMIT = exports.RENDER_FILE_UPDATETICK = exports.RENDER_UPDATETICK = exports.CLIENT_UPDATETICK = exports.MESSAGE_LIMIT = exports.WebHookPORT = exports.WebPORT = exports.PORT = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * Default client node port
 */
exports.PORT = 12080;
/**
 * Default website port
 */
exports.WebPORT = 11080;
/**
 * Default webhook port
 */
exports.WebHookPORT = 15080;
/**
 * The upper limit for each message box can hold
 */
exports.MESSAGE_LIMIT = 500;
/**
 * The client node update tick, this will have effect on resource query.
 */
exports.CLIENT_UPDATETICK = 3000;
/**
 * The server side update tick, this will have effect on the time gap between task sending
 */
exports.RENDER_UPDATETICK = 30;
exports.RENDER_FILE_UPDATETICK = 5000;
exports.SCROLL_LIMIT = 100;
/**
 * The environment character for replacing text
 */
exports.ENV_CHARACTER = '%';
exports.IGNORE_CHARACTER = '^';
exports.DATA_FOLDER = '.verteilen';
exports.MONGODB_NAME = "verteilen";
__exportStar(require("./interface/base"), exports);
__exportStar(require("./interface/bus"), exports);
__exportStar(require("./interface/enum"), exports);
__exportStar(require("./interface/error"), exports);
__exportStar(require("./interface/execute"), exports);
__exportStar(require("./interface/record"), exports);
__exportStar(require("./interface/server"), exports);
__exportStar(require("./interface/struct"), exports);
__exportStar(require("./interface/table"), exports);
__exportStar(require("./interface/ui"), exports);
__exportStar(require("./interface/plugin"), exports);
__exportStar(require("./interface/log"), exports);
/**
 * Plugin
 */
exports.I18N = __importStar(require("./plugins/i18n"));
//# sourceMappingURL=interface.js.map