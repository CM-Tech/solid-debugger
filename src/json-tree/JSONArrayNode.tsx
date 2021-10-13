import { Component, createSignal, onCleanup } from "solid-js";
import { JSONNested } from "./JSONNested";
import { JSONEditableProps, JSONNodeProps } from "./p";

export const JSONArrayNode: Component<
  {
    value: any[];
    key: any;
    expanded?: boolean;
    nodeType: string;
  } & JSONNodeProps &
    JSONEditableProps
> = (props) => {
  const [keys, setKeys] = createSignal<string[]>([], {
    equals: (array1, array2) =>
      array1.length === array2.length && array1.every((value, index) => value === array2[index]),
  });
  const [length, setLength] = createSignal(0);
  const ud = () => {
    try {
      setLength(props.value.length);
      setKeys(Object.getOwnPropertyNames(props.value));
    } catch (e) {
      setLength(0);
      setKeys([]);
    }
  };
  ud();

  let id = setInterval(ud, 100);
  onCleanup(() => clearInterval(id));

  return (
    <JSONNested
      value={props.value}
      setValue={props.setValue}
      nodeType={props.nodeType}
      key={props.key}
      expanded={props.expanded ?? false}
      parent={props.parent}
      isArray={true}
      keys={keys()}
      previewKeys={keys().filter((key) => key != "length")}
      getValue={(key) => props.value[key]}
      label={`Array(${length()})`}
      bracketOpen="["
      bracketClose="]"
    />
  );
};
