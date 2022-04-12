import Tippy from '@tippyjs/react';
import classNames from 'classnames';
import React from 'react';
import { hideAll } from 'tippy.js';

import { ChartTooltip } from './ChartTooltip';
import { ColorTableRow } from './ColorTableRow';
import { ColorScale } from './stores/DatasetStore';
import { TooltipTable } from './TooltipTable';
import { formatNumber } from './util/numbers';
import { ValueFormatter } from './util/units/valueFormats';

import styles from './Spectrograph.less';

export interface SpectrographProps {
  className?: string;
  colorScales: ColorScale[];
  defaultColor: string;
  values: { count: number; from: number; to: number }[];
  valueFormatter?: ValueFormatter;
}

export class Spectrograph extends React.Component<SpectrographProps> {
  render() {
    const { className, colorScales, defaultColor, values, valueFormatter } = this.props;

    const valuesWithColor = values.map((bucket) => ({
      ...bucket,
      color:
        colorScales.find((scale, index) => {
          const { count } = bucket;
          const { from, to } = scale;

          return count === from || (count > from && count < to) || (index === colorScales.length - 1 && count === to);
        })?.color || defaultColor,
    }));

    const rows: JSX.Element[] = [];

    // Iterate backwards for the tooltip rows so the largest 'to' value is on top
    for (let i = valuesWithColor.length - 1; i >= 0; i -= 1) {
      const { to, count, color } = valuesWithColor[i];
      const name = formatNumber(to, valueFormatter);

      rows.push(<ColorTableRow key={`${i}-${count}`} name={`< ${name}`} values={[count]} color={color} />);
    }

    return (
      <Tippy
        interactive={true}
        placement="right"
        theme="white"
        trigger="mouseenter focus click"
        content={
          <ChartTooltip>
            <TooltipTable>
              <tbody>{rows}</tbody>
            </TooltipTable>
          </ChartTooltip>
        }
        onShow={(instance) => {
          // Since we added `click` to the `trigger`, we need to
          // hide all open Tippy's when a new one is shown.
          hideAll({
            exclude: instance,
          });
        }}
      >
        <div className={classNames(styles.spectrograph, className)}>
          {valuesWithColor.map((bucket: any, bucketIdx: number) => (
            <div
              className={styles.bar}
              key={`${bucket.count}-${bucketIdx}`}
              style={{
                backgroundColor: bucket.color,
              }}
            ></div>
          ))}
        </div>
      </Tippy>
    );
  }
}
