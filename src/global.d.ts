declare global {
  interface Window {
    addSolidUpdateListener: (listener: () => void) => number;
    removeSolidUpdateListener: (id: number) => void;
  }
}

export {};
