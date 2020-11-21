import { ElementConstructor } from '@/Element/ElementConstructor';
export declare abstract class WebComponent {
    protected readonly $el: ElementConstructor;
    constructor($el: ElementConstructor);
    get $ref(): HTMLElement;
}
