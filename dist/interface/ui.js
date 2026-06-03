"use strict";
// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * Vue Client-side only data structure
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendState = void 0;
/**
 * Shows the frontend page selection login
 */
var FrontendState;
(function (FrontendState) {
    FrontendState[FrontendState["NONE"] = 0] = "NONE";
    FrontendState[FrontendState["LOGIN_BACKEND"] = 1] = "LOGIN_BACKEND";
    FrontendState[FrontendState["LOGOUT_BACKEND"] = 2] = "LOGOUT_BACKEND";
    FrontendState[FrontendState["SETUP_BACKEND"] = 3] = "SETUP_BACKEND";
    FrontendState[FrontendState["LOGIN_STATIC"] = 4] = "LOGIN_STATIC";
    FrontendState[FrontendState["LOGOUT_STATIC"] = 5] = "LOGOUT_STATIC";
    FrontendState[FrontendState["SETUP_STATIC"] = 6] = "SETUP_STATIC";
    FrontendState[FrontendState["CLUSTER"] = 7] = "CLUSTER";
    FrontendState[FrontendState["NODE"] = 8] = "NODE";
})(FrontendState || (exports.FrontendState = FrontendState = {}));
//# sourceMappingURL=ui.js.map