import { MemoryData, RecordIOBase, RecordLoader } from "./io";
/**
 * **Create the interface for record memory storage**\
 * Generate a loader interface for register to server event
 * @param loader loader memory loader interface
 * @returns Interface for server calling
 */
export declare const CreateRecordMemoryLoader: (loader: MemoryData) => RecordLoader;
/**
 * **Create the interface for record files storage**\
 * Generate a loader interface for register to server event
 * @param loader loader IO loader interface
 * @param user should include user
 * @returns Interface for server calling
 */
export declare const CreateRecordIOLoader: (loader: RecordIOBase, memory: MemoryData) => RecordLoader;
/**
 * **Create the interface for record mongoDB storage**\
 * @param url MongoDB URL
 * @param memory loader memory loader interface
 * @returns
 */
export declare const CreateRecordMongoLoader: (url: string, memory: MemoryData) => RecordLoader;
