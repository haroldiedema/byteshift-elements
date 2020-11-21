/* Byteshift Elements                                                              _         _             __   _ _____
 *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
 *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
 * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
 * See LICENSE for licensing information                                                |__/           E L E M E N T S
 */
'use strict';

import {AbstractComponent}         from '@/Component/AbstractComponent';
import {registerComponent}         from '@/Component/ComponentRegistry';
import {ComponentStyleDeclaration} from '@/Component/IStylesheet';

/**
 * Configures the decorated class to function as a native web component.
 *
 * @param {ComponentOptions} options
 * @returns {(target: AbstractComponent) => void}
 * @constructor
 */
export function Component(options: ComponentOptions)
{
    return (target: typeof AbstractComponent) => {
        registerComponent(target, options);
    };
}

export interface ComponentOptions
{
    selector: string;
    template: string;
    stylesheet?: ComponentStyleDeclaration;
    attributes?: string[];
}
