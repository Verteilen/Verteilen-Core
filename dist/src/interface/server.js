"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRootUser = exports.CreateRootPermission = exports.PermissionType = exports.UserType = exports.ACLType = void 0;
const uuid_1 = require("uuid");
var ACLType;
(function (ACLType) {
    ACLType[ACLType["PUBLIC"] = 0] = "PUBLIC";
    ACLType[ACLType["PROTECTED"] = 1] = "PROTECTED";
    ACLType[ACLType["PRIVATE"] = 2] = "PRIVATE";
})(ACLType || (exports.ACLType = ACLType = {}));
var UserType;
(function (UserType) {
    UserType[UserType["ROOT"] = 0] = "ROOT";
    UserType[UserType["ADMIN"] = 1] = "ADMIN";
    UserType[UserType["GUEST"] = 2] = "GUEST";
    UserType[UserType["USER"] = 3] = "USER";
})(UserType || (exports.UserType = UserType = {}));
var PermissionType;
(function (PermissionType) {
    PermissionType[PermissionType["ROOT"] = 0] = "ROOT";
    PermissionType[PermissionType["PROJECT"] = 1] = "PROJECT";
    PermissionType[PermissionType["Task"] = 2] = "Task";
    PermissionType[PermissionType["JOB"] = 3] = "JOB";
    PermissionType[PermissionType["PARAMETER"] = 4] = "PARAMETER";
    PermissionType[PermissionType["PLUGIN"] = 5] = "PLUGIN";
    PermissionType[PermissionType["NODE"] = 6] = "NODE";
    PermissionType[PermissionType["LIB"] = 7] = "LIB";
    PermissionType[PermissionType["LOG"] = 8] = "LOG";
})(PermissionType || (exports.PermissionType = PermissionType = {}));
const CreateRootPermission = () => {
    const perl = {
        view: true,
        create: true,
        edit: true,
        delete: true,
    };
    const per = {
        project: perl,
        task: perl,
        job: perl,
        plugin: perl,
        node: perl,
        parameter: perl,
        lib: perl,
        log: perl,
        execute_job: true
    };
    return per;
};
exports.CreateRootPermission = CreateRootPermission;
const CreateRootUser = () => {
    return {
        uuid: (0, uuid_1.v6)(),
        token: (0, uuid_1.v6)(),
        type: UserType.ROOT,
        preference: {
            lan: 'en',
            log: true,
            font: 18,
            theme: "dark",
            notification: false,
            plugin_token: [],
            animation: true,
        },
        name: "root",
        description: "Root User",
        permission: (0, exports.CreateRootPermission)()
    };
};
exports.CreateRootUser = CreateRootUser;
