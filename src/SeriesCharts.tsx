// cSpell:ignore uplot
import classNames from 'classnames';
import React from 'react';

import { HeatMapChart } from './HeatMapChart';
import { getLabelsForLineChart, LineChart, LineChartProps } from './LineChart';
import { PercentilesChart } from './PercentilesChart';
import {
  AggregationChartInfo,
  AggregationChartType,
  FieldValueFormatters,
  HeatMapChartInfo,
  LineChartInfo,
  PercentilesChartInfo,
  TopkChartInfo,
} from './stores/DatasetStore';
import { TopkChart } from './TopkChart';
import { LABEL_AXES_STYLE } from './UPlotChart';

import styles from './SeriesCharts.less';

export interface SeriesChartsState {
  syncedLabelChartHeight?: number;
}

export interface SeriesChartsProps
  extends Pick<LineChartProps, 'className' | 'groupId' | 'highlightedSeries' | 'spanGaps'> {
  groupId: string;
  chartInfos: AggregationChartInfo[];
  chartClassName?: string;
  // This prop will be passed to each chart so they can calculate their own height
  chartsWillCalcHeight?: boolean;
  mode: 'dashboards' | 'query-results';
  style?: React.CSSProperties;
  fieldValueFormatters?: FieldValueFormatters;
}

export class SeriesCharts extends React.Component<SeriesChartsProps, SeriesChartsState> {
  private lastSyncedLabelChartHeight: number | undefined;

  constructor(props: SeriesChartsProps) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      chartClassName,
      chartInfos,
      className,
      groupId,
      chartsWillCalcHeight,
      highlightedSeries,
      mode,
      spanGaps,
      style,
      fieldValueFormatters,
    } = this.props;
    if (!chartInfos.length) {
      return null;
    }

    // When there are fewer charts we want them to be taller
    const idealTimeSeriesHeight = chartsWillCalcHeight ? ((chartInfos.length || 1) < 3 ? 275 : undefined) : undefined;

    // Get a ctx to accurately measure the widest label
    const canvas: HTMLCanvasElement | null = document.querySelector('.uplot canvas');
    let ctx: CanvasRenderingContext2D | null = null;

    if (canvas) {
      ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.font = LABEL_AXES_STYLE;
      }
    }

    const { syncedLabelChartHeight } = this.state;

    const padding = mode === 'dashboards' ? 8 : 48;
    const syncedHeight = syncedLabelChartHeight !== undefined ? syncedLabelChartHeight - padding : undefined;

    let minYAxisLabelWidth = chartInfos
      // Only need this value for synchronizing line charts at the moment
      .filter((info) => info.type === AggregationChartType.Line)
      .reduce((chartInfoAccumulator, chartInfo) => {
        const lineChartInfo = chartInfo as LineChartInfo;

        const valueFormatter = chartInfo.aggregation.field
          ? fieldValueFormatters?.[chartInfo.aggregation.field]
          : undefined;

        const labels =
          getLabelsForLineChart({ chartInfo: lineChartInfo, height: syncedHeight, valueFormatter: valueFormatter }) ||
          [];

        let longestLabelWidth = chartInfoAccumulator;

        labels.forEach((label) => {
          if (ctx) {
            longestLabelWidth = Math.max(longestLabelWidth, ctx.measureText(label).width);
          } else {
            // 🐉🐉🐉
            // Width of a digit drawn with y axis config in UPlotChart.tsx
            const systemFontMWidth = 6.42;
            longestLabelWidth = Math.max(longestLabelWidth, label.length * systemFontMWidth);
          }
        });

        return longestLabelWidth;
      }, 0);

    minYAxisLabelWidth = minYAxisLabelWidth + 20; // 20px padding because uPlot still messes this up

    return (
      <div className={classNames(styles.root, styles[mode], className)} style={style}>
        {chartInfos
          .filter((chartInfo) => !chartInfo.empty)
          .map((chartInfo, idx) => {
            let chartNode: React.ReactNode | null = null;

            const valueFormatter = chartInfo.aggregation.field
              ? fieldValueFormatters?.[chartInfo.aggregation.field]
              : undefined;

            switch (chartInfo.type) {
              case AggregationChartType.Percentiles:
                chartNode = (
                  <PercentilesChart
                    groupId={groupId}
                    height={idealTimeSeriesHeight}
                    chartInfo={chartInfo as PercentilesChartInfo}
                    className={chartClassName}
                    valueFormatter={valueFormatter}
                  />
                );
                break;
              case AggregationChartType.Line:
                chartNode = (
                  <LineChart
                    groupId={groupId}
                    chartInfo={chartInfo as LineChartInfo}
                    height={idealTimeSeriesHeight}
                    highlightedSeries={highlightedSeries}
                    spanGaps={spanGaps}
                    minYAxisLabelWidth={minYAxisLabelWidth}
                    className={chartClassName}
                    onResize={this.onSyncedLabelChartResize}
                    valueFormatter={valueFormatter}
                  />
                );
                break;
              case AggregationChartType.HeatMap:
                chartNode = (
                  <HeatMapChart
                    groupId={groupId}
                    chartInfo={chartInfo as HeatMapChartInfo}
                    height={idealTimeSeriesHeight}
                    highlightedSeries={highlightedSeries}
                    className={chartClassName}
                    valueFormatter={valueFormatter}
                  />
                );
                break;
              case AggregationChartType.Topk:
                chartNode = (
                  <TopkChart
                    groupId={groupId}
                    chartInfo={chartInfo as TopkChartInfo}
                    className={classNames(styles.topK, chartClassName)}
                  />
                );
                break;
              default:
            }

            return (
              <div
                key={chartInfo.id}
                style={{
                  // Divide vertical space equally.
                  height: `${100 / (chartInfos.length || 1)}%`,
                }}
              >
                <div
                  // Need to compute this class instead of using CSS because of the inline style on the parent
                  className={classNames(styles.chartWrapper, { [styles.lastChild]: idx === chartInfos.length - 1 })}
                >
                  <div className={classNames(styles.chart)}>{chartNode}</div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  onSyncedLabelChartResize = (width?: number, height?: number) => {
    if (height !== this.lastSyncedLabelChartHeight) {
      this.lastSyncedLabelChartHeight = height;

      this.setState({ syncedLabelChartHeight: height });
    }
  };
}
