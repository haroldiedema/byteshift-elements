/* Byteshift Elements                                                              _         _             __   _ _____
 *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
 *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
 * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
 * See LICENSE for licensing information                                                |__/           E L E M E N T S
 */
'use strict';

import {ComponentObserver} from '@/Reactivity/ComponentObserver';

/**
 * Binds the given node to a property inside the component.
 *
 * @param {ComponentObserver} observer
 * @param {HTMLElement} node
 * @param context
 */
export function bindElementValueToProperty(observer: ComponentObserver, node: HTMLElement, context: any): void
{
    const propertyName: string = node.getAttribute('bind');
    const tagName: string      = node.tagName.toLowerCase();

    // Make sure the property exists.
    if (!observer.hasProperty(propertyName)) {
        throw new Error(
            `Cannot bind ${node.tagName.toLowerCase()} element to property ${propertyName}. This property does not exist.`,
        );
    }

    if (tagName === 'input') {
        const type: string         = (node.getAttribute('type') || 'text').toLowerCase();
        const el: HTMLInputElement = node as HTMLInputElement;

        switch (type) {
            case 'checkbox':
                bindCheckboxElement(observer, el, propertyName, context);
                return;
            case 'text':
            case 'password':
            case 'color':
            case 'time':
                bindInputTextElement(observer, el, propertyName, context);
                return;
            case 'number':
                bindInputNumberElement(observer, el, propertyName, context);
                return;
            case 'radio':
                bindInputRadioElement(observer, el, propertyName, context);
                return;
            default:
                console.warn(`Unknown input element type: "${type}".`);
        }

        return;
    }

    if (tagName === 'textarea') {
        return bindTextareaElement(observer, node as HTMLTextAreaElement, propertyName, context);
    }

    if (tagName === 'select') {
        return bindSelectToElement(observer, node as HTMLSelectElement, propertyName, context);
    }
}

/**
 * Binds a select element to the property.
 *
 * @param {ComponentObserver} observer
 * @param {HTMLInputElement}  node
 * @param {string}            propertyName
 * @param context
 */
function bindSelectToElement(
    observer: ComponentObserver,
    node: HTMLSelectElement,
    propertyName: string,
    context: any,
): void
{
    if (node.hasAttribute('items')) {
        const itemPropertyName = node.getAttribute('items');
        if (!observer.hasProperty(itemPropertyName)) {
            throw new Error(
                `The items property "${itemPropertyName}" does not exist on the component ${(observer.component.constructor.name)}.`);
        }

        const itemFactory = () => {
            const items     = context[itemPropertyName];
            const itemValue = node.getAttribute('value-name') || 'value';
            const itemLabel = node.getAttribute('label-name') || 'label';

            node.innerHTML = '';

            if (Array.isArray(items)) {
                items.forEach((item) => {
                    const option = document.createElement('option');

                    if (typeof item === 'object') {
                        option.innerText = item[itemLabel];
                        option.value     = item[itemValue];
                    } else {
                        option.innerText = item;
                        option.value     = item;
                    }

                    node.appendChild(option);
                });
            } else {
                if (typeof items === 'object') {
                    Object.keys(items).forEach((key: string) => {
                        const option     = document.createElement('option');
                        option.innerText = key;
                        option.value     = items[key];
                        node.appendChild(option);
                    });
                } else {
                    throw new Error(`Items property ${itemPropertyName} must be either an array or object.`);
                }
            }

            // Update the selected value.
            node.value = context[propertyName];
        };

        observer.addPropertyListener(itemPropertyName, itemFactory);
        itemFactory();
    }

    observer.registerNodeEventListener(node, 'change', () => {
        if (context[propertyName] !== node.value) {
            context[propertyName] = node.value;
        }
    });

    const listener = (v: any) => {
        if (node.value !== v) {
            node.value = v;
        }
    };

    observer.addPropertyListener(propertyName, listener);
    listener(context[propertyName]);
}

/**
 * Binds a textarea element to the property.
 *
 * @param {ComponentObserver} observer
 * @param {HTMLInputElement}  node
 * @param {string}            propertyName
 * @param context
 */
function bindTextareaElement(
    observer: ComponentObserver,
    node: HTMLTextAreaElement,
    propertyName: string,
    context: any,
): void
{
    observer.registerNodeEventListener(node, 'change', () => {
        if (context[propertyName] !== node.value) {
            context[propertyName] = node.value;
        }
    });
    observer.registerNodeEventListener(node, 'input', () => {
        if (context[propertyName] !== node.value) {
            context[propertyName] = node.value;
        }
    });

    const listener = (v: any) => {
        if (node.value !== v) {
            node.value = v;
        }
    };

    observer.addPropertyListener(propertyName, listener);
    listener(context[propertyName]);
}

/**
 * Binds a radio input element to the property.
 *
 * @param {ComponentObserver} observer
 * @param {HTMLInputElement}  node
 * @param {string}            propertyName
 * @param context
 */
function bindInputRadioElement(
    observer: ComponentObserver,
    node: HTMLInputElement,
    propertyName: string,
    context: any,
): void
{
    observer.registerNodeEventListener(node, 'change', () => {
        if (context[propertyName] !== node.value) {
            context[propertyName] = node.value;
        }
    });

    const listener = (v: any) => {
        if (v === node.value) {
            if (!node.checked) {
                node.checked = true;
            }
        } else {
            if (node.checked) {
                node.checked = false;
            }
        }
    };

    observer.addPropertyListener(propertyName, listener);
    listener(context[propertyName]);
}

/**
 * Binds a checkbox element to the property.
 *
 * @param {ComponentObserver} observer
 * @param {HTMLInputElement}  node
 * @param {string}            propertyName
 * @param context
 */
function bindCheckboxElement(
    observer: ComponentObserver,
    node: HTMLInputElement,
    propertyName: string,
    context: any,
): void
{
    observer.registerNodeEventListener(node, 'change', () => {
        if (context[propertyName] !== node.checked) {
            context[propertyName] = node.checked;
        }
    });

    observer.addPropertyListener(propertyName, (v) => {
        if (node.checked !== v) {
            node.checked = v;
        }
    });

    node.checked = !!context[propertyName];
}

/**
 * Binds a text input element to the given property.
 *
 * @param {ComponentObserver} observer
 * @param {HTMLInputElement} node
 * @param {string} propertyName
 * @param context
 */
function bindInputTextElement(
    observer: ComponentObserver,
    node: HTMLInputElement,
    propertyName: string,
    context: any,
): void
{
    observer.registerNodeEventListener(node, 'input', () => {
        if (context[propertyName] !== node.value) {
            context[propertyName] = node.value;
        }
    });
    observer.registerNodeEventListener(node, 'change', () => {
        if (context[propertyName] !== node.value) {
            context[propertyName] = node.value;
        }
    });

    observer.addPropertyListener(propertyName, (v) => {
        if (node.value !== v) {
            node.value = v;
        }
    });

    node.setAttribute('value', context[propertyName]);
    node.value = context[propertyName];
}

/**
 * Binds a number input element to the given property.
 *
 * @param {ComponentObserver} observer
 * @param {HTMLInputElement} node
 * @param {string} propertyName
 * @param context
 */
function bindInputNumberElement(
    observer: ComponentObserver,
    node: HTMLInputElement,
    propertyName: string,
    context: any,
): void
{
    observer.registerNodeEventListener(node, 'input', () => {
        const v = parseFloat(node.value);
        if (context[propertyName] !== v) {
            context[propertyName] = v;
        }
    });

    observer.addPropertyListener(propertyName, (v) => {
        if (node.value !== v) {
            node.value = v;
        }
    });

    node.setAttribute('value', context[propertyName]);
    node.value = context[propertyName];
}
