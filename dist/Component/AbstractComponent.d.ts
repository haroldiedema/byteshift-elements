import { ComponentOptions } from '../Decorator/Component';
import { ComponentObserver } from '../Reactivity/ComponentObserver';
export declare abstract class AbstractComponent {
    private readonly $$;
    protected readonly $root: ShadowRoot;
    private readonly $style;
    private readonly $observer;
    protected constructor($$: HTMLElement, options: ComponentOptions);
    /**
     * Invoked when the object is created or reconnected to the DOM.
     */
    onCreate(): void;
    /**
     * Invoked when the object is destroyed or disconnected from the DOM.
     */
    onDestroy(): void;
    /**
     * Returns the observer associated with this component.
     *
     * @returns {ComponentObserver}
     */
    get __observer__(): ComponentObserver;
    /**
     * Refreshes all text nodes within this component.
     *
     * @protected
     */
    protected $refreshTextNodes(): void;
    /**
     * Returns the host element.
     *
     * @returns {Element}
     * @protected
     */
    protected get $host(): Element;
    /**
     * Returns an HTML element from this component based on the given selector.
     *
     * @param {string} selector
     * @returns {HTMLElement}
     * @protected
     */
    protected $query<T extends Element>(selector: string): T;
    /**
     * Returns a list of matching HTML elements based on the given selector
     * from this component.
     *
     * @param {string} selector
     * @returns {HTMLElement[]}
     * @protected
     */
    protected $queryAll<T extends Element>(selector: string): T[];
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
    protected $ref<T>(selector: string): T | undefined;
    /**
     * Emits a CustomEvent with the given name and data.
     *
     * @param {string} eventName
     * @param {*}      data
     * @protected
     */
    protected $emit(eventName: string, data: any): void;
}
