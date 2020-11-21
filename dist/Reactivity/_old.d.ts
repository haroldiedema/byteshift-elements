import { AbstractComponent } from '@/Component/AbstractComponent';
export declare type TrackedProperty = {
    value: any;
    listeners: Set<((v: any) => any)>;
};
export declare class ComponentObserver {
    private readonly component;
    private root;
    private readonly mutationObserver;
    private readonly trackedProperties;
    private readonly nodesToReplaceProps;
    private readonly addedNodeTree;
    constructor(component: AbstractComponent, root: ShadowRoot);
    disconnect(): void;
    refresh(): void;
    private onChange;
    /**
     * Iterates over the added node recursively.
     *
     * @param {ChildNode} node
     * @private
     */
    private iterateAddedNode;
    /**
     * Iterates over the removed node recursively.
     *
     * @param {ChildNode} node
     * @private
     */
    private iterateRemovedNode;
    private addEventBindings;
    /**
     * Binds the given node state or value to the property specified in the 'bind' attribute.
     *
     * @param {HTMLElement} node
     * @private
     */
    private bindVariableToElement;
    /**
     * Handles 'if'-directives on HTML elements.
     *
     * @param {HTMLElement} node
     * @private
     */
    private bindConditionalDirectiveToNode;
    /**
     * Replaces occurrences of "{{ varName }}" with another text node which reacts to a property inside the component.
     *
     * @param {ChildNode} node
     * @private
     */
    private extractAndReplaceNode;
    /**
     * Creates a TextNode which reacts to the value of a component property.
     *
     * @param {string} propertyName
     * @returns {ChildNode}
     * @private
     */
    private createReactiveComponentPropertyNode;
    /**
     * Makes the property with the given name reactive.
     *
     * @param {string} propertyName
     * @private
     */
    private makePropertyReactive;
}
