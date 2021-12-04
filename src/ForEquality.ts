import { createMemo, createRoot, getOwner, JSX, onCleanup, untrack } from "solid-js";

// Tweaked version of https://github.com/solidjs/solid/blob/main/packages/solid/src/reactive/array.ts
function mapArray2<T, U, V>(list: () => readonly T[], mapFn: (v: T) => U, getID: (a: T) => V): () => U[] {
  let items: V[] = [],
    mapped: U[] = [],
    disposers: (() => void)[] = [],
    len = 0,
    ctx = getOwner()!;

  onCleanup(() => {
    for (let i = 0, length = disposers.length; i < length; i++) disposers[i]();
  });
  return () => {
    let newItems = list() || [],
      i: number,
      j: number;
    function mapper(disposer: () => void) {
      disposers[j] = disposer;
      return mapFn(newItems[j]);
    }

    return untrack(() => {
      let newLen = newItems.length,
        newIndices: Map<V, number>,
        newIndicesNext: number[],
        temp: U[],
        tempdisposers: (() => void)[],
        start: number,
        end: number,
        newEnd: number,
        item: V;

      // fast path for empty arrays
      if (newLen === 0) {
        if (len !== 0) {
          for (i = 0; i < len; i++) disposers[i]();
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
        }
      }
      // fast path for new create
      else if (len === 0) {
        for (j = 0; j < newLen; j++) {
          items[j] = getID(newItems[j]);
          mapped[j] = createRoot(mapper, ctx);
        }
        len = newLen;
      } else {
        temp = new Array(newLen);
        tempdisposers = new Array(newLen);

        // skip common prefix
        for (start = 0, end = Math.min(len, newLen); start < end && items[start] === getID(newItems[start]); start++);

        // common suffix
        for (
          end = len - 1, newEnd = newLen - 1;
          end >= start && newEnd >= start && items[end] === getID(newItems[newEnd]);
          end--, newEnd--
        ) {
          temp[newEnd] = mapped[end];
          tempdisposers[newEnd] = disposers[end];
        }

        // 0) prepare a map of all indices in newItems, scanning backwards so we encounter them in natural order
        newIndices = new Map<V, number>();
        newIndicesNext = new Array(newEnd + 1);
        for (j = newEnd; j >= start; j--) {
          item = getID(newItems[j]);
          i = newIndices.get(item)!;
          newIndicesNext[j] = i === undefined ? -1 : i;
          newIndices.set(item, j);
        }
        // 1) step through all old items and see if they can be found in the new set; if so, save them in a temp array and mark them moved; if not, exit them
        for (i = start; i <= end; i++) {
          item = items[i];
          j = newIndices.get(item)!;
          if (j !== undefined && j !== -1) {
            temp[j] = mapped[i];
            tempdisposers[j] = disposers[i];
            j = newIndicesNext[j];
            newIndices.set(item, j);
          } else disposers[i]();
        }
        // 2) set all the new values, pulling from the temp array if copied, otherwise entering the new value
        for (j = start; j < newLen; j++) {
          if (j in temp) {
            mapped[j] = temp[j];
            disposers[j] = tempdisposers[j];
          } else mapped[j] = createRoot(mapper, ctx);
        }
        // 3) in case the new set is shorter than the old, set the length of the mapped array
        len = mapped.length = newLen;
        // 4) save a copy of the mapped items for the next update
        items = newItems.map(getID);
      }
      return mapped;
    });
  };
}

export function BetterFor<T, U extends JSX.Element, V>(props: {
  each: readonly T[];
  value: (a: T) => V;
  children: (item: T) => U;
}) {
  return createMemo(
    mapArray2<T, U, V>(() => props.each, props.children, props.value),
    undefined,
    { equals: false }
  );
}
