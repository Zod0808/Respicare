/**
 * Nombre de Objeto: declarations (ambient types)
 * Fecha de Creación: 2026-11-06
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: N/A - Declaraciones de tipos TypeScript para dependencias sin
 * @types; no implementa un RF propio, no aparece como objeto en la Matriz de
 * Trazabilidad.
 * Descripción: Declara los módulos ambiente (hpp, xss-clean, swagger-ui-express
 * y los paquetes de OpenTelemetry) que no traen definiciones de tipos propias,
 * permitiendo que el resto del backend los importe sin errores de compilación.
 */
// Type declarations for packages without @types

declare module 'hpp' {
  import { RequestHandler } from 'express';
  function hpp(): RequestHandler;
  export = hpp;
}

declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  function xss(): RequestHandler;
  export = xss;
}

declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';
  import { SwaggerDefinition } from 'swagger-jsdoc';
  
  interface SwaggerUiOptions {
    customCss?: string;
    customSiteTitle?: string;
    swaggerOptions?: any;
  }
  
  function serve(content: any): RequestHandler[];
  function setup(swaggerDoc: SwaggerDefinition, options?: SwaggerUiOptions): RequestHandler;
  
  export { serve, setup };
}

// OpenTelemetry modules (optional dependencies)
declare module '@opentelemetry/sdk-node' {
  export class NodeSDK {
    constructor(options?: any);
    start(): Promise<void>;
    shutdown(): Promise<void>;
  }
}

declare module '@opentelemetry/auto-instrumentations-node' {
  export function getNodeAutoInstrumentations(options?: any): any[];
}

declare module '@opentelemetry/resources' {
  export function resourceFromAttributes(attributes?: any): any;
}

declare module '@opentelemetry/semantic-conventions' {
  export const SemanticResourceAttributes: any;
}

declare module '@opentelemetry/exporter-jaeger' {
  export class JaegerExporter {
    constructor(options?: any);
  }
}

declare module '@opentelemetry/exporter-trace-otlp-http' {
  export class OTLPTraceExporter {
    constructor(options?: any);
  }
}