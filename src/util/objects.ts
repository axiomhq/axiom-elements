export function orderedStringify(obj: any): string {
  const allKeys: any = [];

  // stringify will recurse whole object. Take advantage of that to build up list of keys.
  JSON.stringify(obj, (key, value) => {
    allKeys.push(key);

    return value;
  });

  allKeys.sort();

  return JSON.stringify(obj, allKeys);
}
