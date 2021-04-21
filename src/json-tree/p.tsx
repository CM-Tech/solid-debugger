export type JSONNodeProps = {
  parent: {
    isRoot: boolean;
    isArray: boolean;
    isHTML: boolean;
    expanded: boolean;
    type: string;
  };
};
export type JSONEditableProps = {
  setValue: (...args: any[]) => any;
  value: any;
};
