import { MemoryData, RecordLoader } from '../io';
export declare class Account_Module {
    loader: RecordLoader;
    memory: MemoryData;
    constructor(loader: RecordLoader, memory: MemoryData);
    login: (username: string, password: string) => Promise<string>;
}
