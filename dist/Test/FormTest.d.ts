import { AbstractComponent } from '@/Component/AbstractComponent';
export declare class FormTest extends AbstractComponent {
    name: 'FormTest';
    xTitle: string;
    private isChecked;
    private someText;
    private someNumber;
    private someColor;
    private someRadioValue;
    private selectSimple;
    private selectAdv;
    private selectAdvItems;
    get multipliedNumber(): number;
    private addRandomItem;
    private onColorChanged;
}
