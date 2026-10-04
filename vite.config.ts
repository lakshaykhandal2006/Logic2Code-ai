import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig, Plugin} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fetchFixPlugin: Plugin = {
  name: 'fetch-getter-fix',
  transformIndexHtml: {
    order: 'pre',
    handler() {
      return [
        {
          tag: 'script',
          attrs: {type: 'text/javascript'},
          children: `(function() {
  try {
    var win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
    if (!win) return;
    var proto = typeof Window !== 'undefined' ? Window.prototype : null;
    var currentFetch = win.fetch;

    function createDescriptor(existingDesc) {
      return {
        get: function() {
          return this._app_fetch || (existingDesc && existingDesc.get ? existingDesc.get.call(this) : currentFetch);
        },
        set: function(fn) {
          this._app_fetch = fn;
          try {
            Object.defineProperty(this, 'fetch', {
              value: fn,
              writable: true,
              configurable: true,
              enumerable: true
            });
          } catch(e) {}
        },
        configurable: true,
        enumerable: true
      };
    }

    if (proto) {
      try {
        var protoDesc = Object.getOwnPropertyDescriptor(proto, 'fetch');
        Object.defineProperty(proto, 'fetch', createDescriptor(protoDesc));
      } catch(e) {}
    }

    try {
      var winDesc = Object.getOwnPropertyDescriptor(win, 'fetch');
      Object.defineProperty(win, 'fetch', createDescriptor(winDesc));
    } catch(e) {}
  } catch(e) {}
})();`,
          injectTo: 'head-prepend',
        },
      ];
    },
  },
};

export default defineConfig(() => {
  return {
    plugins: [fetchFixPlugin, react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
