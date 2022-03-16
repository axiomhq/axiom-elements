import classNames from 'classnames';
import React from 'react';

import styles from './QueryValues.less';

export interface QueryValuesProps {
  className?: string;
  values: React.ReactNode[];
}

export const QueryValues: React.FC<QueryValuesProps> = ({ values, className }: QueryValuesProps) => {
  const renderedValues = values.map((v, idx) => {
    const value: any = !v || v === null ? '-' : v;

    return <div key={`${idx}-${value}`}>{value}</div>;
  });

  return <div className={classNames(styles.values, className)}>{renderedValues}</div>;
};
