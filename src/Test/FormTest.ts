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
    selector:   'form-test',
    attributes: ['x-title'],
    template:   `
        <table style="width: 100%;margin: 10px;">
            <tr><td colspan="2"><h3>{{ xTitle }}</h3><slot></slot><hr style="width: 100%;"></td></tr>
            <tr>
                <td>
                    <input type="checkbox" bind="isChecked" id="checked"/>
                    <label for="checked">Check me!</label>
                </td>
                <td>
                    {{ isChecked }}
                    <b if="isChecked">IT IS CHECKED!</b>
                </td>
            </tr>
            <tr>
                <td>
                    <input type="text" bind="someText"/>
                </td>
                <td>
                    <i>You typed: "{{ someText }}"</i>
                </td>
            </tr>
            <tr>
                <td>
                    <input type="number" bind="someNumber"/>
                </td>
                <td>
                    <i if="! isNaN(someNumber)">{{ multipliedNumber }}</i>
                </td>
            </tr>
            <tr><td colspan="2">
                <div iterate="item in selectAdvItems">{{ item }}</div>
            </td></tr>
            <tr>
                <td>
                    <input type="color" bind="someColor"/>
                </td>
                <td>
                    <span
                        style="display: inline-block; width: 64px; height: 24px; border: 1px solid #fff;"
                        :style="{backgroundColor: someColor}"
                    >
                        {{ someColor }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    Pick one: "{{ someRadioValue }}"
                </td>
                <td>
                    <input type="radio" name="radio1" bind="someRadioValue" value="One" id="r1"><label for="r1">One</label>
                    <input type="radio" name="radio1" bind="someRadioValue" value="Two" id="r2"><label for="r2">Two</label>
                    <input type="radio" name="radio1" bind="someRadioValue" value="Three" id="r3"><label for="r3">Three</label>
                    
                    <select bind="someRadioValue">
                        <option value="One">First one</option>
                        <option value="Two">Second one</option>
                        <option value="Three">Third one</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    Pick one: "{{ selectSimple }}"
                </td>
                <td>
                    <select bind="selectSimple">
                        <option value="First">First one</option>
                        <option value="Second">Second one</option>
                        <option value="Third">Third one</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    You selected: "{{ selectAdv }}"
                </td>
                <td>
                    <select bind="selectAdv" items="selectAdvItems"></select>
                    <button @click="addRandomItem()">Add item</button>
                </td>
            </tr>
        </table>
    `,
})
export class FormTest extends AbstractComponent
{
    public name: 'FormTest';
    public xTitle: string = 'Untitled';

    private isChecked: boolean     = false;
    private someText: string       = '';
    private someNumber: number     = 1.0;
    private someColor: string      = '#ff0000';
    private someRadioValue: string = 'Two';
    private selectSimple: string   = 'Second';
    private selectAdv: string      = '';
    private selectAdvItems: any[]  = ['A', 'B', 'C'];

    public get multipliedNumber(): number
    {
        return this.someNumber * this.someNumber;
    }

    private addRandomItem(): void
    {
        this.selectAdvItems.push('X-' + (Math.floor(Math.random() * 65535)));
    }

    @Watch('someColor')
    private onColorChanged(newVal: string): void
    {
        this.$emit('colorchanged', newVal);
    }
}
