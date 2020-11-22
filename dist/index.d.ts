import { AbstractComponent } from '@/Component/AbstractComponent';
export * from '@/Decorator/Component';
export * from '@/Decorator/Watch';
export * from '@/Component/ComponentStyleDeclaration';
export * from '@/Component/AbstractComponent';
export declare const Elements: ElementsRegistry;
declare type ElementsRegistry = {
    register: (...elements: (typeof AbstractComponent)[]) => void;
    install: (plugin: PluginType) => void;
};
declare type PluginType = {
    install: (registry: ElementsRegistry) => void;
};
