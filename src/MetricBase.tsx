// cSpell:ignore sparkline xaxis yaxis
import classNames from 'classnames';
import capitalize from 'lodash/capitalize';
import React from 'react';

import { ChartHeader } from './ChartHeader';
import { LineChart } from './LineChart';
import { AggregationChartInfo, LineChartInfo } from './stores/DatasetStore';
import { Tailor } from './Tailor';
import { hashCode } from './util/hashCode';

import styles from './MetricBase.less';

// eslint-disable-next-line import/order
import themeStyles from './styles/theme.less';

const textThemes = {
  ['Blue']: styles.themeTextBlue,
  ['Green']: styles.themeTextGreen,
  ['Orange']: styles.themeTextOrange,
  ['Purple']: styles.themeTextPurple,
  ['Red']: styles.themeTextRed,
  ['Teal']: styles.themeTextTeal,
};

const bgThemes = {
  ['Blue']: styles.themeBackgroundBlue,
  ['Green']: styles.themeBackgroundGreen,
  ['Orange']: styles.themeBackgroundOrange,
  ['Purple']: styles.themeBackgroundPurple,
  ['Red']: styles.themeBackgroundRed,
  ['Teal']: styles.themeBackgroundTeal,
};

export interface MetricBaseProps {
  background: string;
  className?: string;
  text: string;
  textColor: string;
  chartHeight?: string | number;
  chartInfo?: AggregationChartInfo;
  dimmed?: boolean;
  icon?: React.ReactNode;
  label?: string;
  labelColor?: string;
  uppercase?: boolean;
  showChart?: boolean;
  hideValue?: boolean;
  hideHeader?: boolean;
  loading?: boolean;
  chartColorScheme?: string;
  backgroundColorScheme?: string;
  renderMenu?(): React.ReactNode;
}

export class MetricBase extends React.Component<MetricBaseProps> {
  static defaultProps = {
    chartHeight: '30px',
    dataKey: 'value',
    labelsDataKey: 'timestamp',
  };

  render() {
    const {
      chartHeight,
      className,
      chartInfo,
      dimmed,
      icon,
      label,
      loading,
      renderMenu,
      text,
      textColor,
      uppercase,
      showChart,
      hideValue,
      hideHeader,
      chartColorScheme,
      backgroundColorScheme,
    } = this.props;
    const { background, labelColor } = this.props;
    const themedTextStyle = chartColorScheme ? textThemes[chartColorScheme] : undefined;
    const themedBackgroundStyle = backgroundColorScheme ? bgThemes[backgroundColorScheme] : undefined;

    return (
      <div
        className={classNames(
          'test-metric',
          classNames(
            styles.root,
            hideHeader ? undefined : styles.rootHeaderAdjust,
            { [styles.dimmed]: dimmed },
            className
          ),
          themedBackgroundStyle
        )}
        style={{ background: themedBackgroundStyle ? undefined : background }}
      >
        {hideHeader ? null : (
          <ChartHeader
            loading={loading}
            style={{ background: themedBackgroundStyle ? undefined : background }}
            renderMenu={renderMenu}
          >
            <span className={styles.icon}>{icon}</span>
            <span
              className={classNames(styles.label, uppercase ? styles.uppercase : undefined)}
              style={{ color: labelColor }}
            >
              {label}
            </span>
          </ChartHeader>
        )}

        {hideValue ? null : (
          <span className={styles.textOuter}>
            <span
              className={classNames(styles.textInner, themedTextStyle)}
              style={{ color: themedTextStyle ? undefined : textColor }}
            >
              <Tailor key={hashCode(text)} canGrow>
                {text}
              </Tailor>
            </span>
          </span>
        )}

        {showChart && chartInfo !== undefined ? (
          <LineChart
            className={styles.chart}
            height={chartHeight}
            chartInfo={chartInfo as LineChartInfo}
            color={chartColorScheme ? themeStyles[`text${capitalize(chartColorScheme)}`] : themeStyles.textBlue}
            fill={
              chartColorScheme ? themeStyles[`backgrounds${capitalize(chartColorScheme)}`] : themeStyles.backgroundsBlue
            }
            sparkline={true}
          />
        ) : null}
      </div>
    );
  }
}
