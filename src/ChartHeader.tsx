import classNames from 'classnames';
import React from 'react';

import { Loading } from './Loading';
import { Tailor } from './Tailor';

import styles from './ChartHeader.less';

export interface ChartHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  text?: string;
  renderMenu?(): React.ReactNode;
}

export const ChartHeader: React.SFC<ChartHeaderProps> = ({
  children,
  className,
  loading,
  renderMenu,
  text,
  ...passthrough
}) => {
  // .chart-header is the react-grid-layout `draggableHandle`.
  return (
    <div className={classNames('chart-header', styles.root, className)} {...passthrough}>
      {loading ? <Loading type="circle" className={styles.loading} /> : null}
      {text ? <Tailor>{text}</Tailor> : null}
      <div className={styles.children}>{children}</div>
      {renderMenu ? renderMenu() : null}
    </div>
  );
};
