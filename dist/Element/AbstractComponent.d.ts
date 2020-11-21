import { ElementConstructor } from '@/Element/ElementConstructor';
export declare abstract class AbstractComponent {
    protected readonly $el: ElementConstructor;
    constructor($el: ElementConstructor);
    get $ref(): HTMLElement;
}
