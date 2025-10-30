// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * Vue Client-side only data structure
 */

import { BackendType } from "./enum"

/**
 * **Application Configuration**\
 * Show current state of the app\
 * Defined by the backend proxy worker
 */
export interface AppConfig {
    /**
     * **FLAG: Express**\
     * For browser check if it's connect to a express server
     */
    isExpress: boolean
    /**
     * **FLAG: Electron**\
     * For browser check if it's use Electron desktop app currently
     */
    isElectron: boolean
    /**
     * **FLAG: Admin**\
     * If use express server, check user have root permission
     */
    isAdmin: boolean
    /**
     * **FLAG: Backend**\
     * For browser check if it's connect to any server\
     * If false, it means it's a static website\
     * All the logic will run on browser
     */
    haveBackend: boolean
    /**
     * **Login state**\
     * FOr express mode detect only
     */
    login:boolean
    /**
     * **Server Type**
     */
    backendType: BackendType
}
/**
 * **Notification Data Structure**\
 * This data is for the notification handler worker\
 * The bottom right corner notification
 */
export interface IMessage {
    /**
     * **Enable Value**\
     * Should it be display
     */
    ison: boolean
    /**
     * **Remind Timer**\
     * How long does the notification survive
     */
    timer: number
    /**
     * **Background Color**\
     * Define color of the background of the toast element
     */
    variant: any
    /**
     * **Notification Title**
     * The header title of the notification
     */
    title: string
    /**
     * **Notification Content**
     * The content of the notification
     */
    content: string
    /**
     * **Notification Stack Trace**
     * Display exception error use\
     * Useful for display multi-lines messages
     */
    stack: Array<string>
}
/**
 * **Compute Client Log**\
 */
export interface ClientLog {
    /**
     * **Collapsible Model**
     * Determine the fold state for the log group
     */
    s: boolean
    /**
     * **Extra Meta**\
     * Won't effect the UI, This is for the group search functionality
     */
    tag: string
    /**
     * **Collapsible Title**\
     * Display on the bar
     */
    title: string
    /**
     * **Logs**\
     * The log group content
     */
    text: Array<string>
}
/**
 * **Notification Message Data**\
 * This data structure is for the sender\
 * The one who use the event emitter
 */
export interface ToastData {
    /**
     * **Background Color**\
     * Define color of the background of the toast element
     */
    type: string,
    /**
     * **Notification Title**
     * The header title of the notification
     */
    title: string,
    /**
     * **Notification Content**
     * The content of the notification
     */
    message: string
    /**
     * **Notification Stack Trace**
     * Display exception error use\
     * Useful for display multi-lines messages
     */
    stack?: Array<string>
}