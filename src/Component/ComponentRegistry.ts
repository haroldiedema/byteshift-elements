/* Byteshift Elements                                                              _         _             __   _ _____
 *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
 *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
 * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
 * See LICENSE for licensing information                                                |__/           E L E M E N T S
 */
'use strict';

import {AbstractComponent} from '@/Component/AbstractComponent';
import {ComponentElement}  from '@/Component/ComponentElement';
import {ComponentOptions}  from '@/Decorator/Component';

const __registry__: Set<typeof AbstractComponent> = new Set();

export function registerComponent(target: typeof AbstractComponent, options: ComponentOptions): void
{
    if (__registry__.has(target)) {
        return;
    }

    __registry__.add(target);

    customElements.define(options.selector, (class extends ComponentElement {
        constructor() {
            super(target, options);
        }

        /**
         * Specifies which HTML attributes to watch on the element.
         *
         * @internal
         * @return {string[]}
         */
        static get observedAttributes()
        {
            return options.attributes || [];
        }
    }));
}
