export declare enum SocketState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3
}
export declare enum DataType {
    Boolean = 0,
    Number = 1,
    String = 2,
    Object = 3,
    Expression = 4,
    Textarea = 5,
    Select = 6,
    List = 7
}
export declare enum BackendType {
    NONE = 0,
    SERVER = 1,
    CLUSTER = 2,
    NODE = 3
}
export declare enum DataTypeBase {
    Boolean = 0,
    Number = 1,
    String = 2
}
export declare enum ResourceType {
    ALL = 1023,
    SYSTEM = 1,
    CPU = 2,
    RAM = 4,
    BATTERY = 8,
    LOAD = 16,
    OS = 32,
    GPU = 64,
    DISK = 128,
    NETWORK = 256
}
export declare enum FrontendUpdate {
    ALL = 1023,
    PROJECT = 1,
    PARAMETER = 2
}
export declare enum JobCategory {
    Condition = 0,
    Execution = 1
}
export declare enum ConditionResult {
    None = 0,
    SkipProject = 1,
    ThrowProject = 2,
    SkipTask = 3,
    ThrowTask = 4,
    Pause = 5
}
export declare enum JobType {
    COPY_FILE = 0,
    COPY_DIR = 1,
    DELETE_FILE = 2,
    DELETE_DIR = 3,
    CREATE_FILE = 4,
    CREATE_DIR = 5,
    RENAME = 6,
    JAVASCRIPT = 7,
    COMMAND = 8,
    LIB_COMMAND = 9
}
export declare enum JobType2 {
    CHECK_PATH = 0,
    JAVASCRIPT = 1
}
export declare enum ProjectTemplate {
    DEFAULT = 0,
    DEFAULT_SHORT = 1,
    Blender = 100,
    Blender_Cluster = 101,
    AfterEffect = 200
}
export declare enum DatabaseTemplate {
    DEFAULT = 0
}
export declare enum ExecuteState {
    NONE = 0,
    RUNNING = 1,
    FINISH = 2,
    ERROR = 3,
    SKIP = 4
}
export declare enum RenderUpdateType {
    All = 127,
    Project = 1,
    Node = 2,
    Database = 4
}
export declare enum RecordType {
    PROJECT = 0,
    Database = 1,
    NODE = 2,
    LOG = 3,
    LIB = 4,
    USER = 5
}
export declare enum JavascriptLib {
    ALL = 127,
    OS = 1,
    ENV = 2,
    MESSAGE = 4,
    HTTP = 8,
    PATH = 16
}
export declare enum ServiceMode {
    ONCE = 0,
    CYCLE = 1,
    EVENT = 2
}
export declare const DataTypeText: {
    [key: number]: string;
};
export declare const ExecuteStateText: {
    [key: number]: string;
};
export declare const JobCategoryText: {
    [key: number]: string;
};
export declare const ConnectionText: {
    [key: number]: string;
};
export declare const JobResultText: {
    [key: number]: string;
};
export declare const JobTypeText: {
    [key: number]: string;
};
export declare const JobType2Text: {
    [key: number]: string;
};
export declare const ProjectTemplateText: {
    [key: number]: string;
};
export declare const DatabaseTemplateText: {
    [key: number]: string;
};
