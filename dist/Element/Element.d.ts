export declare type ElementConstructorType = (new (...args: any[]) => any) & {
    __be_isElement?: boolean;
};
interface ElementConstructorOptions {
    template: string;
    stylesheet?: string;
}
export declare function Element(tagName: string, options?: ElementConstructorOptions): (target: ElementConstructorType) => void;
export {};
