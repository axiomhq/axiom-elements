/*!
  From `react-fetch-hook` NPM
  https://github.com/ilyalesik/react-fetch-hook/blob/67223d783901b282090fc20c9426231119b423cb/usePromise.js
  Copyright (c) 2019 Ilya Lesik.
  Licensed under the MIT License (MIT), see
  https://github.com/ilyalesik/react-fetch-hook

  Mixed with custom useInterval hook by Dan Abramov.
  https://github.com/gaearon/overreacted.io/blob/588b0994a609a2189d54d8ef93d7b3e5d9781c5c/src/pages/making-setinterval-declarative-with-react-hooks/index.md
  Licensed under the MIT License (MIT), see
  https://github.com/gaearon/overreacted.io/blob/master/LICENSE-code-snippets
*/

import { useEffect, useRef, useState } from 'react';

import { flattenInput } from './flattenInput';
import { PromiseResult } from './hookTypes';

export function usePromise<T>(
  callFunction?: (...args: any[]) => Promise<T>,
  refreshRateSeconds?: number,
  ...args: any[]
): PromiseResult<T> {
  const savedCallback = useRef<(...args: any[]) => Promise<T>>();

  const [state, setState] = useState<PromiseResult<T>>({
    hasRun: false,
    isLoading: !!callFunction,
    started: false,
  });

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callFunction;
  }, [callFunction, refreshRateSeconds, flattenInput(args)]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (!state.isLoading || !state.started) {
        setState({ data: state.data, isLoading: true, hasRun: state.hasRun, started: true });
      }

      savedCallback.current!(...args)
        .then(function (data) {
          setState({
            error: undefined,
            data: data,
            isLoading: false,
            hasRun: true,
            started: true,
          });
        })
        .catch(function (error) {
          setState({
            error: error,
            isLoading: false,
            hasRun: true,
            started: true,
          });
        });
    }

    if (!state.started) {
      tick();
    }

    if (refreshRateSeconds) {
      const id = window.setInterval(tick, refreshRateSeconds * 1000);

      return () => window.clearInterval(id);
    }

    return;
  }, [callFunction, refreshRateSeconds, flattenInput(args)]);

  return state;
}
