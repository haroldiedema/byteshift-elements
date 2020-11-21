import { AbstractElement } from '@/Element/AbstractElement';
import { ElementConstructor } from '@/Element/ElementConstructor';
export declare type ElementConstructorType = (new (el: ElementConstructor) => any & AbstractElement) & {
    __be__?: ElementMetadataType;
};
declare type ElementMetadataType = {
    /**
     * The name of the HTML tag associated with the element.
     *
     * @var {string}
     */
    tagName: string;
    /**
     * The HTML template to render associated with this component.
     *
     * @var {string}
     */
    template: string;
    /**
     * The CSS stylesheet to render specifically for this component.
     *
     * @var {string}
     */
    stylesheet: string;
    /**
     * Attributes on the HTML tag to listen for when their values change.
     *
     * @var {string[]}
     */
    attributes: string[];
};
export {};
