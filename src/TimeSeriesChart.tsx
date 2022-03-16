import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import React from 'react';

import { ChartHeader } from './ChartHeader';
import { SeriesCharts, SeriesChartsProps } from './SeriesCharts';
import { ComputedQueryResults } from './stores/DatasetStore';
import { Totals } from './Totals';

import styles from './TimeSeriesChart.less';

export interface TimeSeriesChartProps extends Omit<SeriesChartsProps, 'chartInfos' | 'groupId' | 'mode'> {
  computedResults: ComputedQueryResults;
  name?: string;
  innerChartClassName?: string;
  loading?: boolean;
  showResultsTable?: boolean;
}

export interface TimeSeriesChartState {
  highlightedSeries?: string;
}

export class TimeSeriesChart extends React.Component<TimeSeriesChartProps, TimeSeriesChartState> {
  constructor(props: TimeSeriesChartProps) {
    super(props);

    this.state = {
      highlightedSeries: undefined,
    };
  }

  shouldComponentUpdate(nextProps: TimeSeriesChartProps, nextState: TimeSeriesChartState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  render() {
    const { computedResults, className, innerChartClassName, loading, name, showResultsTable, ...passthrough } =
      this.props;
    // const { highlightedSeries } = this.state;

    const {
      id: groupId,
      aggregationCharts: chartInfos,
      order,
      colors,
      totals,
      queryAggs,
      groups,
      aggregationSummaries,
    } = computedResults;

    // Determine how many sections (charts and/or Totals) will be shown to figure out what percentage of the height each should get
    let numSections = 0;
    const nonEmptyChartInfos = chartInfos.filter((chartInfo) => !chartInfo.empty);
    const numCharts = nonEmptyChartInfos.length;
    numSections = numSections + numCharts;

    if (showResultsTable) {
      numSections = numSections + 1;
    }

    const sectionPercent = 100 / numSections;

    return (
      <div className={classNames(styles.root, className)}>
        <ChartHeader loading={loading}>{name}</ChartHeader>
        <SeriesCharts
          mode="query-results"
          groupId={groupId}
          chartClassName={innerChartClassName}
          chartInfos={chartInfos}
          {...passthrough}
          style={{ height: `${numCharts * sectionPercent}%` }}
        />
        {showResultsTable ? (
          <div className={classNames(styles.results, innerChartClassName)} style={{ height: `${sectionPercent}%` }}>
            <Totals
              // key={`totals-${queryResultsKey}`}
              colors={colors}
              totals={totals}
              aggregationSummaries={aggregationSummaries}
              queryAggs={queryAggs}
              groups={groups}
              order={order}
              setHighlightedSeries={this.onSetHighlightedSeries}
              // TODO: enable once we can get unit and thus valueFormatter from query?
              // fieldValueFormatters={fieldValueFormatters}
            />
          </div>
        ) : null}
      </div>
    );
  }

  onSetHighlightedSeries = (highlightedSeries?: string) => {
    this.setState({
      highlightedSeries: highlightedSeries,
    });
  };
}
