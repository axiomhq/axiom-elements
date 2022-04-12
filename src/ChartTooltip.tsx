import React from 'react';

import styles from './ChartTooltip.less';

export interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children?: React.ReactNode;
}

export class ChartTooltip extends React.Component<ChartTooltipProps> {
  render() {
    const { title, children, ...passthrough } = this.props;

    return (
      <div className={styles.tooltip} {...passthrough}>
        {title ? <div className={styles.title}>{title}</div> : null}
        <div className={styles.rows}>{children}</div>
      </div>
    );
  }
}
