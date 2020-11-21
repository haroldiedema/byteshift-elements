/* Byteshift Elements                                                              _         _             __   _ _____
 *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
 *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
 * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
 * See LICENSE for licensing information                                                |__/           E L E M E N T S
 */
'use strict';

// THIS IS A DEBUG ELEMENT.

import {AbstractComponent} from '@/Component/AbstractComponent';
import {Component}         from '@/Decorator/Component';
import {Watch}             from '@/Decorator/Watch';

@Component({
    selector: 'hello-world',
    template: `
    <textarea bind="myText"></textarea>
    <div>Word count: {{ wordCount }}</div>
    `,
})
export class HelloWorld extends AbstractComponent
{
    private myText: string = '';
    private wordCount: number = 0;

    @Watch('myText')
    private onTextChanged(newVal: string): void
    {
        this.wordCount = newVal.split(' ').filter(word => word.length > 0).length;
    }
}
