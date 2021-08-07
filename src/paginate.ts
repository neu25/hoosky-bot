export type PageItem<T> = {
  sortKey: string;
  data: T;
};

export type Page<T> = {
  id: number;
  startKey: string;
  endKey: string;
  items: PageItem<T>[];
};

export const paginate = <T>(
  items: PageItem<T>[],
  groupSize: number,
): Page<T>[] => {
  let start = 0;
  let groupNum = 0;
  const groups: Page<T>[] = [];

  while (start < items.length) {
    const end = Math.min(start + groupSize, items.length);
    const slice = items.slice(start, end);
    const group: Page<T> = {
      id: groupNum,
      startKey: slice[0].sortKey,
      endKey: slice[slice.length - 1].sortKey,
      items: slice,
    };
    groups.push(group);

    start += groupSize;
    ++groupNum;
  }

  return groups;
};
