/*!
  From `react-fetch-hook` NPM
  https://github.com/ilyalesik/react-fetch-hook/blob/67223d783901b282090fc20c9426231119b423cb/utils/flattenInput.js

  Copyright (c) 2019 Ilya Lesik.
  Licensed under the MIT License (MIT), see
  https://github.com/ilyalesik/react-fetch-hook
*/

export function flattenInput(...args: any[]): any[] {
  let res: any[] = [];
  for (let i = 0; i < args.length; i++) {
    const input = args[i];
    if (input instanceof Array) {
      for (let j = 0; j < input.length; j++) {
        res = res.concat(flattenInput(input[j]));
      }
    } else if (typeof URL !== 'undefined' && input instanceof URL) {
      res = res.concat(input.toJSON());
    } else if (input instanceof Object) {
      const keys = Object.keys(input);
      for (let k = 0; k < keys.length; k++) {
        const key = keys[k] as keyof typeof input;
        res = res.concat([key]).concat(flattenInput(input[key]));
      }
    } else {
      res = res.concat(input);
    }
  }

  return res;
}
