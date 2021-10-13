import { JSONNested } from "./JSONNested";
import { Component, createSignal, onCleanup } from "solid-js";
import { JSONEditableProps, JSONNodeProps } from "./p";

export const JSONObjectNode: Component<
  {
    expanded?: boolean;
    key: string;
    nodeType: string;
  } & JSONNodeProps &
    JSONEditableProps<Record<string, any>>
> = (props) => {
  const [keys, setKeys] = createSignal<string[]>([], {
    equals: (array1, array2) =>
      array1.length === array2.length && array1.every((value, index) => value === array2[index]),
  });
  const ud = () => {
    try {
      setKeys(Object.getOwnPropertyNames(props.value));
    } catch (e) {
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
      keys={keys()}
      previewKeys={keys()}
      getValue={(k: string) => {
        try {
          return props.value[k];
        } catch (e) {
          return null;
        }
      }}
      label={`${props.nodeType} `}
      bracketOpen={"{"}
      bracketClose={"}"}
    />
  );
};
