import { PluginBase, PluginGenData, PluginNode } from '../interface';
/**
 * Build plugin base on current project structure
 * @param root Output folder
 * @param plugins Plugin structure
 * @param templates Template structure
 * @param data Plugin header
 */
export declare const PluginBuild: (root: string, plugins: PluginNode, templates: PluginGenData, data: PluginBase) => void;
