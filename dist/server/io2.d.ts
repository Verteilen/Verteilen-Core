import { MemoryData, RecordIOBase, RecordLoader } from "./io";
export declare const CreateRecordMemoryLoader: (loader: MemoryData) => RecordLoader;
export declare const CreateRecordIOLoader: (loader: RecordIOBase, memory: MemoryData) => RecordLoader;
export declare const CreateRecordMongoLoader: (url: string, memory: MemoryData) => RecordLoader;
