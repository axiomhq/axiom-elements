import React, { useContext } from 'react';

import { LocalizedMessages } from './types/LocalizedMessages';

export const DEFAULT_API_DOMAIN = 'play.axiom.co';

export const DEFAULT_LOCALIZED_MESSAGES: LocalizedMessages = {
  against: 'Against',
  copy: 'Copy',
  count: 'Count',
  emptyParen: '(empty)',
  noData: 'No data',
  uPlotChartError: 'Failed to render chart.',
};

export interface AxiomCtx {
  apiDomain: string;
  apiKey: string;
  localizedMessages: LocalizedMessages;
  orgId?: string;
  timeZone: string;
}

// Only apiKey is required.
export type AxiomProviderProps = Partial<AxiomCtx>;

const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export const AxiomContext = React.createContext<AxiomCtx>({
  apiDomain: DEFAULT_API_DOMAIN,
  apiKey: '',
  localizedMessages: DEFAULT_LOCALIZED_MESSAGES,
  timeZone: defaultTimezone,
});

export const AxiomProvider: React.FC<AxiomProviderProps> = ({
  apiDomain,
  apiKey,
  localizedMessages,
  orgId,
  timeZone,
  children,
}) => {
  const context: AxiomCtx = {
    apiDomain: apiDomain ?? DEFAULT_API_DOMAIN,
    apiKey: apiKey ?? '',
    localizedMessages: localizedMessages ?? DEFAULT_LOCALIZED_MESSAGES,
    orgId: orgId,
    timeZone: timeZone ?? defaultTimezone,
  };

  return <AxiomContext.Provider value={context}>{children}</AxiomContext.Provider>;
};

export const useAxiomContext = (): AxiomCtx => {
  return useContext(AxiomContext);
};
