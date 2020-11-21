import { AbstractComponent } from '@/Element/AbstractComponent';
import { ElementConstructorType } from '@/Element/ElementConstructorType';
export declare class ElementConstructor extends HTMLElement {
    readonly __component__: any & AbstractComponent;
    constructor(ctor: ElementConstructorType);
}
