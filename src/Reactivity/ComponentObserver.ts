/* Byteshift Elements                                                              _         _             __   _ _____
 *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
 *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
 * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
 * See LICENSE for licensing information                                                |__/           E L E M E N T S
 */
'use strict';

import {AbstractComponent}          from '../Component/AbstractComponent';
import {bindElementValueToProperty} from '../Reactivity/PropertyToInputBinder';

export class ComponentObserver
{
    private properties: Map<string, TrackedProperty>              = new Map();
    private computedProperties: Map<string, Set<any>>             = new Map();
    private nodeEventMap: Map<HTMLElement, Map<string, Set<any>>> = new Map();
    private conditionals: Set<() => void>                         = new Set();

    constructor(public readonly component: AbstractComponent, private root: ShadowRoot)
    {
    }

    /**
     * Connects the observer to the associated component.
     * This should be executed once when the component is added to the DOM.
     */
    public connect(): void
    {
        this._initializeComponentReactivity();
        const templateNodes = this._iterateNode(this.root as any, this.component);

        if (typeof (this.component.constructor as any).__observerFunctions__ !== 'undefined') {
            (this.component.constructor as any).__observerFunctions__.forEach((ob: ObserverFunctionDecl) => {
                if (!this.properties.has(ob.propertyName)) {
                    throw new Error(
                        `Cannot watch property "${ob.propertyName}" through function ${ob.method}, because this property does not exist.`);
                }

                let isRunning: boolean = false;

                this.properties.get(ob.propertyName).listeners.add((v) => {
                    if (isRunning) {
                        return;
                    }
                    isRunning = true;
                    (this.component as any)[ob.method](v);
                    isRunning = false;
                });

                if (ob.immediate) {
                    if (isRunning) {
                        return;
                    }
                    isRunning = true;
                    (this.component as any)[ob.method](this.properties.get(ob.propertyName).value);
                    isRunning = false;
                }
            });
        }

        // Inject template nodes after iteration is complete due to
        // modifications made to the DOM while iterating through it.
        templateNodes.forEach((n) => this._injectPropertyReference(n.node, n.ctx));
        templateNodes.clear();

        // Execute conditional bindings (if-directives) as the very
        // last thing to do, since this may drastically modify the DOM.
        this.conditionals.forEach(fn => fn());
        this.conditionals.clear();
    }

    /**
     * Disconnects this observer from the component.
     * This should be executed once when the component is removed from the DOM.
     */
    public disconnect(): void
    {
        this.nodeEventMap.forEach((eventSet: Map<string, Set<any>>, node: HTMLElement) => {
            eventSet.forEach((listeners: Set<any>, eventName: string) => {
                listeners.forEach((listener: any) => {
                    node.removeEventListener(eventName, listener);
                });
            });
        });

        this.nodeEventMap.clear();
    }

    /**
     * Returns true if this observer is tracking a property with the given name.
     *
     * @param {string} name
     * @returns {boolean}
     */
    public hasProperty(name: string): boolean
    {
        return this.properties.has(name);
    }

    /**
     * Invokes the given listener if the property with the specified name is updated.
     *
     * @param {string} name
     * @param {(v: any) => any} listener
     */
    public addPropertyListener(name: string, listener: (v: any) => any): void
    {
        if (!this.hasProperty(name)) {
            throw new Error('Property "' + name + '" does not exist.');
        }

        this.properties.get(name).listeners.add(listener);
    }

    /**
     * Registers an event listener to the given node.
     *
     * @param {HTMLElement} node
     * @param {string} type
     * @param {(...args: any[]) => any} listener
     */
    public registerNodeEventListener(node: HTMLElement, type: string, listener: (...args: any[]) => any): void
    {
        if (!this.nodeEventMap.has(node)) {
            this.nodeEventMap.set(node, new Map());
        }

        if (!this.nodeEventMap.get(node).has(type)) {
            this.nodeEventMap.get(node).set(type, new Set());
        }

        this.nodeEventMap.get(node).get(type).add(listener);
        node.addEventListener(type, listener);
    }

    /**
     * Iterates over the given node recursively.
     *
     * Returns a set of nodes that require template processing.
     *
     * @param {ChildNode} node
     * @param context
     * @param templateNodes
     * @private
     */
    private _iterateNode(
        node: ChildNode,
        context: any,
        templateNodes: Set<any> = new Set(),
    ): Set<{ node: ChildNode, ctx: any }>
    {
        if ((node as any).hasAttribute && (node as HTMLElement).hasAttribute('iterate')) {
            this._createElementIterator(node as HTMLElement, context);
            return;
        }

        // Depth-first iteration due to the chance of DOM changes while connecting.
        node.childNodes.forEach((childNode: ChildNode) => this._iterateNode(childNode, context, templateNodes));

        // Handle text nodes.
        if (this._nodeHasPropertyReference(node)) {
            templateNodes.add({node, ctx: context});
        }

        // Handle element nodes.
        if (node.nodeType === 1) {
            const el: HTMLElement = node as HTMLElement;
            this._bindEventHandlersToNode(el, context);
            this._bindConditionalsToNode(el, context);
            this._bindPropertiesToNode(el, context);
            this._bindEvaluatedAttributesToNode(el, context);
            this._bindReactiveStyleToNode(el, context);
            this._bindReactiveClassesToNode(el, context);
        }

        return templateNodes;
    }

    /**
     * Binds evaulated classes to the given node.
     *
     * @param {HTMLElement} node
     * @param context
     * @private
     */
    private _bindReactiveClassesToNode(node: HTMLElement, context: any): void
    {
        if (! node.hasAttribute(':class')) {
            return;
        }

        const frag = node.getAttribute(':class');
        const deps  = this._findDependenciesInFragment(frag);
        const func  = new Function('obj', 'node', `with(obj) {
            const data = ${frag};
            Object.keys(data).forEach((key) => {
                if (data[key]) {
                    if (! node.classList.contains(key)) {
                        node.classList.add(key);
                    }
                } else {
                    if (node.classList.contains(key)) {
                        node.classList.remove(key);
                    }
                }
            });
        }`);

        const listener = () => func(context, node);

        deps.forEach((dep) => {
            if (this.properties.has(dep)) {
                this.properties.get(dep).listeners.add(listener);
            }
            if (this.computedProperties.has(dep)) {
                this.computedProperties.get(dep).add(listener);
            }
        });

        listener();
    }

    /**
     * Binds evaluated attributes to the given name.
     *
     * @param {HTMLElement} node
     * @param context
     * @private
     */
    private _bindEvaluatedAttributesToNode(node: HTMLElement, context: any): void
    {
        const attributeNames = node
            .getAttributeNames()
            .filter(n => n.startsWith(':') && n !== ':style' && n !== ':class')
            .map(n => n.substr(1));

        // Abort if there are no evaluated attributes.
        if (attributeNames.length === 0) {
            return;
        }

        attributeNames.forEach((attribute: string) => {
            const evaluation = node.getAttribute(':' + attribute);
            const func       = new Function('obj', `with(obj) { return ${evaluation}; }`);
            const deps       = this._findDependenciesInFragment(evaluation);
            const listener   = () => {
                node.setAttribute(attribute, func(context));
            }

            deps.forEach((dep) => {
                if (this.properties.has(dep)) {
                    this.properties.get(dep).listeners.add(listener);
                }
                if (this.computedProperties.has(dep)) {
                    this.computedProperties.get(dep).add(listener);
                }
            });

            listener();
        });
    }

    /**
     * Creates an element iterator based on the 'iterate' directive.
     *
     * @param {HTMLElement} node
     * @param {*}           context
     * @private
     */
    private _createElementIterator(node: HTMLElement, context: any): void
    {
        context = context || this.component;

        const iterator       = node.getAttribute('iterate');
        const insertionPoint = document.createComment('iterator:' + iterator);
        const split          = iterator.split(' in '),
              itemVar        = split[0]!.trim(),
              listVar        = split[1]!.trim();

        node.removeAttribute('iterate');
        node.replaceWith(insertionPoint);

        if (!itemVar || !listVar) {
            throw new Error(`Invalid syntax in iterate directive. Expected "item in items", got "${iterator}"`);
        }

        if (!this.hasProperty(listVar.trim())) {
            throw new Error(`Property "${listVar}" does not exist in ${this.component.constructor.name}.`);
        }

        const childNodes = new Map<any, ChildNode>();
        const factory    = () => {
            const items: any[]        = (context)[listVar];
            const usedItems: Set<any> = new Set();

            let lastChildNode: ChildNode = insertionPoint;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                usedItems.add(item);
                // Skip if this item is already present in the collection.
                if (childNodes.has(item)) {
                    lastChildNode = childNodes.get(item);
                    continue;
                }

                const tpl: ChildNode = node.cloneNode(true) as ChildNode;
                const ctx            = Object.assign(context, {[itemVar]: item});
                childNodes.set(item, tpl);

                insertionPoint.parentNode.insertBefore(tpl, lastChildNode.nextSibling);
                lastChildNode = tpl;

                const templateNodes = this._iterateNode(tpl, ctx);
                templateNodes.forEach((n) => this._injectPropertyReference(n.node, n.ctx));
                templateNodes.clear();
            }

            // Remove nodes that are no longer in the array.
            const toRemove: any[] = [];
            childNodes.forEach((node: ChildNode, item: any) => {
                if (!usedItems.has(item)) {
                    toRemove.push(item);
                }
            });
            toRemove.forEach((item) => {
                childNodes.get(item).remove();
                childNodes.delete(item);
            });

            // Clean up.
            toRemove.length = 0;
            usedItems.clear();
        };

        this.properties.get(listVar).listeners.add(factory);
        factory();
    }

    private _bindReactiveStyleToNode(node: HTMLElement, context: any): void
    {
        if (!node.hasAttribute(':style')) {
            return;
        }

        const style = node.getAttribute(':style');
        const deps  = this._findDependenciesInFragment(style);
        const func  = new Function('obj', 'node', `with(obj) {
            const data = ${style};
            Object.keys(data).forEach((key) => {
                node.style[key] = data[key];
            });
        }`);

        const listener = () => func(context, node);

        deps.forEach((dep) => {
            if (this.properties.has(dep)) {
                this.properties.get(dep).listeners.add(listener);
            }
            if (this.computedProperties.has(dep)) {
                this.computedProperties.get(dep).add(listener);
            }
        });

        listener();
    }

    /**
     * Binds the 'bind' directive to the given node.
     *
     * @param {HTMLElement} node
     * @param context
     * @private
     */
    private _bindPropertiesToNode(node: HTMLElement, context: any): void
    {
        if (!node.hasAttribute('bind')) {
            return;
        }

        bindElementValueToProperty(this, node, context);
    }

    /**
     * Binds conditional rendering directives to the given node. A conditional
     * statement is defined using the 'if' attribute. If the statement inside
     * the attributes resolves into a truthy value, the given node is rendered.
     *
     * @param {HTMLElement} node
     * @param context
     * @private
     */
    private _bindConditionalsToNode(node: HTMLElement, context: any): void
    {
        if (!node.hasAttribute('if')) {
            return;
        }

        const condition = node.getAttribute('if');
        const func      = new Function('obj', `with(obj) { return ${condition}; }`);
        const frag      = document.createComment(`{${node.tagName.toLowerCase()}}.if:(${condition})`);
        const deps      = this._findDependenciesInFragment(condition);

        const listener = () => {
            if (func(context)) {
                if (frag.parentNode) {
                    frag.replaceWith(node);
                }
                return;
            }

            node.replaceWith(frag);
        };

        deps.forEach((dep) => {
            if (this.properties.has(dep)) {
                this.properties.get(dep).listeners.add(listener);
            }
            if (this.computedProperties.has(dep)) {
                this.computedProperties.get(dep).add(listener);
            }
        });

        this.conditionals.add(listener);
    }

    /**
     * Binds event handlers to the given node.
     *
     * A event handler is an attribute starting with an '@'-sign, followed by
     * the name of the event. For example: <button @click="doSomething()">,
     * where 'doSomething' is a method that will be invoked on the component
     * when the button is clicked.
     *
     * @param {HTMLElement} node
     * @param context
     * @private
     */
    private _bindEventHandlersToNode(node: HTMLElement, context: any): void
    {
        const names = node.getAttributeNames();

        if (!this.nodeEventMap.has(node)) {
            this.nodeEventMap.set(node, new Map());
        }

        for (let i = 0; i < names.length; i++) {
            if (names[i].startsWith('@')) {
                // Make sure the method is executable.
                let method = node.getAttribute(names[i]);

                if (typeof (this.component as any)[method] === 'function') {
                    method = method + '($event instanceof CustomEvent ? $event.detail : $event)';
                }

                const event    = names[i].substr(1).toLowerCase();
                const func     = new Function('obj', '$event', `with(obj) { return ${method}; }`);
                const listener = (event: Event) => {
                    return func(context, event);
                };

                // Keep a reference of the listener.
                if (!this.nodeEventMap.get(node).has(event)) {
                    this.nodeEventMap.get(node).set(event, new Set());
                }
                this.nodeEventMap.get(node).get(event).add(listener);

                node.addEventListener(event, listener);
            }
        }
    }

    /**
     * Create reactivity functionality on the properties of the observed component.
     *
     * @private
     */
    private _initializeComponentReactivity()
    {
        const iterate = (name: string, descriptor: PropertyDescriptor) => {
            if (typeof descriptor.value !== 'undefined' && typeof descriptor.value !== 'function') {
                this._createReactiveProperty(name, descriptor);
            }
            if (typeof descriptor.get === 'function') {
                this._createComputedProperty(name, descriptor);
            }
        };

        const properties = Object.getOwnPropertyDescriptors(this.component);
        const methods    = Object.getOwnPropertyDescriptors(this.component.constructor.prototype);

        Object.keys(properties).forEach((property) => iterate(property, properties[property]));
        Object.keys(methods).forEach((method) => iterate(method, methods[method]));
    }

    /**
     * Makes the given property reactive, allowing callback functions to be
     * invoked when the value of the given property is changed.
     *
     * @param {string} name
     * @param {PropertyDescriptor} descriptor
     * @private
     */
    private _createReactiveProperty(name: string, descriptor: PropertyDescriptor): void
    {
        if (this.properties.has(name)) {
            return;
        }

        this.properties.set(name, {
            name:      name,
            value:     undefined,
            listeners: new Set(),
        });

        const initialValue = (this.component as any)[name];

        Object.defineProperty(this.component, name, {
            configurable: true,
            enumerable:   true,

            // Grab the value from the tracked property.
            get: () => {
                return this.properties.get(name).value;
            },

            // Update the value of the tracked property.
            set: (v: any) => {
                const prop = this.properties.get(name);
                prop.value = v;
                prop.listeners.forEach((listener) => listener(prop.value));

                if (Array.isArray(v)) {
                    this._bindCallbackOnArrayModifications(v, () => {
                        prop.listeners.forEach((listener) => listener(prop.value));
                    });
                }
            },
        });

        (this.component as any)[name] = initialValue;
    }

    /**
     * Binds the given callback to be invoked everytime the contents of the
     * given array is being changed.
     *
     * @param {ArrayLike<any>} arr
     * @param {() => any} callback
     * @private
     */
    private _bindCallbackOnArrayModifications(arr: ArrayLike<any>, callback: () => any)
    {
        ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach((m: string) => {
            (arr as any)[m] = function() {
                const res: any = (Array.prototype as any)[m].apply(arr, arguments);
                callback.apply(arr, arguments);
                return res;
            };
        });
    }


    /**
     * Makes the given 'getter' function reactive, allowing callback functions
     * to be invoked when the dependencies of a getter are changed.
     *
     * @param {string} name
     * @param {PropertyDescriptor} descriptor
     * @private
     */
    private _createComputedProperty(name: string, descriptor: PropertyDescriptor): void
    {
        if (this.computedProperties.has(name)) {
            return;
        }

        let src: string     = descriptor.get.toString(),
            split: RegExp   = /this\.([A-Za-z0-9_]+)/gmi,
            props: string[] = [],
            match: RegExpMatchArray;

        while (match = split.exec(src)) {
            const propName: string = match[1]!.trim();

            if (this.properties.has(propName)) {
                props.push(propName);
            }
        }

        // Create a listener for this getter that is invoked if any of the
        // referenced properties inside the getter are updated.
        this.computedProperties.set(name, new Set());

        // Bind the listener to the properties.
        props.forEach((propertyName) => {
            this.properties.get(propertyName).listeners.add(() => {
                this.computedProperties.get(name).forEach(l => l());
            });
        });
    }

    /**
     * Returns true if the text in this node has a reference to a component
     * property using template syntax: {{ nameHere }}.
     *
     * @param {ChildNode} node
     * @returns {boolean}
     * @private
     */
    private _nodeHasPropertyReference(node: ChildNode): boolean
    {
        return (node.nodeType === 3 && node.textContent.indexOf('{{') !== -1 && node.textContent.indexOf('}}') !== -1);
    }

    /**
     * Modifies the DOM of the given Node (type = Text) by replacing a template
     * fragment with a new text node that will render the value of the referenced
     * property reactively.
     *
     * @param {Node} node
     * @param {*}    context
     * @private
     */
    private _injectPropertyReference(node: ChildNode, context: any): void
    {
        let source: string     = node.textContent,
            buffer: string     = '',
            nodes: ChildNode[] = [];

        for (let i = 0; i < source.length; i++) {
            const currChar = source[i],
                  nextChar = source[i + 1];

            if (currChar === '{' && nextChar === '{') {
                i += 1;
                nodes.push(document.createTextNode(buffer));
                buffer = '';
                continue;
            }

            if (currChar === '}' && nextChar === '}') {
                i += 1;
                const fragment = buffer.trim();
                nodes.push(this._createReactiveTextNode(fragment, context));
                buffer = '';
                continue;
            }

            buffer += currChar;
        }

        // Add the remaining buffer to a node.
        if (buffer.length > 0) {
            nodes.push(document.createTextNode(buffer));
        }

        // Replace the initial text node with the one ones.
        let firstNode = nodes.shift(),
            lastNode  = firstNode;

        node.replaceWith(firstNode);
        nodes.forEach((node) => {
            lastNode.parentNode.insertBefore(node, lastNode.nextSibling);
            lastNode = node;
        });

        nodes.length = 0; // Clear.
    }

    /**
     * Creates a reactive text node based on the given fragment.
     *
     * @param {string} fragment
     * @param {*}      context
     * @returns {ChildNode}
     * @private
     */
    private _createReactiveTextNode(fragment: string, context: any): ChildNode
    {
        const func = new Function('obj', `with(obj) { return ${fragment}; }`);
        const node = document.createTextNode(func(context));
        const deps = this._findDependenciesInFragment(fragment);

        // Create a listener that will update the contents of the node.
        const listener = () => {
            node.textContent = func(this.component);
        };

        // Find all references to property names inside the given fragment.
        deps.forEach((dep: string) => {
            if (this.properties.has(dep)) {
                this.properties.get(dep).listeners.add(listener);
            }
            if (this.computedProperties.has(dep)) {
                this.computedProperties.get(dep).add(listener);
            }
        });

        return node;
    }

    /**
     * Returns a list of referenced properties or getters from the given
     * fragment source.
     *
     * @param {string} fragment
     * @returns {string[]}
     * @private
     */
    private _findDependenciesInFragment(fragment: string): string[]
    {
        const regExp: RegExp   = /([A-Za-z][\w]+)/gm;
        const result: string[] = [];

        let match;
        while (match = regExp.exec(fragment)) {
            const possibleRef: string = match[1];
            if (this.properties.has(possibleRef)) {
                result.push(possibleRef);
            } else {
                if (this.computedProperties.has(possibleRef)) {
                    result.push(possibleRef);
                }
            }
        }

        return result;
    }
}

type TrackedProperty = {
    name: string,
    value: any,
    listeners: Set<((v: any) => any)>
}

type ObserverFunctionDecl = {
    propertyName: string;
    immediate: boolean;
    method: string;
}
