import { ComponentOptions } from '../Decorator/Component';
import { ComponentObserver } from '../Reactivity/ComponentObserver';
export declare abstract class AbstractComponent {
    private readonly $$;
    private readonly $root;
    private readonly $style;
    private readonly $observer;
    constructor($$: HTMLElement, options: ComponentOptions);
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
     * Returns an HTML element from this component based on the given selector.
     *
     * @param {string} selector
     * @returns {HTMLElement}
     * @protected
     */
    protected $query(selector: string): HTMLElement;
    /**
     * Returns a list of matching HTML elements based on the given selector
     * from this component.
     *
     * @param {string} selector
     * @returns {HTMLElement[]}
     * @protected
     */
    protected $queryAll(selector: string): HTMLElement[];
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
