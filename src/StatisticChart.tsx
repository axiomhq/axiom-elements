import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import React from 'react';

import { MetricBase } from './MetricBase';
import { ComputedQueryResults } from './stores/DatasetStore';
import { ChartColorScheme } from './util/color-schemes';
import { formatNumber } from './util/numbers';
import { ValueFormatter } from './util/units/valueFormats';

import styles from './StatisticChart.less';

// eslint-disable-next-line import/order
import themeStyles from './styles/theme.less';

export type StatisticChartVariant = 'default' | 'ok' | 'warn' | 'error';

export interface StatisticChartColorProps {
  background?: string;
  chartFillColor?: string;
  labelColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
}

export interface StatisticChartProps {
  computedResults: ComputedQueryResults;
  dimmed?: boolean;
  hideHeader?: boolean;
  hideValue?: boolean;
  name?: string;
  colorScheme?: ChartColorScheme;
  showChart?: boolean;

  className?: string;
  loading?: boolean;
  renderMenu?(): React.ReactNode;
}

export class StatisticChart extends React.Component<StatisticChartProps> {
  static defaultProps = {
    colorScheme: 'Blue',
  };

  shouldComponentUpdate(nextProps: StatisticChartProps) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    const {
      computedResults,
      className,
      colorScheme,
      dimmed,
      hideHeader,
      hideValue,
      loading,
      name,
      renderMenu,
      showChart,
    } = this.props;

    if (
      computedResults?.totals?.length &&
      computedResults?.totals[0].aggs.length &&
      computedResults?.totals[0].aggs[0].length &&
      typeof computedResults?.totals[0].aggs[0][0]?.value === 'number'
    ) {
      // There should be only one aggregation.
      const total: number | undefined = computedResults?.totals[0].aggs[0][0]?.value;

      let backgroundColorScheme: string | undefined;
      let chartColorScheme: string | undefined;

      const colorProps: StatisticChartColorProps = {
        background: '#FFFFFF',
        chartFillColor: themeStyles.textBlue,
        textColor: themeStyles.textBlue,
      };

      // override if theme is set - invertTheme(false) = background gradient, invertTheme(true) = text/chart gradient
      if (colorScheme) {
        // Default undefined `invertTheme` to true.
        // const invertTheme = statisticChart.invertTheme !== false;
        const invertTheme = true;
        chartColorScheme = invertTheme ? colorScheme : undefined;
        colorProps.chartFillColor = invertTheme ? undefined : 'rgba(255, 255, 255, 0.74)';
        backgroundColorScheme = invertTheme ? undefined : colorScheme;

        if (!invertTheme) {
          colorProps.textColor = 'rgba(255, 255, 255, 0.74)';
          colorProps.labelColor = '#FFFFFF';
        }
      }

      const chartInfo = computedResults?.aggregationCharts[0];

      const fieldValueFormatters = computedResults?.fieldValueFormatters;

      let valueFormatter: ValueFormatter | undefined;

      if (chartInfo && chartInfo.aggregation.field && fieldValueFormatters) {
        valueFormatter = fieldValueFormatters[chartInfo.aggregation.field];
      }

      return (
        <MetricBase
          chartInfo={computedResults?.aggregationCharts[0]}
          dimmed={dimmed}
          labelColor={colorProps.labelColor}
          background={colorProps.background!}
          chartHeight={'30%'}
          className={classNames(styles.root, className)}
          textColor={colorProps.textColor!}
          chartColorScheme={chartColorScheme}
          backgroundColorScheme={backgroundColorScheme}
          icon={colorProps.icon}
          label={name}
          renderMenu={renderMenu}
          text={formatNumber(total, valueFormatter)}
          showChart={showChart}
          hideValue={hideValue}
          hideHeader={hideHeader}
          loading={loading}
        />
      );
    } else {
      return null;
    }
  }
}
