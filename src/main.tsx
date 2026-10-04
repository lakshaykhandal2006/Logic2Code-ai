// Ensure Window.prototype.fetch and window.fetch have a setter to prevent
// "TypeError: Cannot set property fetch of #<Window> which has only a getter"
if (typeof window !== 'undefined') {
  try {
    const win = window;
    const proto = typeof Window !== 'undefined' ? Window.prototype : null;
    const currentFetch = win.fetch;

    const createDescriptor = (existingDesc?: PropertyDescriptor) => ({
      get() {
        return (this as any)._app_fetch || (existingDesc?.get ? existingDesc.get.call(this) : currentFetch);
      },
      set(fn: typeof fetch) {
        (this as any)._app_fetch = fn;
        try {
          Object.defineProperty(this, 'fetch', {
            value: fn,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        } catch {
          // ignore
        }
      },
      configurable: true,
      enumerable: true,
    });

    if (proto) {
      try {
        const protoDesc = Object.getOwnPropertyDescriptor(proto, 'fetch');
        Object.defineProperty(proto, 'fetch', createDescriptor(protoDesc));
      } catch {
        // ignore
      }
    }

    try {
      const winDesc = Object.getOwnPropertyDescriptor(win, 'fetch');
      Object.defineProperty(win, 'fetch', createDescriptor(winDesc));
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
