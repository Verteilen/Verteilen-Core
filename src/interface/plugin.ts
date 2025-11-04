// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { DataTime } from "./base"
import { ACLType, LocalPermission } from "./server"
import { TemplateGroup, TemplateGroup2 } from "./struct"

/**
 * **Plugin Content**\
 * For single file specification
 */
export interface PluginContent {
    filename: string
    url: string
    platform: NodeJS.Platform
    arch: NodeJS.Architecture
}

/**
 * **Plugin Container**\
 * A plugin is basically a 
 * 
 */
export interface Plugin {
    /**
     * **Icon URL**\
     * The relative link for the icon
     */
    icon?: string
    /**
     * **Plugin Title**
     */
    name: string
    /**
     * **Plugin Description**
     */
    description: string
    /**
     * **Minimum Require Application Version**
     */
    requireVersion: string
    /**
     * **Plugin Version Data**
     */
    version?: string
    /**
     * **Download Progress**\
     * For download purpose
     * * 0: Downloading
     * * 1: Finish
     */
    progress?: number
    /**
     * **List Content Of Plugin**\
     * Provide list of files
     */
    contents: Array<PluginContent>
}

/**
 * **Plugin Container WIth Token**\
 * For server mark the data with successfully query token\
 * To save time for next query
 */
export interface PluginWithToken extends Plugin {
    token: Array<string>
}

/**
 * **Plugin Group**\
 * User can upload a group of plugin with author and thumbnail etc...\
 */
export interface PluginList extends DataTime {
    /**
     * **Thumbnail URL**\
     * The relative link for the thumbnail
     */
    thumbnail?: string
    /**
     * **Icon URL**\
     * The relative link for the icon
     */
    icon?: string
    /**
     * **Owner ID**\
     * When publish the plugin
     */
    owner?: string
    /**
     * **Plugin Group Name**
     */
    title?: string
    /**
     * **Plugin Header URL**
     */
    url?: string
    /**
     * **Available Files**
     */
    plugins: Array<Plugin>
    /**
     * **Local Permission**\
     * Client-side only permission field\
     * Server will check user token and defined its permission level\
     * And modify this field and send back to user
     */
    permission?: LocalPermission
    /**
     * **Accessibility**\
     * Could be public, protected, private
     */
    acl?: ACLType
}

export interface PluginState {
    name: string
    url: string
    installed: boolean
    supported: boolean
}

export interface PluginPageTemplate {
    owner?: string
    name: string
    project: Array<TemplateGroup>
    database: Array<TemplateGroup2>
    url?: string
    /**
     * **Local Permission**\
     * Client-side only permission field\
     * Server will check user token and defined its permission level\
     * And modify this field and send back to user
     */
    permission?: LocalPermission
    /**
     * **Accessibility**\
     * Could be public, protected, private
     */
    acl?: ACLType
}

export interface TemplateDataProject {
    title: string
    filename: string
    group: string
}

export interface TemplateDataDatabase {
    title: string
    filename: string
    group: string
}

export interface TemplateData {
    url?: string
    projects: Array<TemplateDataProject>
    databases: Array<TemplateDataDatabase>
}

/**
 * **Page Display**\
 * For server to display all kinds of plugins and templates
 */
export interface PluginPageData {
    /**
     * **Plugins Data**
     */
    plugins: Array<PluginList>
    /**
     * **Templates Data**
     */
    templates: Array<PluginPageTemplate>
}