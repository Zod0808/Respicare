/**
 * Nombre de Objeto: setupTests
 * Fecha de Creación: 2026-11-06
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: N/A - Configuración de entorno de pruebas (Jest/CRA); no
 * implementa un RF propio, no aparece como objeto en la Matriz de Trazabilidad.
 * Descripción: Setup global de Jest cargado antes de cada suite. Añade los
 * polyfills de Node (TextEncoder/TextDecoder/streams/MessagePort) y los stubs
 * de jsdom (scrollIntoView, matchMedia) que requieren los componentes web.
 */
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream, WritableStream, TransformStream } from 'stream/web';
import { MessagePort } from 'worker_threads';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream;
}
if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = WritableStream;
}
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = TransformStream;
}
if (typeof global.MessagePort === 'undefined') {
  global.MessagePort = MessagePort;
}

if (typeof window !== 'undefined' && !window.Element.prototype.scrollIntoView) {
  window.Element.prototype.scrollIntoView = jest.fn();
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
