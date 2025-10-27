import { ResourceType } from "../interface";
import { SystemLoad } from "../interface/struct";
export declare class ClientResource {
    is_query: boolean;
    Query: (src?: SystemLoad | undefined, type?: ResourceType) => Promise<SystemLoad>;
    private create_new;
}
