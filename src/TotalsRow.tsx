import classNames from 'classnames';
import React from 'react';

import { AxiomContext } from './AxiomContext';
import { QueryValues } from './QueryValues';
import { Spectrograph } from './Spectrograph';
import {
  AggregationSummary,
  FieldValueFormatters,
  SpectrographSummary,
  TopkValue,
  TotalInfo,
} from './stores/DatasetStore';
import { Tooltip } from './Tooltip';
import { Aggregation, EntryGroupAgg } from './types/codegenApiTypes';
import { formatNumber, isNumeric } from './util/numbers';
import { formatAnyValue } from './util/strings';
import { ValueFormatter } from './util/units/valueFormats';

import styles from './TotalsRow.less';

export interface TotalsRowProps extends TotalInfo {
  color: string;
  groups: string[]; // computedResults.groups
  aggregations: Aggregation[]; // computedResults.aggregations
  aggregationSummaries: AggregationSummary[]; // computedResults.aggregationSummaries
  fieldValueFormatters?: FieldValueFormatters;
  setHighlightedSeries(highlightedSeries?: string): void;
}

export class TotalsRow extends React.Component<TotalsRowProps> {
  static contextType = AxiomContext;
  context!: React.ContextType<typeof AxiomContext>;

  render() {
    const { id, groups, aggregations, color, setHighlightedSeries, group = {}, aggs } = this.props;

    // 🐉🐉🐉
    // Sync with DatasetStore.downloadCSV if logic changes.

    return (
      <tr
        className={styles.row}
        onMouseEnter={() => {
          setHighlightedSeries(id);
        }}
      >
        <td>
          <div style={{ background: color, height: '10.5px', width: '10.5px' }} />
        </td>
        {groups.map((g: string, i, a) => (
          <td title={group[g]} key={g} className={classNames(styles.group, { [styles.endGroup]: a.length === i + 1 })}>
            {formatAnyValue(group[g], g)}
          </td>
        ))}
        {aggregations.map((aggregation, aggIdx) => {
          return this.renderAggregationValues(aggregation, aggs[aggIdx] || [], aggIdx);
        })}
      </tr>
    );
  }

  renderAggregationValues = (aggregation: Aggregation, aggs: (EntryGroupAgg | undefined)[], aggIdx: number) => {
    const { localizedMessages } = this.context;

    const { op, field, argument } = aggregation;

    const aggKey = `${op}-${field || ''}`;

    const valueFormatter: ValueFormatter | undefined = field ? this.props.fieldValueFormatters?.[field] : undefined;

    switch (op) {
      case Aggregation.OpEnum.Topk:
        const countValues = aggs.map((agg) => {
          let valueNode: React.ReactNode = '-';

          if (agg && agg?.value) {
            const keyCountValues = agg.value as TopkValue[];

            if (keyCountValues.length) {
              const { key, count, error } = keyCountValues[0];

              const formattedKey = `${key}` || localizedMessages.emptyParen;

              // FUTURE: remove if backend provides the correct count.
              // Fix count value by subtracting error. Doing this on the frontend is a stopgap.
              // See: https://github.com/axiomhq/axiom/axiomdb/issues/2029
              const adjustedCount = count - error;

              valueNode = (
                <span>
                  <span className={styles.topkKey}>
                    <Tooltip placement="bottomLeft" overlay={formattedKey}>
                      {formattedKey}
                    </Tooltip>
                  </span>
                  {`: ${formatNumber(adjustedCount)}`}
                </span>
              );
            }
          }

          return valueNode;
        });

        return (
          <td key={aggKey}>
            <QueryValues values={countValues} />
          </td>
        );
      case Aggregation.OpEnum.Percentiles:
        return argument && Array.isArray(argument) && (argument as []).length
          ? argument.map((arg: any, percentileIdx) => {
              const fmtValues = aggs.map((agg, idx) => {
                if (!agg) {
                  return null;
                }

                const value = Array.isArray(agg.value) ? agg.value[percentileIdx] : agg.value;

                if (typeof value === 'number') {
                  return formatNumber(value, valueFormatter);
                }

                return null;
              });

              return (
                <td key={`${aggKey}-${percentileIdx}`}>
                  <QueryValues values={fmtValues} />
                </td>
              );
            })
          : null;
      case Aggregation.OpEnum.Histogram:
        const aggSummary = this.props.aggregationSummaries[aggIdx];

        if (!aggSummary) {
          return null;
        }

        const summary = aggSummary as SpectrographSummary;

        const groupsToValues = summary?.groupsToValues[this.props.id];

        if (!groupsToValues) {
          return null;
        }

        const spectrographs = groupsToValues.map((totalValues) =>
          totalValues ? (
            <Spectrograph
              values={totalValues}
              colorScales={summary.colorScales}
              defaultColor={summary.defaultColor}
              valueFormatter={valueFormatter}
            />
          ) : null
        );

        return (
          <td key={aggKey}>
            <QueryValues values={spectrographs} />
          </td>
        );

      default:
        const values = aggs.map((agg, idx) => {
          let value: any;
          if (!agg || agg.value === null) {
            value = null;
          } else if (typeof agg.value === 'number') {
            value = formatNumber(agg.value, valueFormatter);
          } else if (typeof agg.value === 'object') {
            // The best way to display value like just is to sum so essentially like a COUNT(*)]
            value = Object.values(agg.value as { [key: string]: any }).reduce((accum: number, item) => {
              if (isNumeric(item)) {
                return accum + Number(item);
              }

              return accum;
            }, 0);
          } else {
            value = agg.value;
          }

          return value;
        });

        return (
          <td key={aggKey}>
            <QueryValues values={values} />
          </td>
        );
    }
  };
}
