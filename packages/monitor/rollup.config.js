import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';

export default {
  // 注意：你的入口不是 src/index.ts
  input: 'src/monitor/index.ts',

  // 输出配置
  output: [
    {
      file: 'dist/monitor.esm.js',
      format: 'es',
      sourcemap: false,
    },
    {
      file: 'dist/monitor.cjs.js',
      format: 'cjs',
      sourcemap: false,
      exports: 'named',
    },
    {
      file: 'dist/monitor.umd.js',
      format: 'umd',
      name: 'MonitorSDK', // 浏览器全局变量
      sourcemap: false,
    },
  ],

  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      clean: true,
    }),
    terser({
      // 移除注释
      format: {
        comments: false,
      },
      // 移除 console.log 和 debugger
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    }),
  ],
};
