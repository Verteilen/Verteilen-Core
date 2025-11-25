// ========================
//                           
//      Share Codebase     
//                           
// ========================
//
//  ? This script handle the service port of the server module
//
import { MemoryData } from "../io"

export class Service_Module {
    memory:MemoryData

    constructor(memory:MemoryData) {
        this.memory = memory
    }
}