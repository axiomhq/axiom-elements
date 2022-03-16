/*!
  From `react-fetch-hook` NPM
  https://github.com/ilyalesik/react-fetch-hook/blob/67223d783901b282090fc20c9426231119b423cb/index.d.ts

  Copyright (c) 2019 Ilya Lesik.
  Licensed under the MIT License (MIT), see
  https://github.com/ilyalesik/react-fetch-hook
*/

import { UseFetchError } from './UseFetchError';

export interface PromiseResult<T> {
  hasRun: boolean;
  isLoading: boolean;
  started: boolean;
  data?: T;
  error?: UseFetchError;
}

export type FetchResult<T> = PromiseResult<T>;

export interface UseFetchRequestInit<T> extends RequestInit {
  depends?: unknown[];
  refreshRateSeconds?: number;
  responseFormatter?(response: Response): Promise<T>;
}
