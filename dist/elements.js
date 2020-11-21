(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ByteshiftElements = {}));
}(this, (function (exports) { 'use strict';

    /* Byteshift Elements                                                              _         _             __   _ _____
    *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
    *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
    * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
    * See LICENSE for licensing information                                                |__/           E L E M E N T S
    */
    class ComponentElement extends HTMLElement {
        constructor(Component, options) {
            super();
            this.__attributes__ = {};
            this.__constructor__ = { c: Component, o: options };
        }
        /**
         * Resolves the returned promise on the next tick of the event loop.
         *
         * @returns {Promise<void>}
         * @protected
         */
        $nextTick() {
            return new Promise((resolve) => window.setTimeout(() => resolve(), 0));
        }
        /**
         *  Invoked each time the custom element is appended into a document-connected element. This will happen each
         *  time the node is moved, and may happen before the element's contents have been fully parsed.
         *
         *  @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
         */
        connectedCallback() {
            if (!this.isConnected) {
                return;
            }
            if (typeof this.__component__ === 'undefined') {
                const Component = this.__constructor__.c, options = this.__constructor__.o;
                delete this.__constructor__;
                this.__component__ = new Component(this, options);
            }
            Object.keys(this.__attributes__).forEach((key) => {
                this.__component__[key] = this.__attributes__[key];
            });
            this.__component__.__observer__.connect();
            this.__component__.onCreate();
        }
        /**
         * Invoked each time the custom element is disconnected from the document's DOM.
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
         */
        disconnectedCallback() {
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
        attributeChangedCallback(name, oldValue, newValue) {
            const tmp = name.replace(/([-_][a-z])/g, (group) => group.toUpperCase()
                .replace('-', '')
                .replace('_', ''));
            const propertyName = tmp.charAt(0).toLowerCase() + tmp.substr(1);
            if (oldValue !== newValue) {
                this.__attributes__[propertyName] = newValue;
                if (this.__component__) {
                    this.__component__[propertyName] = newValue;
                }
            }
        }
    }

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    const __registry__ = new Set();
    function registerComponent(target, options) {
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
            static get observedAttributes() {
                return options.attributes || [];
            }
        }));
    }

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    /**
     * Configures the decorated class to function as a native web component.
     *
     * @param {ComponentOptions} options
     * @returns {(target: AbstractComponent) => void}
     * @constructor
     */
    function Component(options) {
        return (target) => {
            registerComponent(target, options);
        };
    }

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    function Watch(propertyName, immediate = true) {
        return (target, propertyKey) => {
            if (typeof target.constructor.__observerFunctions__ === 'undefined') {
                Object.defineProperty(target.constructor, '__observerFunctions__', {
                    enumerable: false,
                    configurable: false,
                    value: [],
                });
            }
            target.constructor.__observerFunctions__.push({
                propertyName: propertyName,
                immediate: immediate,
                method: propertyKey,
            });
        };
    }

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    /**
     * Binds the given node to a property inside the component.
     *
     * @param {ComponentObserver} observer
     * @param {HTMLElement} node
     * @param context
     */
    function bindElementValueToProperty(observer, node, context) {
        const propertyName = node.getAttribute('bind');
        const tagName = node.tagName.toLowerCase();
        // Make sure the property exists.
        if (!observer.hasProperty(propertyName)) {
            throw new Error(`Cannot bind ${node.tagName.toLowerCase()} element to property ${propertyName}. This property does not exist.`);
        }
        if (tagName === 'input') {
            const type = (node.getAttribute('type') || 'text').toLowerCase();
            const el = node;
            switch (type) {
                case 'checkbox':
                    bindCheckboxElement(observer, el, propertyName, context);
                    return;
                case 'text':
                case 'password':
                case 'color':
                    bindInputTextElement(observer, el, propertyName, context);
                    return;
                case 'number':
                    bindInputNumberElement(observer, el, propertyName, context);
                    return;
                case 'radio':
                    bindInputRadioElement(observer, el, propertyName, context);
                    return;
                default:
                    console.warn(`Unknown input element type: "${type}".`);
            }
            return;
        }
        if (tagName === 'textarea') {
            return bindTextareaElement(observer, node, propertyName, context);
        }
        if (tagName === 'select') {
            return bindSelectToElement(observer, node, propertyName, context);
        }
    }
    /**
     * Binds a select element to the property.
     *
     * @param {ComponentObserver} observer
     * @param {HTMLInputElement}  node
     * @param {string}            propertyName
     * @param context
     */
    function bindSelectToElement(observer, node, propertyName, context) {
        if (node.hasAttribute('items')) {
            const itemPropertyName = node.getAttribute('items');
            if (!observer.hasProperty(itemPropertyName)) {
                throw new Error(`The items property "${itemPropertyName}" does not exist on the component ${(observer.component.constructor.name)}.`);
            }
            const itemFactory = () => {
                const items = context[itemPropertyName];
                const itemValue = node.getAttribute('value-name') || 'value';
                const itemLabel = node.getAttribute('label-name') || 'label';
                node.innerHTML = '';
                if (Array.isArray(items)) {
                    items.forEach((item) => {
                        const option = document.createElement('option');
                        if (typeof item === 'object') {
                            option.innerText = item[itemLabel];
                            option.value = item[itemValue];
                        }
                        else {
                            option.innerText = item;
                            option.value = item;
                        }
                        node.appendChild(option);
                    });
                }
                else {
                    if (typeof items === 'object') {
                        Object.keys(items).forEach((key) => {
                            const option = document.createElement('option');
                            option.innerText = key;
                            option.value = items[key];
                            node.appendChild(option);
                        });
                    }
                    else {
                        throw new Error(`Items property ${itemPropertyName} must be either an array or object.`);
                    }
                }
                // Update the selected value.
                node.value = context[propertyName];
            };
            observer.addPropertyListener(itemPropertyName, itemFactory);
            itemFactory();
        }
        observer.registerNodeEventListener(node, 'change', () => {
            if (context[propertyName] !== node.value) {
                context[propertyName] = node.value;
            }
        });
        const listener = (v) => {
            if (node.value !== v) {
                node.value = v;
            }
        };
        observer.addPropertyListener(propertyName, listener);
        listener(context[propertyName]);
    }
    /**
     * Binds a textarea element to the property.
     *
     * @param {ComponentObserver} observer
     * @param {HTMLInputElement}  node
     * @param {string}            propertyName
     * @param context
     */
    function bindTextareaElement(observer, node, propertyName, context) {
        observer.registerNodeEventListener(node, 'change', () => {
            if (context[propertyName] !== node.value) {
                context[propertyName] = node.value;
            }
        });
        observer.registerNodeEventListener(node, 'input', () => {
            if (context[propertyName] !== node.value) {
                context[propertyName] = node.value;
            }
        });
        const listener = (v) => {
            if (node.value !== v) {
                node.value = v;
            }
        };
        observer.addPropertyListener(propertyName, listener);
        listener(context[propertyName]);
    }
    /**
     * Binds a radio input element to the property.
     *
     * @param {ComponentObserver} observer
     * @param {HTMLInputElement}  node
     * @param {string}            propertyName
     * @param context
     */
    function bindInputRadioElement(observer, node, propertyName, context) {
        observer.registerNodeEventListener(node, 'change', () => {
            if (context[propertyName] !== node.value) {
                context[propertyName] = node.value;
            }
        });
        const listener = (v) => {
            if (v === node.value) {
                if (!node.checked) {
                    node.checked = true;
                }
            }
            else {
                if (node.checked) {
                    node.checked = false;
                }
            }
        };
        observer.addPropertyListener(propertyName, listener);
        listener(context[propertyName]);
    }
    /**
     * Binds a checkbox element to the property.
     *
     * @param {ComponentObserver} observer
     * @param {HTMLInputElement}  node
     * @param {string}            propertyName
     * @param context
     */
    function bindCheckboxElement(observer, node, propertyName, context) {
        observer.registerNodeEventListener(node, 'change', () => {
            if (context[propertyName] !== node.checked) {
                context[propertyName] = node.checked;
            }
        });
        observer.addPropertyListener(propertyName, (v) => {
            if (node.checked !== v) {
                node.checked = v;
            }
        });
        node.checked = !!context[propertyName];
    }
    /**
     * Binds a text input element to the given property.
     *
     * @param {ComponentObserver} observer
     * @param {HTMLInputElement} node
     * @param {string} propertyName
     * @param context
     */
    function bindInputTextElement(observer, node, propertyName, context) {
        observer.registerNodeEventListener(node, 'input', () => {
            if (context[propertyName] !== node.value) {
                context[propertyName] = node.value;
            }
        });
        observer.registerNodeEventListener(node, 'change', () => {
            if (context[propertyName] !== node.value) {
                context[propertyName] = node.value;
            }
        });
        observer.addPropertyListener(propertyName, (v) => {
            if (node.checked !== v) {
                node.checked = v;
            }
        });
        node.value = context[propertyName];
        node.setAttribute('value', context[propertyName]);
    }
    /**
     * Binds a number input element to the given property.
     *
     * @param {ComponentObserver} observer
     * @param {HTMLInputElement} node
     * @param {string} propertyName
     * @param context
     */
    function bindInputNumberElement(observer, node, propertyName, context) {
        observer.registerNodeEventListener(node, 'input', () => {
            const v = parseFloat(node.value);
            if (context[propertyName] !== v) {
                context[propertyName] = v;
            }
        });
        observer.addPropertyListener(propertyName, (v) => {
            if (node.checked !== v) {
                node.checked = v;
            }
        });
        node.value = context[propertyName];
    }

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    class ComponentObserver {
        constructor(component, root) {
            this.component = component;
            this.root = root;
            this.properties = new Map();
            this.computedProperties = new Map();
            this.nodeEventMap = new Map();
            this.conditionals = new Set();
        }
        /**
         * Connects the observer to the associated component.
         * This should be executed once when the component is added to the DOM.
         */
        connect() {
            this._initializeComponentReactivity();
            const templateNodes = this._iterateNode(this.root, this.component);
            if (typeof this.component.constructor.__observerFunctions__ !== 'undefined') {
                this.component.constructor.__observerFunctions__.forEach((ob) => {
                    if (!this.properties.has(ob.propertyName)) {
                        throw new Error(`Cannot watch property "${ob.propertyName}" through function ${ob.method}, because this property does not exist.`);
                    }
                    let isRunning = false;
                    this.properties.get(ob.propertyName).listeners.add((v) => {
                        if (isRunning) {
                            return;
                        }
                        isRunning = true;
                        this.component[ob.method](v);
                        isRunning = false;
                    });
                    if (ob.immediate) {
                        if (isRunning) {
                            return;
                        }
                        isRunning = true;
                        this.component[ob.method](this.properties.get(ob.propertyName).value);
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
        disconnect() {
            this.nodeEventMap.forEach((eventSet, node) => {
                eventSet.forEach((listeners, eventName) => {
                    listeners.forEach((listener) => {
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
        hasProperty(name) {
            return this.properties.has(name);
        }
        /**
         * Invokes the given listener if the property with the specified name is updated.
         *
         * @param {string} name
         * @param {(v: any) => any} listener
         */
        addPropertyListener(name, listener) {
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
        registerNodeEventListener(node, type, listener) {
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
        _iterateNode(node, context, templateNodes = new Set()) {
            if (node.hasAttribute && node.hasAttribute('iterate')) {
                this._createElementIterator(node, context);
                return;
            }
            // Depth-first iteration due to the chance of DOM changes while connecting.
            node.childNodes.forEach((childNode) => this._iterateNode(childNode, context, templateNodes));
            // Handle text nodes.
            if (this._nodeHasPropertyReference(node)) {
                templateNodes.add({ node, ctx: context });
            }
            // Handle element nodes.
            if (node.nodeType === 1) {
                const el = node;
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
        _bindReactiveClassesToNode(node, context) {
            if (!node.hasAttribute(':class')) {
                return;
            }
            const frag = node.getAttribute(':class');
            const deps = this._findDependenciesInFragment(frag);
            const func = new Function('obj', 'node', `with(obj) {
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
        _bindEvaluatedAttributesToNode(node, context) {
            const attributeNames = node
                .getAttributeNames()
                .filter(n => n.startsWith(':') && n !== ':style' && n !== ':class')
                .map(n => n.substr(1));
            // Abort if there are no evaluated attributes.
            if (attributeNames.length === 0) {
                return;
            }
            attributeNames.forEach((attribute) => {
                const evaluation = node.getAttribute(':' + attribute);
                const func = new Function('obj', `with(obj) { return ${evaluation}; }`);
                const deps = this._findDependenciesInFragment(evaluation);
                const listener = () => {
                    node.setAttribute(attribute, func(context));
                };
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
        _createElementIterator(node, context) {
            context = context || this.component;
            const iterator = node.getAttribute('iterate');
            const insertionPoint = document.createComment('iterator:' + iterator);
            const split = iterator.split(' in '), itemVar = split[0].trim(), listVar = split[1].trim();
            node.removeAttribute('iterate');
            node.replaceWith(insertionPoint);
            if (!itemVar || !listVar) {
                throw new Error(`Invalid syntax in iterate directive. Expected "item in items", got "${iterator}"`);
            }
            if (!this.hasProperty(listVar.trim())) {
                throw new Error(`Property "${listVar}" does not exist in ${this.component.constructor.name}.`);
            }
            const childNodes = new Map();
            const factory = () => {
                const items = (context)[listVar];
                const usedItems = new Set();
                let lastChildNode = insertionPoint;
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    usedItems.add(item);
                    // Skip if this item is already present in the collection.
                    if (childNodes.has(item)) {
                        lastChildNode = childNodes.get(item);
                        continue;
                    }
                    const tpl = node.cloneNode(true);
                    const ctx = Object.assign(context, { [itemVar]: item });
                    childNodes.set(item, tpl);
                    insertionPoint.parentNode.insertBefore(tpl, lastChildNode.nextSibling);
                    lastChildNode = tpl;
                    const templateNodes = this._iterateNode(tpl, ctx);
                    templateNodes.forEach((n) => this._injectPropertyReference(n.node, n.ctx));
                    templateNodes.clear();
                }
                // Remove nodes that are no longer in the array.
                const toRemove = [];
                childNodes.forEach((node, item) => {
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
        _bindReactiveStyleToNode(node, context) {
            if (!node.hasAttribute(':style')) {
                return;
            }
            const style = node.getAttribute(':style');
            const deps = this._findDependenciesInFragment(style);
            const func = new Function('obj', 'node', `with(obj) {
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
        _bindPropertiesToNode(node, context) {
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
        _bindConditionalsToNode(node, context) {
            if (!node.hasAttribute('if')) {
                return;
            }
            const condition = node.getAttribute('if');
            const func = new Function('obj', `with(obj) { return ${condition}; }`);
            const frag = document.createComment(`{${node.tagName.toLowerCase()}}.if:(${condition})`);
            const deps = this._findDependenciesInFragment(condition);
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
        _bindEventHandlersToNode(node, context) {
            const names = node.getAttributeNames();
            if (!this.nodeEventMap.has(node)) {
                this.nodeEventMap.set(node, new Map());
            }
            for (let i = 0; i < names.length; i++) {
                if (names[i].startsWith('@')) {
                    // Make sure the method is executable.
                    let method = node.getAttribute(names[i]);
                    if (typeof this.component[method] === 'function') {
                        method = method + '($event instanceof CustomEvent ? $event.detail : $event)';
                    }
                    const event = names[i].substr(1).toLowerCase();
                    const func = new Function('obj', '$event', `with(obj) { return ${method}; }`);
                    const listener = (event) => {
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
        _initializeComponentReactivity() {
            const iterate = (name, descriptor) => {
                if (typeof descriptor.value !== 'undefined' && typeof descriptor.value !== 'function') {
                    this._createReactiveProperty(name, descriptor);
                }
                if (typeof descriptor.get === 'function') {
                    this._createComputedProperty(name, descriptor);
                }
            };
            const properties = Object.getOwnPropertyDescriptors(this.component);
            const methods = Object.getOwnPropertyDescriptors(this.component.constructor.prototype);
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
        _createReactiveProperty(name, descriptor) {
            if (this.properties.has(name)) {
                return;
            }
            this.properties.set(name, {
                name: name,
                value: undefined,
                listeners: new Set(),
            });
            const initialValue = this.component[name];
            Object.defineProperty(this.component, name, {
                configurable: true,
                enumerable: true,
                // Grab the value from the tracked property.
                get: () => {
                    return this.properties.get(name).value;
                },
                // Update the value of the tracked property.
                set: (v) => {
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
            this.component[name] = initialValue;
        }
        /**
         * Binds the given callback to be invoked everytime the contents of the
         * given array is being changed.
         *
         * @param {ArrayLike<any>} arr
         * @param {() => any} callback
         * @private
         */
        _bindCallbackOnArrayModifications(arr, callback) {
            ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach((m) => {
                arr[m] = function () {
                    const res = Array.prototype[m].apply(arr, arguments);
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
        _createComputedProperty(name, descriptor) {
            if (this.computedProperties.has(name)) {
                return;
            }
            let src = descriptor.get.toString(), split = /this\.([A-Za-z0-9_]+)/gmi, props = [], match;
            while (match = split.exec(src)) {
                const propName = match[1].trim();
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
        _nodeHasPropertyReference(node) {
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
        _injectPropertyReference(node, context) {
            let source = node.textContent, buffer = '', nodes = [];
            for (let i = 0; i < source.length; i++) {
                const currChar = source[i], nextChar = source[i + 1];
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
            let firstNode = nodes.shift(), lastNode = firstNode;
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
        _createReactiveTextNode(fragment, context) {
            const func = new Function('obj', `with(obj) { return ${fragment}; }`);
            const node = document.createTextNode(func(context));
            const deps = this._findDependenciesInFragment(fragment);
            // Create a listener that will update the contents of the node.
            const listener = () => {
                node.textContent = func(this.component);
            };
            // Find all references to property names inside the given fragment.
            deps.forEach((dep) => {
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
        _findDependenciesInFragment(fragment) {
            const regExp = /([A-Za-z][\w]+)/gm;
            const result = [];
            let match;
            while (match = regExp.exec(fragment)) {
                const possibleRef = match[1];
                if (this.properties.has(possibleRef)) {
                    result.push(possibleRef);
                }
                else {
                    if (this.computedProperties.has(possibleRef)) {
                        result.push(possibleRef);
                    }
                }
            }
            return result;
        }
    }

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    function composeStylesheet(root, componentStylesheet) {
        let style = document.createElement('style');
        style.appendChild(document.createTextNode(''));
        root.appendChild(style);
        const sheet = root.styleSheets[0];
        _parseStyleDeclaration(componentStylesheet, [':host'], sheet);
        return sheet;
    }
    function _parseStyleDeclaration(stylesheet, parents, sheet) {
        const selector = [];
        parents.forEach((p) => {
            if (p.startsWith(':') || p.startsWith('.')) {
                selector.push(p);
            }
            else {
                selector.push(' ' + p.trim());
            }
        });
        let rule = selector.join('') + ' {';
        Object.keys(stylesheet).forEach((selector) => {
            if (typeof stylesheet[selector] === 'object') {
                parents.push(selector);
                _parseStyleDeclaration(stylesheet[selector], parents, sheet);
                parents.pop();
                return;
            }
            rule += (selector.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`)) + ': ' + stylesheet[selector] + ';';
        });
        rule += '}';
        if (rule.trim() !== '{}') {
            sheet.insertRule(rule);
        }
        return rule;
    }

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    class AbstractComponent {
        constructor($$, options) {
            this.$$ = $$;
            this.$root = $$.attachShadow({ mode: 'open' });
            this.$observer = new ComponentObserver(this, this.$root);
            this.$root.innerHTML = options.template;
            this.$style = composeStylesheet(this.$root, options.stylesheet || {});
        }
        /**
         * Invoked when the object is created or reconnected to the DOM.
         */
        onCreate() {
            // NO-OP
        }
        /**
         * Invoked when the object is destroyed or disconnected from the DOM.
         */
        onDestroy() {
            // NO-OP
        }
        /**
         * Returns the observer associated with this component.
         *
         * @returns {ComponentObserver}
         */
        get __observer__() {
            return this.$observer;
        }
        /**
         * Returns an HTML element from this component based on the given selector.
         *
         * @param {string} selector
         * @returns {HTMLElement}
         * @protected
         */
        $query(selector) {
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
        $queryAll(selector) {
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
        $ref(selector) {
            const el = this.$query(selector);
            if (!el) {
                return undefined;
            }
            if (typeof el.__component__ === 'undefined') {
                return undefined;
            }
            return el.__component__;
        }
        /**
         * Emits a CustomEvent with the given name and data.
         *
         * @param {string} eventName
         * @param {*}      data
         * @protected
         */
        $emit(eventName, data) {
            const event = new CustomEvent(eventName.toLowerCase(), {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: data,
            });
            this.$root.dispatchEvent(event);
        }
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    exports.HelloWorld = class HelloWorld extends AbstractComponent {
        constructor() {
            super(...arguments);
            this.myText = '';
            this.wordCount = 0;
        }
        onTextChanged(newVal) {
            this.wordCount = newVal.split(' ').filter(word => word.length > 0).length;
        }
    };
    __decorate([
        Watch('myText'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", void 0)
    ], exports.HelloWorld.prototype, "onTextChanged", null);
    exports.HelloWorld = __decorate([
        Component({
            selector: 'hello-world',
            template: `
    <textarea bind="myText"></textarea>
    <div>Word count: {{ wordCount }}</div>
    `,
        })
    ], exports.HelloWorld);

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    exports.FormTest = class FormTest extends AbstractComponent {
        constructor() {
            super(...arguments);
            this.xTitle = 'Untitled';
            this.isChecked = false;
            this.someText = '';
            this.someNumber = 1.0;
            this.someColor = '#ff0000';
            this.someRadioValue = 'Two';
            this.selectSimple = 'Second';
            this.selectAdv = '';
            this.selectAdvItems = ['A', 'B', 'C'];
        }
        get multipliedNumber() {
            return this.someNumber * this.someNumber;
        }
        addRandomItem() {
            this.selectAdvItems.push('X-' + (Math.floor(Math.random() * 65535)));
        }
        onColorChanged(newVal) {
            this.$emit('colorchanged', newVal);
        }
    };
    __decorate([
        Watch('someColor'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", void 0)
    ], exports.FormTest.prototype, "onColorChanged", null);
    exports.FormTest = __decorate([
        Component({
            selector: 'form-test',
            attributes: ['x-title'],
            template: `
        <table style="width: 100%;margin: 10px;">
            <tr><td colspan="2"><h3>{{ xTitle }}</h3><slot></slot><hr style="width: 100%;"></td></tr>
            <tr>
                <td>
                    <input type="checkbox" bind="isChecked" id="checked"/>
                    <label for="checked">Check me!</label>
                </td>
                <td>
                    {{ isChecked }}
                    <b if="isChecked">IT IS CHECKED!</b>
                </td>
            </tr>
            <tr>
                <td>
                    <input type="text" bind="someText"/>
                </td>
                <td>
                    <i>You typed: "{{ someText }}"</i>
                </td>
            </tr>
            <tr>
                <td>
                    <input type="number" bind="someNumber"/>
                </td>
                <td>
                    <i if="! isNaN(someNumber)">{{ multipliedNumber }}</i>
                </td>
            </tr>
            <tr><td colspan="2">
                <div iterate="item in selectAdvItems">{{ item }}</div>
            </td></tr>
            <tr>
                <td>
                    <input type="color" bind="someColor"/>
                </td>
                <td>
                    <span
                        style="display: inline-block; width: 64px; height: 24px; border: 1px solid #fff;"
                        :style="{backgroundColor: someColor}"
                    >
                        {{ someColor }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    Pick one: "{{ someRadioValue }}"
                </td>
                <td>
                    <input type="radio" name="radio1" bind="someRadioValue" value="One" id="r1"><label for="r1">One</label>
                    <input type="radio" name="radio1" bind="someRadioValue" value="Two" id="r2"><label for="r2">Two</label>
                    <input type="radio" name="radio1" bind="someRadioValue" value="Three" id="r3"><label for="r3">Three</label>
                    
                    <select bind="someRadioValue">
                        <option value="One">First one</option>
                        <option value="Two">Second one</option>
                        <option value="Three">Third one</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    Pick one: "{{ selectSimple }}"
                </td>
                <td>
                    <select bind="selectSimple">
                        <option value="First">First one</option>
                        <option value="Second">Second one</option>
                        <option value="Third">Third one</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    You selected: "{{ selectAdv }}"
                </td>
                <td>
                    <select bind="selectAdv" items="selectAdvItems"></select>
                    <button @click="addRandomItem()">Add item</button>
                </td>
            </tr>
        </table>
    `,
        })
    ], exports.FormTest);

    exports.AbstractComponent = AbstractComponent;
    exports.Component = Component;
    exports.Watch = Watch;
    exports.registerComponent = registerComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=elements.js.map
