/* Byteshift Elements                                                              _         _             __   _ _____
*    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
*                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
* (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
* See LICENSE for licensing information                                                |__/           E L E M E N T S
*/
'use strict';

import {AbstractComponent} from '@/Component/AbstractComponent';
import {ComponentOptions}  from '@/Decorator/Component';

export abstract class ComponentElement extends HTMLElement
{
    private __constructor__: any;
    private __component__: AbstractComponent;
    private __attributes__: { [name: string]: any } = {};
    private __mountTimer__: any;

    protected constructor(Component: typeof AbstractComponent & any, options: ComponentOptions)
    {
        super();
        this.__constructor__ = {c: Component, o: options};
    }

    /**
     * Resolves the returned promise on the next tick of the event loop.
     *
     * @returns {Promise<void>}
     * @protected
     */
    protected $nextTick(): Promise<void>
    {
        return new Promise((resolve) => window.setTimeout(() => resolve(), 0));
    }

    /**
     *  Invoked each time the custom element is appended into a document-connected element. This will happen each
     *  time the node is moved, and may happen before the element's contents have been fully parsed.
     *
     *  @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
     */
    private connectedCallback()
    {
        if (!this.isConnected) {
            return;
        }

        if (typeof this.__component__ === 'undefined') {
            const Component = this.__constructor__.c,
                  options   = this.__constructor__.o;

            delete this.__constructor__;

            this.__component__ = new Component(this, options);
        }

        Object.keys(this.__attributes__).forEach((key) => {
            (this.__component__ as any)[key] = this.__attributes__[key];
        });

        this.__component__.__observer__.connect();

        clearTimeout(this.__mountTimer__);

        // Invoke onCreate on the next tick.
        this.__mountTimer__ = setTimeout(() => {
            (this.__component__ as any).__is_mounted__ = true;
            this.__component__.onCreate();
        }, 0);
    }

    /**
     * Invoked each time the custom element is disconnected from the document's DOM.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
     */
    private disconnectedCallback()
    {
        clearTimeout(this.__mountTimer__);
        (this.__component__ as any).__is_mounted__ = false;

        if (this.__component__) {
            this.__component__.onDestroy();
            this.__component__.__observer__.disconnect();
        }
    }

    /**
     * Invoked whenever one of the element's attributes is changed in some way.
     *
     * @param {string} name
     * @param {*} oldValue
     * @param {*} newValue
     */
    private attributeChangedCallback(name: string, oldValue: any, newValue: any)
    {
        const tmp          = name.replace(
            /([-_][a-z])/g,
            (group: string) => group.toUpperCase()
                .replace('-', '')
                .replace('_', ''),
        );
        const propertyName = tmp.charAt(0).toLowerCase() + tmp.substr(1);

        if (oldValue !== newValue) {
            this.__attributes__[propertyName] = newValue;

            if (this.__component__) {
                (this.__component__ as any)[propertyName] = newValue;
            }
        }
    }
}
