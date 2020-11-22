import alias      from '@rollup/plugin-alias';
import commonJS   from '@rollup/plugin-commonjs';
import resolve    from '@rollup/plugin-node-resolve';
import serve      from 'rollup-plugin-serve';
import typescript from 'rollup-plugin-typescript2';
import * as path  from 'path';
import {terser}   from 'rollup-plugin-terser';

const projectRootDir = path.resolve(__dirname);

export default {
    input:   'src/index.ts',
    output:  {
        name:   'ByteshiftElements',
        file:   'dist/elements.js',
        format: 'umd',
        exports: 'named',
        sourcemap: true,
    },
    plugins: [
        typescript(),
        alias({
            entries: [
                {
                    find:        '@',
                    replacement: path.resolve(projectRootDir, 'src'),
                },
            ],
        }),
        resolve({
        }),
        commonJS({
            include: 'node_modules/**',
        }),
        process.env.ROLLUP_WATCH && serve('dist'),
        !process.env.ROLLUP_WATCH && terser({
            output: {
                width: 120
            }
        })
    ],
};
