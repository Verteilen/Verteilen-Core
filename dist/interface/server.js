"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRootUser = exports.CreateRootPermission = exports.CreateRootLocalPermission = exports.CreateServerSetupRequire = exports.PermissionType = exports.UserType = exports.ACLType = exports.ContentService = exports.ContentDB = exports.ContentType = exports.AuthService = exports.AuthDB = exports.AuthType = void 0;
const uuid_1 = require("uuid");
var AuthType;
(function (AuthType) {
    AuthType[AuthType["SELF"] = 0] = "SELF";
    AuthType[AuthType["EXTERNAL"] = 1] = "EXTERNAL";
    AuthType[AuthType["SERVICE"] = 2] = "SERVICE";
})(AuthType || (exports.AuthType = AuthType = {}));
var AuthDB;
(function (AuthDB) {
    AuthDB[AuthDB["SQLITE3"] = 0] = "SQLITE3";
    AuthDB[AuthDB["MONGODB"] = 1] = "MONGODB";
})(AuthDB || (exports.AuthDB = AuthDB = {}));
var AuthService;
(function (AuthService) {
    AuthService[AuthService["FIREBASE"] = 0] = "FIREBASE";
    AuthService[AuthService["AUTH0"] = 1] = "AUTH0";
    AuthService[AuthService["CLERK"] = 2] = "CLERK";
    AuthService[AuthService["SUPABASE"] = 3] = "SUPABASE";
})(AuthService || (exports.AuthService = AuthService = {}));
var ContentType;
(function (ContentType) {
    ContentType[ContentType["LOCAL"] = 0] = "LOCAL";
    ContentType[ContentType["EXTERNAL"] = 1] = "EXTERNAL";
    ContentType[ContentType["SERVICE"] = 2] = "SERVICE";
})(ContentType || (exports.ContentType = ContentType = {}));
var ContentDB;
(function (ContentDB) {
    ContentDB[ContentDB["FTP"] = 0] = "FTP";
    ContentDB[ContentDB["MONGODB"] = 1] = "MONGODB";
})(ContentDB || (exports.ContentDB = ContentDB = {}));
var ContentService;
(function (ContentService) {
    ContentService[ContentService["MONGODB"] = 0] = "MONGODB";
    ContentService[ContentService["DYNAMODB"] = 1] = "DYNAMODB";
    ContentService[ContentService["COSMOS"] = 2] = "COSMOS";
    ContentService[ContentService["BIGTABLE"] = 3] = "BIGTABLE";
})(ContentService || (exports.ContentService = ContentService = {}));
/**
 * **Access Control Type**\
 * Ot will have effect on permission value
 */
var ACLType;
(function (ACLType) {
    ACLType[ACLType["PUBLIC"] = 0] = "PUBLIC";
    ACLType[ACLType["PROTECTED"] = 1] = "PROTECTED";
    ACLType[ACLType["PRIVATE"] = 2] = "PRIVATE";
})(ACLType || (exports.ACLType = ACLType = {}));
/**
 * **User Type**\
 * It will have effect on permission value
 */
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
    PermissionType[PermissionType["DATABASE"] = 4] = "DATABASE";
    PermissionType[PermissionType["PLUGIN"] = 5] = "PLUGIN";
    PermissionType[PermissionType["NODE"] = 6] = "NODE";
    PermissionType[PermissionType["LIB"] = 7] = "LIB";
    PermissionType[PermissionType["LOG"] = 8] = "LOG";
})(PermissionType || (exports.PermissionType = PermissionType = {}));
const CreateServerSetupRequire = () => {
    return {
        setting: {
            open_guest: false,
            open_register: false,
            auth: {
                auth_type: AuthType.SELF,
                auth_service: AuthService.FIREBASE,
                auth_db: AuthDB.SQLITE3
            },
            content: {
                content_type: ContentType.LOCAL,
                content_service: ContentService.MONGODB,
                content_db: ContentDB.FTP
            }
        },
        root: {
            root_username: "",
            root_password: ""
        }
    };
};
exports.CreateServerSetupRequire = CreateServerSetupRequire;
const CreateRootLocalPermission = () => {
    return {
        view: true,
        create: true,
        edit: true,
        delete: true,
    };
};
exports.CreateRootLocalPermission = CreateRootLocalPermission;
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
        service: perl,
        node: perl,
        database: perl,
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
        global_permission: (0, exports.CreateRootPermission)()
    };
};
exports.CreateRootUser = CreateRootUser;
//# sourceMappingURL=server.js.map