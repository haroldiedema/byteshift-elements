/* Byteshift Elements                                                              _         _             __   _ _____
 *    A self-encapsulating WebComponent framework                                 | |__ _  _| |_ ___  ___ / /  (_) _/ /_
 *                                                                                | '_ \ || |  _/ -_|(_-</ _ \/ / _/ __/
 * (C)2020, Harold Iedema <harold@iedema.me>                                      |_.__/\_, |\__\___/___/_//_/_/_/ \__/
 * See LICENSE for licensing information                                                |__/           E L E M E N T S
 */
'use strict';

export function Watch(propertyName: string, immediate: boolean = true)
{
    return (target: any, propertyKey: string): any => {
        if (typeof target.constructor.__observerFunctions__ === 'undefined') {
            Object.defineProperty(target.constructor, '__observerFunctions__', {
                enumerable:   false,
                configurable: false,
                value:        [],
            });
        }

        target.constructor.__observerFunctions__.push({
            propertyName: propertyName,
            immediate:    immediate,
            method:       propertyKey,
        });
    };
}

type WatchOptions = {
    immediate: boolean;
};
