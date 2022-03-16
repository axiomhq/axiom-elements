export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

import React from 'react';

import { AxiomProvider } from '../src/AxiomContext';

export const decorators = [
  (Story) => (
    <React.StrictMode>
      <AxiomProvider
        apiDomain={process.env.API_DOMAIN}
        apiKey={process.env.API_KEY}
        // Default to public axiom-play-qf1k org if no API_KEY was set and this is play.axiom.co.
        // Need to do this because the server can't default the OrgId from the API_KEY.
        orgId={
          process.env.ORG_ID ??
          (!process.env.API_KEY && process.env.API_DOMAIN === 'play.axiom.co' ? 'axiom-play-qf1k' : undefined)
        }
      >
        {Story()}
      </AxiomProvider>
    </React.StrictMode>
  ),
];
