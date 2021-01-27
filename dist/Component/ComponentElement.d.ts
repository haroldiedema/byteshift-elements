import { AbstractComponent } from '@/Component/AbstractComponent';
import { ComponentOptions } from '@/Decorator/Component';
export declare abstract class ComponentElement extends HTMLElement {
    private __constructor__;
    private __component__;
    private __attributes__;
    private __mountTimer__;
    protected constructor(Component: typeof AbstractComponent & any, options: ComponentOptions);
    /**
     * Resolves the returned promise on the next tick of the event loop.
     *
     * @returns {Promise<void>}
     * @protected
     */
    protected $nextTick(): Promise<void>;
    /**
     *  Invoked each time the custom element is appended into a document-connected element. This will happen each
     *  time the node is moved, and may happen before the element's contents have been fully parsed.
     *
     *  @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
     */
    private connectedCallback;
    /**
     * Invoked each time the custom element is disconnected from the document's DOM.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
     */
    private disconnectedCallback;
    /**
     * Invoked whenever one of the element's attributes is changed in some way.
     *
     * @param {string} name
     * @param {*} oldValue
     * @param {*} newValue
     */
    private attributeChangedCallback;
}
