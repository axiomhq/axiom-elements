# axiom-elements

Axiom Elements is a set of React components that can displaying charts for your Axiom Datasets.

https://www.axiom.co/


## Using in your project

### Install

```shell
npm install @axiomhq/axiom-elements
```


### Generate an API Key

Visit your Axiom instance and go to `Settings -> API Tokens`

Add an API Token that has the "Query" permission for the Dataset you want to make charts for.


### Configure `AxiomProvider`

##### MyLayout.tsx

```tsx
import { AxiomProvider } from '@axiomhq/axiom-elements';
import React from 'react';

function App({ children }) {
  return (
    <div className="App">
      <header className="App-header">


        <AxiomProvider apiKey="YOUR-API-KEY" apiDomain="cloud.axiom.co">
          {children}
        </AxiomProvider>

      </header>
    </div>
  );
}

export default App;
```


### Adding Charts

##### MyCharts.tsx

```tsx
import { Chart } from '@axiomhq/axiom-elements';
import React from 'react';

function MyCharts({ children }) {
  return (
    <div className="Charts">

      <Chart
        style={{ height: '90vh' }}
        datasetId="hackernews"
        name="Bitcoin Mentions"
        type="TimeSeries"
        query={
          {
            "aggregations": [
              {
                "argument": null,
                "field": "*",
                "op": "count"
              }
            ],
            "startTime": "datetime(2007-01-01T00:00:00.000Z)",
            "endTime": "now()",
            "groupBy": [
              "has_bitcoin"
            ],
            "virtualFields": [
              {
                "alias": "has_bitcoin",
                "expr": "text contains \"bitcoin\" or title contains \"bitcoin\" or text contains_cs \" BTC \" or title contains_cs \" BTC \""
              }
            ],
          }
        }
      />

    </div>
  );
}

export default MyCharts;
```
