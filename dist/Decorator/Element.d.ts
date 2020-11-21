import { AbstractElement } from '@/Element/AbstractElement';
import { ElementConstructorOptions } from '@/Element/ElementConstructorOptions';
export declare function Element(options: ElementConstructorOptions): (target: typeof AbstractElement) => void;
export interface HasTest {
    testMe(): void;
}
