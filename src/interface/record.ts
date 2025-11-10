// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { DataHeader, Shareable } from "./base"
import { ExecuteState } from "./enum"

export interface ExecuteData {
    uuid: string
    state: ExecuteState
}

export interface RecordHeader {
    projects: Array<string>
    nodes: Array<string>
}

export interface PluginToken {
    name: string
    token: string
}

export interface Preference_Recover {
    projects: Array<[string | null, string | null]>
    nodes: Array<string | null>
}

/**
 * **User Preference**\
 * Store the user preference setting\
 * This could store for any kinds of backend
 */
export interface Preference {
    /**
     * Language setting
     */
    lan: string
    notification: boolean

    theme: string
    font: number
    
    /**
     * You can turn off the logging\
     * To prevent IO works to slowdown your works\
     * ![NOTICE] there will be no log to recover your works
     */
    log: boolean
    plugin_token: Array<PluginToken>
    animation: boolean
    recover?: Preference_Recover

    mode?: number
    url?: string
}

export interface Library extends DataHeader, Shareable {
    name: string
    load: boolean
    content: string
}

export interface Libraries {
    libs: Array<Library>
}

export interface FileState {
    name: string,
    size: number
    time: Date
}

export const CreatePreference = ():Preference => ({
    lan: 'en',
    log: false,
    font: 16,
    notification: false,
    theme: "dark",
    plugin_token: [],
    animation: true,
})