/* Byteshift Elements                                                              _         _             __   _ _____
 *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
 *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
 * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
 * See LICENSE for licensing information                                                |__/           E L E M E N T S
 */
'use strict';

import {AbstractComponent} from '@/Component/AbstractComponent';
import {registerComponent} from '@/Component/ComponentRegistry';

// Public API.
export * from '@/Decorator/Component';
export * from '@/Decorator/Watch';
export * from '@/Component/ComponentStyleDeclaration';
export * from '@/Component/AbstractComponent';

export const Elements: ElementsRegistry = {
    /**
     * Register one or more components.
     *
     * @param {(typeof AbstractComponent)[]} elements
     */
    register(...elements: (typeof AbstractComponent)[]): void
    {
        elements.forEach((element: typeof AbstractComponent) => {
            if (typeof (element as any).__be_component__ === 'undefined') {
                throw new Error('The given argument is not a custom element.');
            }

            registerComponent(element, (element as any).__be_component__);
        });
    },

    /**
     * Installs a plugin.
     *
     * A plugin must be installed by the application that includes both
     * Byteshift Elements and the specified plugin, so the plugin only needs a
     * peer dependency on Byteshift Elements.
     *
     * The plugin's install method receives the {Elements} object on which it
     * can register any components, or even install sub-plugins.
     *
     * @param {PluginType} plugin
     */
    install(plugin: PluginType): void
    {
        plugin.install(Elements);
    },
};

type ElementsRegistry = {
    register: (...elements: (typeof AbstractComponent)[]) => void;
    install: (plugin: PluginType) => void
};

type PluginType = {
    install: (registry: ElementsRegistry) => void;
}
