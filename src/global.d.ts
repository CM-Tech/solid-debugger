declare module "solid-js/dev";

declare global {
  interface Window {
    addSolidUpdateListener: (listener: () => void) => number;
    removeSolidUpdateListener: (id: number) => void;
  }
}

export {};
