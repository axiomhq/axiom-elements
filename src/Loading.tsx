import classNames from 'classnames';
import React from 'react';

import styles from './Loading.less';

export type LoadingType = 'dots' | 'circle';

export interface LoadingProps {
  className?: string;
  type?: LoadingType;
  style?: React.CSSProperties;
}

export const Loading: React.FC<LoadingProps> = ({ className, style, type = 'dots' }) => {
  return (
    <div className={classNames(styles.loading, styles[type], className)} style={style}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};
