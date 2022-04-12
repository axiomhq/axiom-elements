import Tippy, { TippyProps } from '@tippyjs/react';
import classNames from 'classnames';
import React from 'react';

import styles from './Tooltip.less';

export interface TooltipProps extends Omit<TippyProps, 'children'> {
  rootClassName?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, rootClassName, ...passthrough }) => {
  return (
    <Tippy {...passthrough}>
      <span className={classNames(styles.root, rootClassName)}>{children}</span>
    </Tippy>
  );
};
