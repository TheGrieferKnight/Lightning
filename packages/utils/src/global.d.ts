export {};

declare global {
  interface Window {
    __TAURI__?: {
      core: {
        convertFileSrc(path: string, protocol?: string): string;
        // You can extend this with more properties as needed
      };
    };
  }
}
