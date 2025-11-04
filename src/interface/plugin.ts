// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { DatabaseContainer, DataTime, Project } from "./base"
import { ACLType, LocalPermission } from "./server"

/**
 * Method to generate project template (populate)
 */
type ProjectCall = (p:Project) => Project
/**
 * Method to generate database values
 */
type DatabaseCall = () => Array<DatabaseContainer>

/**
 * **Plugin Content**\
 * For single file specification
 */
export interface PluginContent {
    filename: string
    url: string
    /**
     * **Should Unpack**\
     * Support Zip format
     */
    unpack: boolean
    platform: NodeJS.Platform
    arch: NodeJS.Architecture
}

/**
 * **Plugin Container**\
 * A plugin is basically a 
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
 * **Compute Client Plugin Store Data**
 */
export interface PluginNode {
    /**
     * A;; installed or installing 
     */
    plugins: Array<Plugin>
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
export interface PluginContainer extends DataTime {
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
     * **Data Mark: Project**\
     * Contain the header data for project template
     */
    projects: Array<TemplateData_Project>
    /**
     * **Data Mark: Database**\
     * Contain the header data for database template
     */
    databases: Array<TemplateData_Database>
    /**
     * **Generate Method: Project**\
     * Only exist in server side
     */
    gen_projects?: Array<TemplateGroup_Project>
    /**
     * **Generate Method: Database**\
     * Only exist in server side
     */
    gen_databases?: Array<TemplateGroup_Database>
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

/**
 * **Page Display**\
 * For server to display all kinds of plugins and templates
 */
export interface PluginPageData {
    /**
     * **Plugins Data**
     */
    plugins: Array<PluginContainer>
}


/**
 * **Vue Plugin state**\
 * Dynamic data in frontend for display purpose
 */
export interface PluginState {
    /**
     * **Plugin Name**
     */
    name: string
    /**
     * **Plugin Manifest URL Name**
     */
    url: string
    /**
     * **Is Installed**
     */
    installed: boolean
    /**
     * **Is Supported**
     */
    supported: boolean
}

/**
 * **Template Project Group**
 */
export interface TemplateData_Project {
    /**
     * **Project Template Name**
     */
    title: string
    /**
     * **Filename Name**
     */
    filename: string
    /**
     * **Group Name**
     */
    group: string
    /**
     * **Sort Order**
     */
    value: number
}

/**
 * **Template Project Group**
 */
export interface TemplateData_Database {
    /**
     * **Database Template Name**
     */
    title: string
    /**
     * **Filename Name**
     */
    filename: string
    /**
     * **Group Name**
     */
    group: string
    /**
     * **Sort Order**
     */
    value: number
}

export interface TemplateGroup_Project extends TemplateData_Project {
    template: ProjectCall
}

export interface TemplateGroup_Database extends TemplateData_Database {
    template: DatabaseCall
}

/**
 * **Template Group Data**
 */
export interface PluginGenData {
    url?: string
    projects: Array<TemplateGroup_Project>
    databases: Array<TemplateGroup_Database>
}
