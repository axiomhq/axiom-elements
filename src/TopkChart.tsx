import classNames from 'classnames';
import flatten from 'lodash/flatten';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { AxiomContext } from './AxiomContext';
import { TopkChartInfo } from './stores/DatasetStore';
import { Tooltip } from './Tooltip';
import { formatNumber } from './util/numbers';

import styles from './TopkChart.less';

export interface TopkChartProps {
  groupId: string;
  chartInfo: TopkChartInfo;
  className?: string;
}

export class TopkChart extends React.Component<TopkChartProps> {
  static contextType = AxiomContext;
  context!: React.ContextType<typeof AxiomContext>;

  render() {
    const { localizedMessages } = this.context;
    const { className } = this.props;
    const { groups, groupValues, aggregation, hasAgainst, hasGroups, maxCountValue, groupColors, empty, title } =
      this.props.chartInfo;

    const countWidth = Math.max(
      formatNumber(maxCountValue).length * 9.78 + 5, // 'M' width for 11px mono font + 5px
      100 // Alt min width
    );

    const maxBarWidth = countWidth * 0.95; // It looks weird to just have the cell filled up all the way

    return (
      <div className={classNames(styles.chart, className)}>
        <div className={styles.title}>{title}</div>
        {empty ? (
          <p className={styles.emptyMsg}>{localizedMessages.noData}</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {hasAgainst ? <th className={styles.againstHeader}>{localizedMessages.against}</th> : null}
                <th>{localizedMessages.count}</th>
                <th>
                  <div
                    className={styles.field}
                    // Using data-title to prevent double tooltips
                    data-title={aggregation.field}
                  >
                    {aggregation.field}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {flatten(
                groups.map((group) => {
                  const thisGroupValues = groupValues[group];

                  if (!thisGroupValues) {
                    return null;
                  }

                  const groupColor = groupColors[group];

                  return thisGroupValues.map((keyCountValues, valuesIdx) => {
                    const { key, count } = keyCountValues;

                    const primaryCount = count.length > 0 && count[0] ? count[0] : null;
                    const againstCount = hasAgainst && count.length > 1 && count[1] ? count[1] : null;

                    return [
                      hasGroups && valuesIdx === 0 ? (
                        <tr key={group}>
                          <td colSpan={hasAgainst ? 3 : 2} className={styles.groupCell}>
                            <div className={styles.copyWrapper}>
                              <Tooltip placement="bottomLeft" overlay={group}>
                                <div
                                  className={classNames(styles.group)}
                                  // Using data-title to prevent double tooltips
                                  data-title={group}
                                >
                                  {group}
                                </div>
                              </Tooltip>
                              <CopyToClipboard text={group}>
                                <button className={styles.copy}>{localizedMessages.copy}</button>
                              </CopyToClipboard>
                            </div>
                          </td>
                        </tr>
                      ) : null,
                      <tr key={`${group}-${key}`}>
                        {hasAgainst
                          ? this.renderBar({
                              countWidth: countWidth,
                              count: againstCount,
                              maxCountValue: maxCountValue,
                              groupColor: groupColor,
                              maxBarWidth: maxBarWidth,
                              className: styles.againstCell,
                            })
                          : null}
                        {this.renderBar({
                          countWidth: countWidth,
                          count: primaryCount,
                          maxCountValue: maxCountValue,
                          groupColor: groupColor,
                          maxBarWidth: maxBarWidth,
                        })}
                        <td className={styles.keyCell}>
                          <div className={styles.copyWrapper}>
                            <Tooltip placement="bottomLeft" overlay={key}>
                              <div
                                className={classNames(styles.key)}
                                // Using data-title to prevent double tooltips
                                data-title={key}
                              >
                                {key}
                              </div>
                            </Tooltip>
                            <CopyToClipboard text={key}>
                              <button className={styles.copy}>{localizedMessages.copy}</button>
                            </CopyToClipboard>
                          </div>
                        </td>
                      </tr>,
                    ];
                  });
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  renderBar = ({
    countWidth,
    count,
    maxCountValue,
    maxBarWidth,
    groupColor,
    className,
  }: {
    countWidth: number;
    count: number | null;
    maxCountValue: number;
    maxBarWidth: number;
    groupColor: string;
    className?: string;
  }) => {
    return (
      <td className={classNames(className)} style={{ width: `${countWidth}px`, minWidth: `${countWidth}px` }}>
        <div className={styles.count}>
          <div className={styles.value}>{formatNumber(count) || '-'}</div>
          {count !== null && maxCountValue !== 0 ? (
            <div
              className={styles.bar}
              style={{
                width: `${(count / maxCountValue) * maxBarWidth}px`,
                backgroundColor: groupColor,
                minWidth: '2px',
              }}
            />
          ) : null}
        </div>
      </td>
    );
  };
}
