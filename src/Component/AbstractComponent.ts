/* Byteshift Elements                                                              _         _             __   _ _____
 *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
 *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
 * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
 * See LICENSE for licensing information                                                |__/           E L E M E N T S
 */
'use strict';

import {ComponentOptions}  from '../Decorator/Component';
import {ComponentObserver} from '../Reactivity/ComponentObserver';
import {composeStylesheet} from '../Stylesheet/StylesheetFactory';

export abstract class AbstractComponent
{
    protected readonly $root: ShadowRoot;

    private readonly $style: CSSStyleSheet;
    private readonly $observer: ComponentObserver;

    constructor(private readonly $$: HTMLElement, options: ComponentOptions)
    {
        this.$root           = $$.attachShadow({mode: 'open'});
        this.$observer       = new ComponentObserver(this, this.$root);
        this.$root.innerHTML = options.template;
        this.$style          = composeStylesheet(this.$root, options.stylesheet || {});
    }

    /**
     * Invoked when the object is created or reconnected to the DOM.
     */
    public onCreate(): void
    {
        // NO-OP
    }

    /**
     * Invoked when the object is destroyed or disconnected from the DOM.
     */
    public onDestroy(): void
    {
        // NO-OP
    }

    /**
     * Returns the observer associated with this component.
     *
     * @returns {ComponentObserver}
     */
    public get __observer__(): ComponentObserver
    {
        return this.$observer;
    }

    /**
     * Returns the host element.
     *
     * @returns {Element}
     * @protected
     */
    protected get $host(): Element
    {
        return this.$root.host;
    }

    /**
     * Returns an HTML element from this component based on the given selector.
     *
     * @param {string} selector
     * @returns {HTMLElement}
     * @protected
     */
    protected $query(selector: string): HTMLElement
    {
        return this.$root.querySelector(selector);
    }

    /**
     * Returns a list of matching HTML elements based on the given selector
     * from this component.
     *
     * @param {string} selector
     * @returns {HTMLElement[]}
     * @protected
     */
    protected $queryAll(selector: string): HTMLElement[]
    {
        return Array.from(this.$root.querySelectorAll(selector));
    }

    /**
     * Returns a component reference from the given selector.
     *
     * If the selector doesn't match any element, or the matched element isn't
     * a component, undefined is returned instead.
     *
     * @param {string} selector
     * @returns {T | undefined}
     * @protected
     */
    protected $ref<T>(selector: string): T | undefined
    {
        const el = this.$query(selector);
        if (!el) {
            return undefined;
        }

        if (typeof (el as any).__component__ === 'undefined') {
            return undefined;
        }

        return (el as any).__component__ as T;
    }

    /**
     * Emits a CustomEvent with the given name and data.
     *
     * @param {string} eventName
     * @param {*}      data
     * @protected
     */
    protected $emit(eventName: string, data: any): void
    {
        const event = new CustomEvent(eventName.toLowerCase(), {
            bubbles:    true,
            composed:   true,
            cancelable: false,
            detail:     data,
        });

        this.$root.dispatchEvent(event);
    }
}
