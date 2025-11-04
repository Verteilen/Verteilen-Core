import { DatabaseContainer, DataTime, Project } from "./base";
import { ACLType, LocalPermission } from "./server";
type ProjectCall = (p: Project) => Project;
type DatabaseCall = () => Array<DatabaseContainer>;
export interface PluginContent {
    filename: string;
    url: string;
    unpack: boolean;
    platform: NodeJS.Platform;
    arch: NodeJS.Architecture;
}
export interface Plugin {
    icon?: string;
    name: string;
    description: string;
    requireVersion: string;
    version?: string;
    progress?: number;
    contents: Array<PluginContent>;
}
export interface PluginNode {
    plugins: Array<Plugin>;
}
export interface PluginWithToken extends Plugin {
    token: Array<string>;
}
export interface PluginContainer extends DataTime {
    thumbnail?: string;
    icon?: string;
    owner?: string;
    title?: string;
    url?: string;
    plugins: Array<Plugin>;
    projects: Array<TemplateData_Project>;
    databases: Array<TemplateData_Database>;
    gen_projects?: Array<TemplateGroup_Project>;
    gen_databases?: Array<TemplateGroup_Database>;
    permission?: LocalPermission;
    acl?: ACLType;
}
export interface PluginPageData {
    plugins: Array<PluginContainer>;
}
export interface PluginState {
    name: string;
    url: string;
    installed: boolean;
    supported: boolean;
}
export interface TemplateData_Project {
    title: string;
    filename: string;
    group: string;
}
export interface TemplateData_Database {
    title: string;
    filename: string;
    group: string;
}
export interface TemplateGroup_Project {
    value: number;
    group: string;
    title?: string;
    filename?: string;
    template?: ProjectCall;
}
export interface TemplateGroup_Database {
    value: number;
    group: string;
    title?: string;
    filename?: string;
    template?: DatabaseCall;
}
export interface TemplateData {
    url?: string;
    projects: Array<TemplateData_Project>;
    databases: Array<TemplateData_Database>;
}
export {};
