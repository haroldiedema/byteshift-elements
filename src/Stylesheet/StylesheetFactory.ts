/* Byteshift Elements                                                              _         _             __   _ _____
 *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
 *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
 * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
 * See LICENSE for licensing information                                                |__/           E L E M E N T S
 */
'use strict';

import {ComponentStyleDeclaration} from '@/Component/ComponentStyleDeclaration';

export function composeStylesheet(root: ShadowRoot, componentStylesheet: ComponentStyleDeclaration): CSSStyleSheet
{
    let style = document.createElement('style');
    style.appendChild(document.createTextNode(''));
    root.appendChild(style);

    const sheet: CSSStyleSheet = root.styleSheets[0];

    _parseStyleDeclaration(componentStylesheet, [':host'], sheet);

    return sheet;
}

function _parseStyleDeclaration(stylesheet: ComponentStyleDeclaration, parents: string[], sheet: CSSStyleSheet): string
{
    const selector: string[] = [];
    parents.forEach((p: string) => {
        if (p.startsWith(':') || p.startsWith('.')) {
            selector.push(p);
        } else {
            selector.push(' ' + p.trim());
        }
    });

    let rule = selector.join('') + ' {';

    Object.keys(stylesheet).forEach((selector: string) => {
        if (typeof (stylesheet as any)[selector] === 'object') {
            parents.push(selector);
            _parseStyleDeclaration((stylesheet as any)[selector], parents, sheet);
            parents.pop();
            return;
        }

        rule += (selector.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`)) + ': ' + (stylesheet as any)[selector] + ';';
    });

    rule += '}';

    if (rule.trim() !== '{}') {
        sheet.insertRule(rule);
    }

    return rule;
}
