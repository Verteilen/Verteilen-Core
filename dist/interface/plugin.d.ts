import { DataTime } from "./base";
import { ACLType, LocalPermission } from "./server";
import { TemplateGroup, TemplateGroup2 } from "./struct";
export interface PluginContent {
    filename: string;
    url: string;
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
export interface PluginWithToken extends Plugin {
    token: Array<string>;
}
export interface PluginList extends DataTime {
    thumbnail?: string;
    icon?: string;
    owner?: string;
    title?: string;
    url?: string;
    plugins: Array<Plugin>;
    permission?: LocalPermission;
    acl?: ACLType;
}
export interface PluginState {
    name: string;
    url: string;
    installed: boolean;
    supported: boolean;
}
export interface PluginPageTemplate {
    owner?: string;
    name: string;
    project: Array<TemplateGroup>;
    database: Array<TemplateGroup2>;
    url?: string;
    permission?: LocalPermission;
    acl?: ACLType;
}
export interface TemplateDataProject {
    title: string;
    filename: string;
    group: string;
}
export interface TemplateDataDatabase {
    title: string;
    filename: string;
    group: string;
}
export interface TemplateData {
    url?: string;
    projects: Array<TemplateDataProject>;
    databases: Array<TemplateDataDatabase>;
}
export interface PluginPageData {
    plugins: Array<PluginList>;
    templates: Array<PluginPageTemplate>;
}
