import classNames from 'classnames';
import debounce from 'lodash/debounce';
import React from 'react';

import {
  AggregationSummary,
  ChartColors,
  FieldValueFormatters,
  formatAggregationHeader,
  formatPercentile,
  TotalInfo,
} from './stores/DatasetStore';
import { TotalsRow } from './TotalsRow';
import { Aggregation, Order } from './types/codegenApiTypes';

import styles from './Totals.less';

export interface TotalsProps {
  totals: TotalInfo[]; // computedResults.totals
  aggregationSummaries: AggregationSummary[]; // computedResults.aggregationSummaries
  queryAggs: Aggregation[]; // computedResults.queryAggs
  groups: string[]; // computedResults.groups
  order?: Order;
  colors: ChartColors;
  fieldValueFormatters?: FieldValueFormatters;
  setHighlightedSeries(highlightedSeries?: string): void;
}

export class Totals extends React.Component<TotalsProps> {
  private debouncedSetHighlightedSeries: (highlightedSeries?: string) => void;

  constructor(props: TotalsProps) {
    super(props);

    // Call is debounced to not trigger as many re-renders when quickly scrolling over the rows
    this.debouncedSetHighlightedSeries = debounce(this.props.setHighlightedSeries, 100);
  }
  render() {
    const { colors, totals, queryAggs, groups, aggregationSummaries, fieldValueFormatters } = this.props;

    if (!totals.length) {
      return null;
    }

    // FIXME: not currently set or used
    // const orderedBy = order ? order.field : '';
    // const desc = order ? order.desc : false;

    // 🐉🐉🐉
    // Sync with DatasetStore.downloadCSV if logic changes.

    return (
      <div className={styles.totals}>
        <div className={classNames(styles.scrollBox, styles.rounded)}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                {groups.map((g, i, a) => (
                  <th key={g} className={classNames(styles.groupBy, { [styles.endGroup]: a.length === i + 1 })}>
                    {g}
                  </th>
                ))}
                {this.renderAggregationHeaders(queryAggs)}
              </tr>
            </thead>
            <tbody
              onMouseLeave={() => {
                this.debouncedSetHighlightedSeries(undefined);
              }}
            >
              {totals.map((row) => (
                <TotalsRow
                  key={row.id}
                  color={colors[row.id]?.dark}
                  groups={groups}
                  aggregations={queryAggs}
                  aggregationSummaries={aggregationSummaries}
                  setHighlightedSeries={this.debouncedSetHighlightedSeries}
                  fieldValueFormatters={fieldValueFormatters}
                  {...row}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderAggregationHeaders = (queryAggs: Aggregation[]) => {
    const numP = queryAggs.filter((queryAgg) => queryAgg.op === Aggregation.OpEnum.Percentiles).length;
    const fmtPField = numP > 1;

    return queryAggs.map((queryAgg) => {
      switch (queryAgg.op) {
        case Aggregation.OpEnum.Percentiles:
          if (queryAgg.argument) {
            return queryAgg.argument.map((percentile: any) => {
              // Assumes arg is a decimal number which needs to be turned into a magic key, e.g. 0.95 -> P95
              let qKey = formatPercentile(percentile);

              if (fmtPField) {
                if (queryAgg.alias) {
                  qKey = `${queryAgg.alias} ${qKey}`;
                } else if (queryAgg.field) {
                  qKey = `${queryAgg.field} ${qKey}`;
                }
              }

              return (
                <th key={qKey} className={styles.aggHeader}>
                  {qKey}
                </th>
              );
            });
          }

        // eslint-disable-next-line no-fallthrough
        default:
          const key = formatAggregationHeader(queryAgg);

          return (
            <th key={key} className={styles.aggHeader}>
              {key}
            </th>
          );
      }
    });
  };
}
