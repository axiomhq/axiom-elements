// cSpell:ignore uplot cursortt numbro

import 'uplot/dist/uPlot.min.css';

import classNames from 'classnames';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import isSameDay from 'date-fns/isSameDay';
import isSameYear from 'date-fns/isSameYear';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import isNumber from 'lodash/isNumber';
import merge from 'lodash/merge';
import uniq from 'lodash/uniq';
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import uPlot from 'uplot';

import { AxiomContext } from './AxiomContext';
import { formatNumber } from './util/numbers';
import { FormattedValue, ValueFormatter } from './util/units/valueFormats';

import styles from './UPlotChart.less';

// eslint-disable-next-line import/order
import themeStyles from './styles/theme.less';

const TITLE_HEIGHT = 18; // If the styles change then this value needs to also

const MAX_INTEGER_CORRECTION = 1e6;

export function formatTicks(splits: number[], dataExceedsMaxInteger: boolean = false) {
  let fixedSplits = splits;

  // Check if we need to readjust in the case our data exceeded MAX_SAFE_INTEGER.
  if (dataExceedsMaxInteger) {
    fixedSplits = splits.map((split) => split * MAX_INTEGER_CORRECTION);
  }

  // Determine the longest mantissa needed and format all splits using that length so the labels are a consistent size
  const mantissaLengths = fixedSplits
    .map((split) =>
      formatNumber(split, undefined, { notation: 'compact', compactDisplay: 'short' }).match(/\.([0-9]+)/)
    )
    .map((matches) => (matches !== null && matches.length > 1 ? matches[1].length : 0));

  const nonMatchingLength = mantissaLengths.find((thisLength) =>
    mantissaLengths.find((length) => length !== thisLength)
  );

  const maxMantissa = Math.max(...mantissaLengths);

  return fixedSplits.map((split) =>
    formatNumber(split, undefined, {
      notation: 'compact',
      compactDisplay: 'short',
      // Use minimumFractionDigits to create the equivalent of numbro's trimMantissa.
      minimumFractionDigits: nonMatchingLength === undefined ? undefined : maxMantissa,
      maximumFractionDigits: maxMantissa,
    })
  );
}

const formattedValueToString = (value: FormattedValue) => {
  const { prefix, suffix, text } = value;

  return `${prefix || ''}${text || ''}${suffix || ''}`;
};

export function getValues(splits: number[], valueFormatter?: ValueFormatter, dataExceedsMaxInteger?: boolean) {
  const maxSplitLength = Math.max(...splits.map((split) => split.toString().length));

  if (valueFormatter) {
    // Find a consistent number of decimal places to use.
    const getSplitsForDecimals = (decimals: number): string[] => {
      const fmtSplits = splits.map((split) => {
        return formattedValueToString(
          valueFormatter(split, { decimals: decimals, opts: { minimumFractionDigits: decimals } })
        );
      });

      // Check if we have a consistent number of decimals.
      if (
        uniq(fmtSplits).length === splits.length ||
        // Something seems wrong. Bail out so this doesn't run forever.
        decimals > maxSplitLength
      ) {
        return fmtSplits;
      }

      return getSplitsForDecimals(decimals + 1);
    };

    return getSplitsForDecimals(0);
  }

  return formatTicks(splits, dataExceedsMaxInteger);
}

export function calcChartHeight(height: number, hasTitle: boolean, isSparkline: boolean) {
  return hasTitle &&
    // sparklines don't support title
    !isSparkline
    ? height - TITLE_HEIGHT
    : height;
}

export const LABEL_AXES_STYLE = `${themeStyles.fontSizeYAxis} ${themeStyles.fontFamily}`;

function getChartSize(height: number, width: number, hasTitle: boolean, isSparkline: boolean) {
  // sizing/height
  const finalHeight = calcChartHeight(height, hasTitle, isSparkline);

  return { height: finalHeight, width: width };
}

export interface UPlotPlugin {
  opts?: ((self: uPlot, opts: uPlot.Options) => void) | undefined;
  hooks: uPlot.Hooks.Arrays;
}

// Omit height, width so they can be optional and this component cant take care
// of them if they're not specified
export type UPlotOptions = Omit<uPlot.Options, 'height' | 'width' | 'legend'>;

export interface UPlotAxis extends Omit<uPlot.Axis, 'values'> {
  values?: any; // the provided type doesn't match the documentation: https://github.com/leeoniya/uPlot/tree/master/docs#axis--grid-opts
}

export interface UPlotChartInternalState {
  active: boolean;
  xVal?: any;
  yVal?: any;
  u?: any;
  left?: number;
  top?: number;
  idx?: number;
  tooltipStyle?: React.CSSProperties;
  isPinned?: boolean;
  error?: unknown;
}

export interface UPlotChartInternalProps {
  height: number;
  width: number;
  options: UPlotOptions;
  data: uPlot.AlignedData;
  groupId?: string;
  sparkline?: boolean;
  valueFormatter?: ValueFormatter;
  renderTooltip?(pos: {
    u: uPlot;
    // Cursor props at the last point the cursor was moved
    // These values should be used instead of accessing u.cursor because those become meaningless once you hover over a tooltip
    x: number;
    y: number;
    idx?: number;
    top?: number;
  }): React.ReactNode;
  onUPlotError?(error: unknown): void;
}

class UPlotChartInternal extends React.Component<UPlotChartInternalProps, UPlotChartInternalState> {
  static contextType = AxiomContext;
  context!: React.ContextType<typeof AxiomContext>;

  private elemRef = React.createRef<HTMLDivElement>();
  private tooltipRef = React.createRef<HTMLDivElement>();
  private rootRef = React.createRef<HTMLDivElement>();
  private chart: uPlot | undefined;
  private dataExceedsMaxInteger: boolean[] = [];
  private tooltipNode: React.ReactNode;

  constructor(props: UPlotChartInternalProps) {
    super(props);

    this.state = {
      active: false,
    };
  }

  componentDidMount() {
    this.setEventListeners();

    this.draw();
  }

  componentDidUpdate(prevProps: UPlotChartInternalProps, prevState: UPlotChartInternalState) {
    if (this.chart) {
      // The ability to set series options is very limited so if the options change
      // we have to recreate the chart
      if (!isEqual(prevProps.options, this.props.options)) {
        if (prevState.error) {
          this.setState({
            error: undefined,
          });
        }

        this.chart.destroy();
        this.draw();

        return;
      }

      if (!isEqual(prevProps.data, this.props.data)) {
        const fixedData = this.fixData();

        this.chart.setData(fixedData, true); // Second param is to reset the scales
      }

      if (prevProps.height !== this.props.height || prevProps.width !== this.props.width) {
        this.chart.setSize(this.size());
      }
    }

    if (this.props.renderTooltip && this.state.active && prevState.left !== this.state.left) {
      this.positionTooltip();
    }
  }

  componentWillUnmount() {
    window.document.body.removeEventListener('mousedown', this.onDocumentMouseDown);
    window.document.body.removeEventListener('mouseover', this.onDocumentMouseOver);

    if (this.rootRef.current) {
      this.rootRef.current.removeEventListener('mouseenter', this.onChartMouseEnter);
    }

    if (this.chart) {
      this.chart.destroy();
    }
  }

  render() {
    const { renderTooltip } = this.props;

    const { error, xVal, yVal, u, active, tooltipStyle, isPinned, idx, top } = this.state;

    const canRenderTooltip = isNumber(xVal) && isNumber(yVal) && u && active;

    this.tooltipNode =
      canRenderTooltip && renderTooltip ? renderTooltip({ x: xVal, y: yVal, u: u, idx: idx, top: top }) : null;

    const noIntervalData = renderTooltip && this.tooltipNode === null;

    return (
      <div
        className={classNames(styles.root, {
          [styles.active]: this.state.active,
          [styles.pinned]: isPinned,
          [styles.noIntervalData]: noIntervalData,
        })}
        ref={this.rootRef}
      >
        {error ? (
          <div className={styles['uplot-chart-error']}>
            <div>{String(error)}</div>
          </div>
        ) : (
          <div ref={this.elemRef}></div>
        )}
        {renderTooltip ? (
          <div className={styles.tooltip} ref={this.tooltipRef} style={tooltipStyle}>
            {this.tooltipNode}
          </div>
        ) : null}
      </div>
    );
  }

  setEventListeners = () => {
    // Add listener to body so clicking elsewhere can unset any properties
    window.document.body.addEventListener('mousedown', this.onDocumentMouseDown);
    window.document.body.addEventListener('mouseover', this.onDocumentMouseOver);

    if (this.rootRef.current) {
      // Using mouseleave on the outer chart ensures that uPlot can't prevent the event from propagating/being handled but the outer chart is larger than the crosshair area
      this.rootRef.current.addEventListener('mouseenter', this.onChartMouseEnter);
    }
  };

  options = (): uPlot.Options => {
    const { timeZone } = this.context;
    const { options, groupId, sparkline, valueFormatter } = this.props;
    const { axes, plugins = [], series } = options;

    const otherAxesProps: any = {};
    const otherOptions: any = {};

    if (sparkline) {
      otherAxesProps.show = false;

      otherOptions.title = undefined;
      otherOptions.cursor = { show: false };
    }

    // axes
    const axesDefaults: UPlotAxis = {
      // show: true,
      // label: "Population",
      labelSize: 30,
      //labelFont: 'bold 12px Arial',
      labelFont: LABEL_AXES_STYLE,
      // font: '12px Arial',
      font: LABEL_AXES_STYLE,
      gap: 5,
      size: 50,
      space: 14, // Min space between ticks, this yields a reasonable number of ticks on Analytics
      // Value function for y-axis
      values: (self: uPlot, splits: number[], axisIdx: number, foundSpace: number, foundIncr: number) => {
        return getValues(splits, valueFormatter, this.dataExceedsMaxInteger[axisIdx]);
      },
      // stroke: 'red',
      stroke: themeStyles.textMuted,
      grid: {
        // show: true,
        stroke: '#eee',
        width: 1,
        // dash: [],
      },
      ticks: {
        // show: true,
        stroke: '#eee',
        width: 1,
        // dash: [],
        size: 10,
      },
      ...otherAxesProps,
    };

    const xAxisDefaults: UPlotAxis = {
      ...axesDefaults,
      space: 50, // Override min space between ticks for horizontal axis
      values: (self: uPlot, ticks: number[], space: number): string[] => {
        let intervalSize = 0;

        if (ticks.length > 1) {
          intervalSize = ticks[1] - ticks[0];
        }

        if (intervalSize >= 3600 * 24) {
          return ticks.map((tick, i) => {
            const tickDate = new Date(tick * 1e3);

            if (
              // check if every tick will be formatted for different year
              intervalSize < 3600 * 24 * 365 &&
              (i === 0 || isSameYear(tickDate, new Date(ticks[i - 1] * 1e3)))
            ) {
              return formatInTimeZone(tickDate, timeZone, 'd MMM');
            }

            return formatInTimeZone(tickDate, timeZone, 'yyyy');
          });
        } else if (intervalSize >= 60) {
          return ticks.map((tick, i) => {
            const tickDate = new Date(tick * 1e3);

            if (
              // check if every tick will be formatted for different day
              intervalSize < 3600 * 24 &&
              (i === 0 || isSameDay(tickDate, new Date(ticks[i - 1] * 1e3)))
            ) {
              return formatInTimeZone(tickDate, timeZone, 'H:mm');
            }

            return formatInTimeZone(tickDate, timeZone, 'd MMM');
          });
        }

        return ticks.map((tick) => formatInTimeZone(new Date(tick * 1e3), timeZone, 'H:mm:ss'));
      },
    };

    // Add default styles to any axes that are provided
    const finalAxes = axes
      ? axes.map((axis, axisIdx) =>
          merge(cloneDeep(axisIdx === 0 ? xAxisDefaults : axesDefaults), axis, otherAxesProps)
        )
      : [xAxisDefaults];

    // If there is only one finalAxes we need to add at least one more for Y.
    if (finalAxes.length === 1 && series.length > 1) {
      finalAxes.push(axesDefaults);
    }

    return {
      fmtDate: (tpl: string) => (localDate: Date) => {
        // Use `useAdditionalDayOfYearTokens` and `useAdditionalWeekYearTokens` to get
        // moment backward compatibility (this assumes uPlot is giving us a moment style `tpl`,
        // not actually sure  but I think date-fns at one point was giving warnings)
        // https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
        // date-fns-tz's types aren't in sync with date-fns so cast as `any`
        return formatInTimeZone(localDate, timeZone, tpl, {
          useAdditionalDayOfYearTokens: true,
          useAdditionalWeekYearTokens: true,
        } as any);
      },
      cursor: {
        drag: {
          setScale: false,
          x: false,
        },
        sync: groupId ? { key: groupId } : undefined,
      },
      ...options,
      ...this.size(),
      axes: finalAxes,
      plugins: [...plugins, this.eventsPlugin()],
      // Never using the default legend functionality
      legend: { show: false },
      ...(timeZone
        ? {
            tzDate: (timestamp: number) => {
              // Return timestamp as date in the preferred timezone
              // This helps uPlot calculate when to switch xAxisTickFormatters
              return uPlot.tzDate(new Date(timestamp * 1e3), timeZone);
            },
          }
        : undefined),
      ...otherOptions,
    };
  };

  size = () => {
    const { options, height, width, sparkline } = this.props;
    const { title } = options;

    return getChartSize(height, width, !!title, !!sparkline);
  };

  eventsPlugin = () => {
    const { renderTooltip } = this.props;

    return {
      hooks: {
        init: (u: any) => {
          const plot = u.root.querySelector('.u-over');

          if (renderTooltip) {
            // Have to set something otherwise the setCursor event won't be called
            const ttc = (u.cursortt = document.createElement('div'));
            plot.appendChild(ttc);
          }
        },
        setCursor: (u: any) => {
          if (
            renderTooltip &&
            // Don't update the cursor if the chart has been clicked to allow for hovering over the tooltip
            !this.state.isPinned
          ) {
            const { left, top, idx } = u.cursor;

            if (typeof left === 'number') {
              const xVal = u.posToVal(left, 'x');
              const yVal = u.posToVal(top, 'y');

              this.setState({ xVal: xVal, yVal: yVal, left: left, u: u, idx: idx, top: top });
            }
          }
        },
      },
    };
  };

  positionTooltip = () => {
    const { left, u } = this.state;
    if (left === undefined || !this.tooltipRef.current || !this.rootRef.current) {
      return;
    }

    const tooltipRect = this.tooltipRef.current.getBoundingClientRect();
    const overRect: ClientRect = u.root.querySelector('.u-over').getBoundingClientRect();
    const rootRect: ClientRect = this.rootRef.current.getBoundingClientRect();

    // Get the offset of the chart over area to the side of the chart which contains the axes and ticks
    // Needed to position the tooltip using the cursor position since the tooltip is a sibling not a child
    // of the chart over area
    const overLeft = overRect.left - rootRect.left;

    // When the cursor is past the halfway point we want to render the tooltip to the left of it
    const halfWay = overRect.width / 2;
    const extraOffset = 10; // Extra offset so the tooltip isn't in the way of the hovered points
    const finalLeft =
      halfWay < left ? overLeft + left - tooltipRect.width - extraOffset : overLeft + left + extraOffset;

    const tooltipStyle: React.CSSProperties = {};
    tooltipStyle.left = `${finalLeft}px`;
    tooltipStyle.maxWidth = `${halfWay}px`;

    // Compute how much of tooltip renders outside of the viewport using the top of the chart as the start y
    const clippedTooltip =
      overRect.top +
      tooltipRect.height +
      // tooltip sets top to 20px so calculate clipping from there
      20 -
      window.innerHeight;

    if (clippedTooltip > 0) {
      tooltipStyle.top = `-${clippedTooltip}px`;
    }

    this.setState({ tooltipStyle: tooltipStyle });
  };

  onDocumentMouseDown = (event: MouseEvent) => {
    if (
      this.tooltipNode && // Only pin the tooltip if there is one
      this.elemRef.current &&
      event.target instanceof HTMLElement &&
      this.elemRef.current.contains(event.target)
    ) {
      const isPinned = !this.state.isPinned;
      this.setState({
        isPinned: isPinned,
        // reset cursor values isPinned is toggling off
        xVal: !isPinned ? undefined : this.state.xVal,
        yVal: !isPinned ? undefined : this.state.yVal,
      });
    }
  };

  onDocumentMouseOver = (event: MouseEvent) => {
    if (this.rootRef.current && event.target instanceof HTMLElement) {
      // Determine if the cursor has moved out of the chart but handle the case where it moves into an axiom-tooltip which is not a descendant
      // of the chart
      if (
        !this.rootRef.current.contains(event.target) &&
        !event.target.classList.contains('axiom-tooltip') &&
        !event.target.classList.contains('axiom-tooltip-inner')
      ) {
        this.setState({ active: false, isPinned: false });
      }
    }
  };

  onChartMouseEnter = (event: MouseEvent) => {
    this.setState({ active: true });
  };

  private draw = () => {
    if (this.elemRef.current) {
      const options = this.options();
      try {
        const fixedData = this.fixData();

        this.chart = new uPlot(options, fixedData, this.elemRef.current);
      } catch (error) {
        const { localizedMessages } = this.context;

        this.chart?.destroy();
        this.setState({
          error: localizedMessages.uPlotChartError,
        });

        console.error('Error while rendering uPlot chart', error, options);

        const { onUPlotError } = this.props;

        if (onUPlotError) {
          onUPlotError(error);
        }
      }
    }
  };

  private fixData = () => {
    const { data } = this.props;

    // If data is larger than MAX_SAFE_INTEGER we need to make it smaller so UPlot doesn't blow up.
    // And we need to set a flag so when we render the axis we know to "unfix" it.
    const dataExceedsMaxInteger: boolean[] = Array(data.length).fill(false);

    const doAlign = (dataArray: number[] | (number | null | undefined)[], dataArrayIndex: number) => {
      return (dataArray || []).map((value) => {
        if (value && value > Number.MAX_SAFE_INTEGER) {
          dataExceedsMaxInteger[dataArrayIndex] = true;

          return value / MAX_INTEGER_CORRECTION;
        } else {
          return value;
        }
      });
    };

    const fixedData: uPlot.AlignedData = [doAlign(data[0], 0) as number[], ...data.slice(1).map(doAlign)];

    this.dataExceedsMaxInteger = dataExceedsMaxInteger;

    return fixedData;
  };
}

export interface LegendSeries {
  color: string;
  name: string;
}

export interface UPlotChartProps extends Omit<UPlotChartInternalProps, 'options' | 'height' | 'width'> {
  className?: string;
  height?: number | string;
  legendSeries?: LegendSeries[];
  options: UPlotOptions;
  width?: number;
  onResize?(width?: number, height?: number): void;
}

// Wrapper class so we get some resizing behavior
export class UPlotChart extends React.Component<UPlotChartProps> {
  private lastHeight = 0;

  render() {
    const {
      className,
      height: explicitHeight,
      width: explicitWidth,
      legendSeries,
      onResize,
      options,
      sparkline,
      ...rest
    } = this.props;

    let maxNameLength = 0;
    const legend = legendSeries?.map((series, idx) => {
      const { color, name } = series;
      maxNameLength = Math.max(maxNameLength, name.length);

      return (
        <div key={name} className={styles.series}>
          <span
            className={styles.marker}
            style={{
              background: color,
            }}
          />
          <span className={styles.text}>{name}</span>
        </div>
      );
    });

    const legendWidth = maxNameLength * 6.18 + 15; // legend marker square width plus max label * mono font width

    const hasTitle = !!options.title;

    return (
      <ReactResizeDetector<HTMLDivElement>
        handleWidth
        handleHeight
        refreshMode="debounce"
        refreshRate={0}
        onResize={onResize}
      >
        {({ width, height = 0, targetRef }) => {
          let optWidth = explicitWidth !== undefined ? explicitWidth : width;

          if (
            typeof optWidth === 'number' &&
            // No legend if this is a sparkline
            !sparkline
          ) {
            optWidth -= legendWidth + 20; // Minus additional padding
          }

          // const optHeight = explicitHeight !== undefined ? explicitHeight : height;

          const MIN_HEIGHT_DIFF = 3;
          const optHeight =
            height > this.lastHeight + MIN_HEIGHT_DIFF || height < this.lastHeight - MIN_HEIGHT_DIFF
              ? height
              : this.lastHeight;
          this.lastHeight = optHeight;

          // Fill up any container height which will be measured by the resize detector so we can pass the computed height to the internal chart
          let styleHeight: string = '100%';

          // An explicit height has been passed so use that
          if (typeof explicitHeight === 'number') {
            styleHeight = `${explicitHeight}px`;
          } else if (typeof explicitHeight === 'string') {
            styleHeight = explicitHeight;
          }

          return (
            <div
              className={classNames(
                styles.chart,
                { [styles.hasTitle]: hasTitle, [styles.sparkline]: sparkline },
                className
              )}
              style={{ height: styleHeight }}
              ref={targetRef}
            >
              {optHeight === undefined || optWidth === undefined ? null : (
                <UPlotChartInternal
                  height={optHeight}
                  width={optWidth}
                  options={options}
                  sparkline={sparkline}
                  {...rest}
                />
              )}
              {legend && !sparkline ? <div className={classNames(styles.legend)}>{legend}</div> : null}
            </div>
          );
        }}
      </ReactResizeDetector>
    );
  }
}
