import classNames from 'classnames';
import React from 'react';

import { useAxiomContext } from './AxiomContext';
import { Loading } from './Loading';
import { StatisticChart } from './StatisticChart';
import { computeResults, QueryRequest, QueryResult } from './stores/DatasetStore';
import { TimeSeriesChart } from './TimeSeriesChart';
import { APLQuery } from './types/APLQuery';
import { Query } from './types/Query';
import { ChartColorScheme } from './util/color-schemes';
import { isAplQuery } from './util/isAplQuery';
import { useFetch } from './util/useFetch';

import './styles/elements.less';

import styles from './Chart.less';

export type ChartType = 'Statistic' | 'TimeSeries';

export interface ChartProps {
  // Core options:
  // orgId: string;
  datasetId?: string; // Not required for APL queries
  query: Query | APLQuery;
  type: ChartType;
  name?: string;

  // Refresh options:
  refreshRateSeconds?: number;

  // StatisticChart options:
  colorScheme?: ChartColorScheme;
  showChart?: boolean;

  // TimeSeriesChart Options:
  nullValues?: 'auto' | 'null' | 'span' | 'zero';
  showResultsTable?: boolean;

  // Style:
  className?: string;
  style?: React.CSSProperties;
  loadingNode?: React.ReactNode;

  // Event handlers:
  onLoadingChanged?(loading: boolean): void;
}

export const Chart: React.FC<ChartProps> = ({
  colorScheme,
  datasetId,
  query,
  type,
  name,
  nullValues,
  refreshRateSeconds,
  showChart,
  showResultsTable,
  className,
  style,
  loadingNode,
}) => {
  const { apiDomain, apiKey, orgId } = useAxiomContext();

  const isApl = isAplQuery(query);

  const endPoint = isApl ? '_apl' : `${datasetId}/query`;
  const endPointUrl = `https://${apiDomain}/api/v1/datasets/${endPoint}?format=legacy`;

  const {
    hasRun,
    isLoading,
    data: queryResult,
    error,
  } = useFetch<QueryResult>(endPointUrl, {
    body: JSON.stringify(query),
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
      // orgId is optional.
      // By default the Org the API Token is under will be used.
      ...(orgId
        ? {
            'x-axiom-org-id': orgId,
          }
        : {}),
    },
    mode: 'cors',
    refreshRateSeconds: refreshRateSeconds,
  });

  if (!hasRun) {
    return (
      <div className={classNames(styles['chart'], className)} style={style}>
        {loadingNode || <Loading />}
      </div>
    );
  }

  let ChartNode: React.ReactNode = null;

  if (!error) {
    if (queryResult) {
      // Non-APL queries don't return the `request` object (yet) so manually set it.
      // And since for some reason we redefined `request` to `query` on `QueryRequest` we also need
      // to copy it for APL queries.
      // https://github.com/axiomhq/axiom/issues/3605
      if (isAplQuery(query)) {
        queryResult.query = (queryResult as any).request as QueryRequest;
      } else {
        queryResult.query = query as QueryRequest;
      }

      const computedResults = computeResults(queryResult);
      if (!computedResults) {
        return null;
      }

      switch (type) {
        case 'Statistic':
          ChartNode = (
            <StatisticChart
              loading={isLoading}
              name={name}
              computedResults={computedResults}
              colorScheme={colorScheme}
              showChart={showChart}
            />
          );
          break;
        case 'TimeSeries':
          ChartNode = (
            <TimeSeriesChart
              loading={isLoading}
              name={name}
              computedResults={computedResults}
              // TODO: add highlightedSeries support?
              // highlightedSeries={highlightedSeries}
              spanGaps={nullValues === 'span' || nullValues === 'auto'}
              // TODO: enable once we can get unit and thus valueFormatter from query?
              // fieldValueFormatters={fieldValueFormatters}
              showResultsTable={showResultsTable}
            />
          );
          break;
      }
    }
  }

  return (
    <div className={classNames(styles['chart'], className)} style={style}>
      {ChartNode}

      {error ? (
        <div className={styles['error']}>
          <strong>Failed to load chart data:</strong>
          <code>{JSON.stringify(error)}</code>
        </div>
      ) : null}
    </div>
  );
};
