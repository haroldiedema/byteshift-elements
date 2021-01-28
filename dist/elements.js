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
            clearTimeout(this.__mountTimer__);
            // Invoke onCreate on the next tick.
            this.__mountTimer__ = setTimeout(() => {
                this.__component__.__is_mounted__ = true;
                this.__component__.onCreate();
            }, 0);
        }
        /**
         * Invoked each time the custom element is disconnected from the document's DOM.
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
         */
        disconnectedCallback() {
            clearTimeout(this.__mountTimer__);
            this.__component__.__is_mounted__ = false;
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
            Object.defineProperty(target, '__be_component__', {
                configurable: false,
                enumerable: false,
                get() {
                    return options;
                }
            });
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
                case 'time':
                case 'date':
                case 'datetime':
                    bindInputTextElement(observer, el, propertyName, context);
                    return;
                case 'number':
                case 'range':
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
            if (node.value !== v) {
                node.value = v;
            }
        });
        node.setAttribute('value', context[propertyName]);
        node.value = context[propertyName];
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
            if (node.value !== v) {
                node.value = v;
            }
        });
        node.setAttribute('value', context[propertyName]);
        node.value = context[propertyName];
    }

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    class ComponentObserver {
        constructor(component, root, attributes) {
            this.component = component;
            this.root = root;
            this.attributes = attributes;
            this.properties = new Map();
            this.computedProperties = new Map();
            this.nodeEventMap = new Map();
            this.conditionals = new Set();
            this.textNodeListeners = new Set();
        }
        /**
         * Connects the observer to the associated component.
         * This should be executed once when the component is added to the DOM.
         */
        connect() {
            this._initializeComponentReactivity();
            const templateNodes = this._iterateNode(this.root, this.component);
            setTimeout(() => {
                for (let attributeName of this.attributes) {
                    this.properties.set(attributeName, {
                        name: attributeName,
                        value: this.root.host.getAttribute(attributeName),
                        listeners: new Set(),
                    });
                }
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
                            setTimeout(() => {
                                if (this.component.__is_mounted__) {
                                    this.component[ob.method](v);
                                }
                                isRunning = false;
                            }, 0);
                        });
                        if (ob.immediate) {
                            if (isRunning) {
                                return;
                            }
                            isRunning = true;
                            setTimeout(() => {
                                if (this.component.__is_mounted__) {
                                    this.component[ob.method](this.properties.get(ob.propertyName).value);
                                }
                                isRunning = false;
                            }, 0);
                        }
                    });
                }
                // Inject template nodes after iteration is complete due to
                // modifications made to the DOM while iterating through it.
                templateNodes.forEach((n) => this._injectPropertyReference(n.node, n.ctx));
                templateNodes.clear();
                // Execute conditional bindings (if-directives) as the very
                // last thing to do, since this may drastically modify the DOM.
                setTimeout(() => {
                    this.conditionals.forEach(fn => fn());
                    this.conditionals.clear();
                }, 0);
            }, 0);
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
         * Refreshes all text nodes.
         */
        refreshTextNodes() {
            this.textNodeListeners.forEach((l) => l());
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
            node.childNodes.forEach((childNode) => {
                this._iterateNode(childNode, context, templateNodes);
            });
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
                    const result = func(context);
                    if (typeof result === 'boolean' && result === false) {
                        node.removeAttribute(attribute);
                    }
                    else {
                        node.setAttribute(attribute, result);
                    }
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
                    const ctx = Object.assign({}, context, { [itemVar]: item });
                    this._getAllMethods(this.component).forEach((method) => {
                        ctx[method] = context[method].bind(ctx);
                    });
                    childNodes.set(item, tpl);
                    insertionPoint.parentNode.insertBefore(tpl, lastChildNode.nextSibling);
                    lastChildNode = tpl;
                    const templateNodes = this._iterateNode(tpl, ctx);
                    templateNodes.forEach((n) => this._injectPropertyReference(n.node, ctx));
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
            // Run factory on next tick!
            setTimeout(() => factory(), 0);
        }
        _getAllMethods(toCheck) {
            let props = [];
            let obj = toCheck;
            do {
                props = props.concat(Object.getOwnPropertyNames(obj));
            } while (obj = Object.getPrototypeOf(obj));
            return props.sort().filter(function (e, i, arr) {
                if (e != arr[i + 1] && typeof toCheck[e] == 'function') {
                    return true;
                }
            });
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
            // Hide the node initially to prevent inaccurate initial draw.
            // Since the element is mounted initially by nature, its component class
            // will still be instantiated.
            node.replaceWith(frag);
            deps.forEach((dep) => {
                context[dep] = this.properties.has(dep) ? this.properties.get(dep).value : context[dep];
            });
            let isRunning = false;
            const listener = () => {
                if (isRunning) {
                    return;
                }
                isRunning = true;
                deps.forEach((dep) => {
                    context[dep] = this.properties.has(dep) ? this.properties.get(dep).value : context[dep];
                });
                setTimeout(() => {
                    // Run conditional replacements on the next tick to allow re-
                    // evaluation of reactive attributes before the node is created.
                    if (func(context)) {
                        if (frag.parentNode) {
                            frag.replaceWith(node);
                            isRunning = false;
                        }
                        return;
                    }
                    node.replaceWith(frag);
                    isRunning = false;
                }, 0);
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
                        const result = func(context, event);
                        return typeof result === 'function' ? result(event) : result;
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
            this.textNodeListeners.add(listener);
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
        if (typeof componentStylesheet === 'string') {
            style.innerText = componentStylesheet;
        }
        else {
            _parseStyleDeclaration(componentStylesheet, [':host'], sheet);
        }
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
            this.$observer = new ComponentObserver(this, this.$root, options.attributes || []);
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
         * Refreshes all text nodes within this component.
         *
         * @protected
         */
        $refreshTextNodes() {
            this.$observer.refreshTextNodes();
        }
        /**
         * Returns the host element.
         *
         * @returns {Element}
         * @protected
         */
        get $host() {
            return this.$root.host;
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

    /* Byteshift Elements                                                              _         _             __   _ _____
     *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
     *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
     * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
     * See LICENSE for licensing information                                                |__/           E L E M E N T S
     */
    const Elements = {
        /**
         * Register one or more components.
         *
         * @param {(typeof AbstractComponent)[]} elements
         */
        register(...elements) {
            elements.forEach((element) => {
                if (typeof element.__be_component__ === 'undefined') {
                    throw new Error('The given argument is not a custom element.');
                }
                registerComponent(element, element.__be_component__);
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
        install(plugin) {
            plugin.install(Elements);
        },
    };

    exports.AbstractComponent = AbstractComponent;
    exports.Component = Component;
    exports.Elements = Elements;
    exports.Watch = Watch;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=elements.js.map
