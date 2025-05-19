const { defineConfig } = require('vite');
const Path = require('path');
const vuePlugin = require('@vitejs/plugin-vue')
const vuetify = require('vite-plugin-vuetify')
const { quasar, transformAssetUrls } =require('@quasar/vite-plugin')


/**
 * https://vitejs.dev/config
 */
const config = defineConfig({
    root: Path.join(__dirname, 'src', 'renderer'),
    publicDir: 'public',
    server: {
        port: 8080,
    },
    open: false,
    build: {
        outDir: Path.join(__dirname, 'build', 'renderer'),
        emptyOutDir: true,
        rollupOptions:{
          input:{
            splash:Path.resolve(__dirname,'src/renderer/pages/splash/index.html'),
            caja:Path.resolve(__dirname,'src/renderer/pages/caja/index.html'),
            concepto:Path.resolve(__dirname,'src/renderer/pages/conceptos/index.html'),
            estadoCuenta:Path.resolve(__dirname,'src/renderer/pages/estado_cuenta/index.html'),
            facturaV4:Path.resolve(__dirname,'src/renderer/pages/factura_v4/index.html'),
            login:Path.resolve(__dirname,'src/renderer/pages/login/index.html'),
            main:Path.resolve(__dirname,'src/renderer/pages/main/index.html'),
            recibo:Path.resolve(__dirname,'src/renderer/pages/recibo/index.html'),
            reciboReimprimir:Path.resolve(__dirname,'src/renderer/pages/recibo_reimprimir/index.html'),
            reimprimir:Path.resolve(__dirname,'src/renderer/pages/reimprimir/index.html'),
            pagos:Path.resolve(__dirname,'src/renderer/pages/reporte_pagos/index.html'),
            pagosAgrupados:Path.resolve(__dirname,'src/renderer/pages/reporte_pagos_agrupados/index.html'),            
            formularioInscripcion:Path.resolve(__dirname,'src/renderer/pages/inscripciones/index.html'),
            deatalleInvitado:Path.resolve(__dirname,'src/renderer/pages/detalle_invitados/index.html'),
          }
        }
      },
    plugins: [vuePlugin({template: { transformAssetUrls }}),vuetify({
      autoImport: true,
    }),quasar({
      autoImportComponentCase: 'pascal'
    })],
    define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': Path.resolve(__dirname, 'src'),
    },
  },
});

module.exports = config;


