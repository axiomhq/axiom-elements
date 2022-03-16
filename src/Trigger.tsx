import RcTrigger, { TriggerProps } from 'rc-trigger';
import React from 'react';

export const Trigger: React.SFC<Omit<TriggerProps, 'prefixCls'>> = (props) => (
  <RcTrigger {...props} prefixCls="axiom-trigger" />
);
