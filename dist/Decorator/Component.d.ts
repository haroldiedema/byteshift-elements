import { AbstractComponent } from '@/Component/AbstractComponent';
import { ComponentStyleDeclaration } from '@/Component/ComponentStyleDeclaration';
/**
 * Configures the decorated class to function as a native web component.
 *
 * @param {ComponentOptions} options
 * @returns {(target: AbstractComponent) => void}
 * @constructor
 */
export declare function Component(options: ComponentOptions): (target: typeof AbstractComponent) => void;
export interface ComponentOptions {
    selector: string;
    template: string;
    stylesheet?: ComponentStyleDeclaration;
    attributes?: string[];
}
