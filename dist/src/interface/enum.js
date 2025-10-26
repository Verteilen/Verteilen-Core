"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseTemplateText = exports.ProjectTemplateText = exports.JobType2Text = exports.JobTypeText = exports.JobResultText = exports.ConnectionText = exports.JobCategoryText = exports.ExecuteStateText = exports.DataTypeText = exports.ServiceMode = exports.JavascriptLib = exports.RecordType = exports.RenderUpdateType = exports.ExecuteState = exports.ParameterTemplate = exports.ProjectTemplate = exports.JobType2 = exports.JobType = exports.ConditionResult = exports.JobCategory = exports.FrontendUpdate = exports.ResourceType = exports.DataTypeBase = exports.DataType = exports.SocketState = void 0;
var SocketState;
(function (SocketState) {
    SocketState[SocketState["CONNECTING"] = 0] = "CONNECTING";
    SocketState[SocketState["OPEN"] = 1] = "OPEN";
    SocketState[SocketState["CLOSING"] = 2] = "CLOSING";
    SocketState[SocketState["CLOSED"] = 3] = "CLOSED";
})(SocketState || (exports.SocketState = SocketState = {}));
var DataType;
(function (DataType) {
    DataType[DataType["Boolean"] = 0] = "Boolean";
    DataType[DataType["Number"] = 1] = "Number";
    DataType[DataType["String"] = 2] = "String";
    DataType[DataType["Object"] = 3] = "Object";
    DataType[DataType["Expression"] = 4] = "Expression";
    DataType[DataType["Textarea"] = 5] = "Textarea";
    DataType[DataType["Select"] = 6] = "Select";
    DataType[DataType["List"] = 7] = "List";
})(DataType || (exports.DataType = DataType = {}));
var DataTypeBase;
(function (DataTypeBase) {
    DataTypeBase[DataTypeBase["Boolean"] = 0] = "Boolean";
    DataTypeBase[DataTypeBase["Number"] = 1] = "Number";
    DataTypeBase[DataTypeBase["String"] = 2] = "String";
})(DataTypeBase || (exports.DataTypeBase = DataTypeBase = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["ALL"] = 1023] = "ALL";
    ResourceType[ResourceType["SYSTEM"] = 1] = "SYSTEM";
    ResourceType[ResourceType["CPU"] = 2] = "CPU";
    ResourceType[ResourceType["RAM"] = 4] = "RAM";
    ResourceType[ResourceType["BATTERY"] = 8] = "BATTERY";
    ResourceType[ResourceType["LOAD"] = 16] = "LOAD";
    ResourceType[ResourceType["OS"] = 32] = "OS";
    ResourceType[ResourceType["GPU"] = 64] = "GPU";
    ResourceType[ResourceType["DISK"] = 128] = "DISK";
    ResourceType[ResourceType["NETWORK"] = 256] = "NETWORK";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
var FrontendUpdate;
(function (FrontendUpdate) {
    FrontendUpdate[FrontendUpdate["ALL"] = 1023] = "ALL";
    FrontendUpdate[FrontendUpdate["PROJECT"] = 1] = "PROJECT";
    FrontendUpdate[FrontendUpdate["PARAMETER"] = 2] = "PARAMETER";
})(FrontendUpdate || (exports.FrontendUpdate = FrontendUpdate = {}));
var JobCategory;
(function (JobCategory) {
    JobCategory[JobCategory["Condition"] = 0] = "Condition";
    JobCategory[JobCategory["Execution"] = 1] = "Execution";
})(JobCategory || (exports.JobCategory = JobCategory = {}));
var ConditionResult;
(function (ConditionResult) {
    ConditionResult[ConditionResult["None"] = 0] = "None";
    ConditionResult[ConditionResult["SkipProject"] = 1] = "SkipProject";
    ConditionResult[ConditionResult["ThrowProject"] = 2] = "ThrowProject";
    ConditionResult[ConditionResult["SkipTask"] = 3] = "SkipTask";
    ConditionResult[ConditionResult["ThrowTask"] = 4] = "ThrowTask";
    ConditionResult[ConditionResult["Pause"] = 5] = "Pause";
})(ConditionResult || (exports.ConditionResult = ConditionResult = {}));
var JobType;
(function (JobType) {
    JobType[JobType["COPY_FILE"] = 0] = "COPY_FILE";
    JobType[JobType["COPY_DIR"] = 1] = "COPY_DIR";
    JobType[JobType["DELETE_FILE"] = 2] = "DELETE_FILE";
    JobType[JobType["DELETE_DIR"] = 3] = "DELETE_DIR";
    JobType[JobType["CREATE_FILE"] = 4] = "CREATE_FILE";
    JobType[JobType["CREATE_DIR"] = 5] = "CREATE_DIR";
    JobType[JobType["RENAME"] = 6] = "RENAME";
    JobType[JobType["JAVASCRIPT"] = 7] = "JAVASCRIPT";
    JobType[JobType["COMMAND"] = 8] = "COMMAND";
    JobType[JobType["LIB_COMMAND"] = 9] = "LIB_COMMAND";
})(JobType || (exports.JobType = JobType = {}));
var JobType2;
(function (JobType2) {
    JobType2[JobType2["CHECK_PATH"] = 0] = "CHECK_PATH";
    JobType2[JobType2["JAVASCRIPT"] = 1] = "JAVASCRIPT";
})(JobType2 || (exports.JobType2 = JobType2 = {}));
var ProjectTemplate;
(function (ProjectTemplate) {
    ProjectTemplate[ProjectTemplate["DEFAULT"] = 0] = "DEFAULT";
    ProjectTemplate[ProjectTemplate["DEFAULT_SHORT"] = 1] = "DEFAULT_SHORT";
    ProjectTemplate[ProjectTemplate["Blender"] = 100] = "Blender";
    ProjectTemplate[ProjectTemplate["Blender_Cluster"] = 101] = "Blender_Cluster";
    ProjectTemplate[ProjectTemplate["AfterEffect"] = 200] = "AfterEffect";
})(ProjectTemplate || (exports.ProjectTemplate = ProjectTemplate = {}));
var ParameterTemplate;
(function (ParameterTemplate) {
    ParameterTemplate[ParameterTemplate["DEFAULT"] = 0] = "DEFAULT";
})(ParameterTemplate || (exports.ParameterTemplate = ParameterTemplate = {}));
var ExecuteState;
(function (ExecuteState) {
    ExecuteState[ExecuteState["NONE"] = 0] = "NONE";
    ExecuteState[ExecuteState["RUNNING"] = 1] = "RUNNING";
    ExecuteState[ExecuteState["FINISH"] = 2] = "FINISH";
    ExecuteState[ExecuteState["ERROR"] = 3] = "ERROR";
    ExecuteState[ExecuteState["SKIP"] = 4] = "SKIP";
})(ExecuteState || (exports.ExecuteState = ExecuteState = {}));
var RenderUpdateType;
(function (RenderUpdateType) {
    RenderUpdateType[RenderUpdateType["All"] = 127] = "All";
    RenderUpdateType[RenderUpdateType["Project"] = 1] = "Project";
    RenderUpdateType[RenderUpdateType["Node"] = 2] = "Node";
    RenderUpdateType[RenderUpdateType["Database"] = 4] = "Database";
})(RenderUpdateType || (exports.RenderUpdateType = RenderUpdateType = {}));
var RecordType;
(function (RecordType) {
    RecordType[RecordType["PROJECT"] = 0] = "PROJECT";
    RecordType[RecordType["Database"] = 1] = "Database";
    RecordType[RecordType["NODE"] = 2] = "NODE";
    RecordType[RecordType["LOG"] = 3] = "LOG";
    RecordType[RecordType["LIB"] = 4] = "LIB";
    RecordType[RecordType["USER"] = 5] = "USER";
})(RecordType || (exports.RecordType = RecordType = {}));
var JavascriptLib;
(function (JavascriptLib) {
    JavascriptLib[JavascriptLib["ALL"] = 127] = "ALL";
    JavascriptLib[JavascriptLib["OS"] = 1] = "OS";
    JavascriptLib[JavascriptLib["ENV"] = 2] = "ENV";
    JavascriptLib[JavascriptLib["MESSAGE"] = 4] = "MESSAGE";
    JavascriptLib[JavascriptLib["HTTP"] = 8] = "HTTP";
    JavascriptLib[JavascriptLib["PATH"] = 16] = "PATH";
})(JavascriptLib || (exports.JavascriptLib = JavascriptLib = {}));
var ServiceMode;
(function (ServiceMode) {
    ServiceMode[ServiceMode["ONCE"] = 0] = "ONCE";
    ServiceMode[ServiceMode["CYCLE"] = 1] = "CYCLE";
    ServiceMode[ServiceMode["EVENT"] = 2] = "EVENT";
})(ServiceMode || (exports.ServiceMode = ServiceMode = {}));
exports.DataTypeText = {
    0: 'types.boolean',
    1: 'types.number',
    2: 'types.string',
    3: 'types.object',
    4: 'types.expression',
    5: 'types.textarea',
    6: 'types.select',
    7: 'types.list',
};
exports.ExecuteStateText = {
    0: 'enum.state.none',
    1: 'enum.state.running',
    2: 'enum.state.finish',
    3: 'enum.state.error',
    4: 'enum.state.skip',
};
exports.JobCategoryText = {
    0: 'enum.category.condition',
    1: 'enum.category.execution',
};
exports.ConnectionText = {
    0: 'enum.connection.connecting',
    1: 'enum.connection.connected',
    2: 'enum.connection.closing',
    3: 'enum.connection.closed',
};
exports.JobResultText = {
    0: 'enum.jobresult.none',
    1: 'enum.jobresult.skip-project',
    2: 'enum.jobresult.throw-project',
    3: 'enum.jobresult.skip-task',
    4: 'enum.jobresult.throw-task',
    5: 'enum.jobresult.pause'
};
exports.JobTypeText = {
    0: 'enum.jobtype.copy-file',
    1: 'enum.jobtype.copy-dir',
    2: 'enum.jobtype.delete-file',
    3: 'enum.jobtype.delete-dir',
    4: 'enum.jobtype.create-file',
    5: 'enum.jobtype.create-dir',
    6: 'enum.jobtype.rename',
    7: 'enum.jobtype.javascript',
    8: 'enum.jobtype.command',
    9: 'enum.jobtype.lib_command',
};
exports.JobType2Text = {
    0: 'enum.jobtype2.check-path',
    1: 'enum.jobtype.javascript',
};
exports.ProjectTemplateText = {
    0: 'enum.project.default',
    1: 'enum.project.default_short',
    100: 'enum.project.blender',
    101: 'enum.project.blender_cluster',
    200: 'enum.project.aftereffect',
};
exports.DatabaseTemplateText = {
    0: 'enum.database.default'
};
