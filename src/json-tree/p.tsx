export type JSONNodeProps = {
  parent: {
    isRoot: boolean;
    isArray: boolean;
    isHTML: boolean;
    expanded: boolean;
    type: string;
  };
};

export type JSONEditableProps<T = any> = {
  setValue: (...args: any[]) => void;
  value: T;
};
