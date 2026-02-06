
declare module 'pdfjs-dist' {
  const content: any;
  export default content;
  export const GlobalWorkerOptions: any;
  export function getDocument(args: any): any;
  export const version: string;
}

declare module 'mammoth' {
  export function extractRawText(options: { arrayBuffer: ArrayBuffer }): Promise<{ value: string; messages: any[] }>;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}
