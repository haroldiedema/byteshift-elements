import { AbstractComponent } from '../Component/AbstractComponent';
export declare class ComponentObserver {
    readonly component: AbstractComponent;
    private root;
    private properties;
    private computedProperties;
    private nodeEventMap;
    private conditionals;
    constructor(component: AbstractComponent, root: ShadowRoot);
    /**
     * Connects the observer to the associated component.
     * This should be executed once when the component is added to the DOM.
     */
    connect(): void;
    /**
     * Disconnects this observer from the component.
     * This should be executed once when the component is removed from the DOM.
     */
    disconnect(): void;
    /**
     * Returns true if this observer is tracking a property with the given name.
     *
     * @param {string} name
     * @returns {boolean}
     */
    hasProperty(name: string): boolean;
    /**
     * Invokes the given listener if the property with the specified name is updated.
     *
     * @param {string} name
     * @param {(v: any) => any} listener
     */
    addPropertyListener(name: string, listener: (v: any) => any): void;
    /**
     * Registers an event listener to the given node.
     *
     * @param {HTMLElement} node
     * @param {string} type
     * @param {(...args: any[]) => any} listener
     */
    registerNodeEventListener(node: HTMLElement, type: string, listener: (...args: any[]) => any): void;
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
    private _iterateNode;
    /**
     * Binds evaulated classes to the given node.
     *
     * @param {HTMLElement} node
     * @param context
     * @private
     */
    private _bindReactiveClassesToNode;
    /**
     * Binds evaluated attributes to the given name.
     *
     * @param {HTMLElement} node
     * @param context
     * @private
     */
    private _bindEvaluatedAttributesToNode;
    /**
     * Creates an element iterator based on the 'iterate' directive.
     *
     * @param {HTMLElement} node
     * @param {*}           context
     * @private
     */
    private _createElementIterator;
    private _bindReactiveStyleToNode;
    /**
     * Binds the 'bind' directive to the given node.
     *
     * @param {HTMLElement} node
     * @param context
     * @private
     */
    private _bindPropertiesToNode;
    /**
     * Binds conditional rendering directives to the given node. A conditional
     * statement is defined using the 'if' attribute. If the statement inside
     * the attributes resolves into a truthy value, the given node is rendered.
     *
     * @param {HTMLElement} node
     * @param context
     * @private
     */
    private _bindConditionalsToNode;
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
    private _bindEventHandlersToNode;
    /**
     * Create reactivity functionality on the properties of the observed component.
     *
     * @private
     */
    private _initializeComponentReactivity;
    /**
     * Makes the given property reactive, allowing callback functions to be
     * invoked when the value of the given property is changed.
     *
     * @param {string} name
     * @param {PropertyDescriptor} descriptor
     * @private
     */
    private _createReactiveProperty;
    /**
     * Binds the given callback to be invoked everytime the contents of the
     * given array is being changed.
     *
     * @param {ArrayLike<any>} arr
     * @param {() => any} callback
     * @private
     */
    private _bindCallbackOnArrayModifications;
    /**
     * Makes the given 'getter' function reactive, allowing callback functions
     * to be invoked when the dependencies of a getter are changed.
     *
     * @param {string} name
     * @param {PropertyDescriptor} descriptor
     * @private
     */
    private _createComputedProperty;
    /**
     * Returns true if the text in this node has a reference to a component
     * property using template syntax: {{ nameHere }}.
     *
     * @param {ChildNode} node
     * @returns {boolean}
     * @private
     */
    private _nodeHasPropertyReference;
    /**
     * Modifies the DOM of the given Node (type = Text) by replacing a template
     * fragment with a new text node that will render the value of the referenced
     * property reactively.
     *
     * @param {Node} node
     * @param {*}    context
     * @private
     */
    private _injectPropertyReference;
    /**
     * Creates a reactive text node based on the given fragment.
     *
     * @param {string} fragment
     * @param {*}      context
     * @returns {ChildNode}
     * @private
     */
    private _createReactiveTextNode;
    /**
     * Returns a list of referenced properties or getters from the given
     * fragment source.
     *
     * @param {string} fragment
     * @returns {string[]}
     * @private
     */
    private _findDependenciesInFragment;
}
