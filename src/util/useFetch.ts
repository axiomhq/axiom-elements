/*!
  From `react-fetch-hook` NPM
  https://github.com/ilyalesik/react-fetch-hook/blob/67223d783901b282090fc20c9426231119b423cb/index.js

  Copyright (c) 2019 Ilya Lesik.
  Licensed under the MIT License (MIT), see
  https://github.com/ilyalesik/react-fetch-hook
*/

import { FetchResult, UseFetchRequestInit } from './hookTypes';
import { UseFetchError } from './UseFetchError';
import { usePromise } from './usePromise';

export function useFetch<T>(path: RequestInfo, options?: UseFetchRequestInit<T>): FetchResult<T> {
  const isBlocked = ((options && options.depends) || []).reduce(function (accum, dep) {
    return accum || !dep;
  }, false);

  if (isBlocked) {
    // Return empty promise.
    return usePromise();
  }

  return usePromise(
    (input: RequestInfo, init: UseFetchRequestInit<T>) => {
      let responseFormatter: (response: Response) => Promise<T>;

      if (init && init.responseFormatter) {
        responseFormatter = init.responseFormatter;
      } else {
        // Default is to process response as JSON.
        responseFormatter = (response) => {
          if (!response.ok) {
            throw new UseFetchError(response.status, response.statusText, 'Error while fetching data.');
          }

          return response.json();
        };
      }

      return fetch(input, init).then(responseFormatter);
    },
    options?.refreshRateSeconds,
    path,
    options || {}
  );
}
