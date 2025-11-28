import { MemoryData, RecordLoader } from '../io';
export declare class Account_Module {
    loader: RecordLoader;
    memory: MemoryData;
    constructor(loader: RecordLoader, memory: MemoryData);
    /**
     * If login failed, it will throw error
     * @param username Login Username Field
     * @param password Login Password Field
     * @returns Token string
     */
    login: (username: string, password: string) => Promise<string>;
}
