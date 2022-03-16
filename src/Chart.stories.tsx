/* eslint-disable no-console */
import { ComponentStory, ComponentMeta } from '@storybook/react';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';

import { Chart, ChartProps } from './Chart';
import { Query } from './types/Query';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'axiom-elements/Chart',
  component: Chart,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
} as ComponentMeta<typeof Chart>;

const defaultStatisticArgs: ChartProps = {
  datasetId: 'sample-http-logs',
  name: 'Count',
  type: 'Statistic',
  query: {
    startTime: '2021-11-09T21:44:58Z',
    endTime: '2021-12-09T22:14:58Z',
    resolution: 'auto',
    aggregations: [
      {
        op: 'count',
        field: '',
      },
    ],
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const StatisticTemplate: ComponentStory<typeof Chart> = (args) => (
  <div style={{ height: 300, boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.05)' }}>
    <Chart {...args} />
  </div>
);

export const Statistic = StatisticTemplate.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Statistic.args = {
  ...defaultStatisticArgs,
  showChart: false,
} as ChartProps;

export const StatisticWithChart = StatisticTemplate.bind({});
StatisticWithChart.args = {
  ...defaultStatisticArgs,
  colorScheme: 'Green',
  showChart: true,
} as ChartProps;

export const StatisticAPL = StatisticTemplate.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
StatisticAPL.args = {
  name: 'Count',
  type: 'Statistic',
  query: {
    startTime: '2021-12-02T22:05:41.000Z',
    endTime: '2021-12-02T22:35:41.000Z',
    apl: `
['sample-http-logs']
| summarize count() by bin_auto(_time)
`,
  },
  colorScheme: 'Purple',
  showChart: true,
} as ChartProps;

const defaultTimeSeriesArgs: ChartProps = {
  datasetId: 'sample-http-logs',
  name: 'Log Count',
  type: 'TimeSeries',
  query: {
    startTime: '2021-12-02T22:05:41.000Z',
    endTime: '2021-12-02T22:35:41.000Z',
    aggregations: [
      {
        op: 'count',
        field: '',
      },
    ],
    groupBy: ['geo.city'],
    limit: 20,
    resolution: 'auto',
  },
};

const TimeSeriesTemplate: ComponentStory<typeof Chart> = (args) => (
  <div style={{ height: 500, boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.05)' }}>
    <Chart
      {...args}
      onLoadingChanged={(loaded) => {
        console.log('TimeSeries loaded', loaded);
      }}
      // refreshRateSeconds={5}
    />
  </div>
);

export const TimeSeries = TimeSeriesTemplate.bind({});
TimeSeries.args = defaultTimeSeriesArgs;

const defaultTimeSeriesMultipleAggregationsArgs = cloneDeep(defaultTimeSeriesArgs);

(defaultTimeSeriesMultipleAggregationsArgs.query as Query).aggregations.push(
  {
    op: 'avg',
    field: 'req_duration_ms',
  },
  {
    op: 'avg',
    field: 'resp_body_size_bytes',
  }
);

export const TimeSeriesMultipleAggregations = TimeSeriesTemplate.bind({});
TimeSeriesMultipleAggregations.args = defaultTimeSeriesMultipleAggregationsArgs;

export const TimeSeriesTable = TimeSeriesTemplate.bind({});
TimeSeriesTable.args = {
  showResultsTable: true,
  name: 'Logs Count',
  type: 'TimeSeries',
  query: {
    startTime: '2021-12-02T22:05:41.000Z',
    endTime: '2021-12-02T22:35:41.000Z',
    apl: `
['sample-http-logs']
| summarize count() by bin_auto(_time)
`,
  },
} as ChartProps;

const MultipleTemplate: ComponentStory<typeof Chart> = (args) => (
  <div style={{ width: 600, height: 800, boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.05)' }}>
    <Chart
      {...defaultStatisticArgs}
      style={{ height: 200 }}
      onLoadingChanged={(loaded) => {
        console.log('Multi Statistic loaded', loaded);
      }}
    />
    <Chart
      {...defaultTimeSeriesArgs}
      style={{ height: 600 }}
      onLoadingChanged={(loaded) => {
        console.log('Multi TimeSeries loaded', loaded);
      }}
    />
  </div>
);

export const Multiple = MultipleTemplate.bind({});

export const AplTimeSeries = TimeSeriesTemplate.bind({});
AplTimeSeries.args = {
  name: 'Log Count',
  type: 'TimeSeries',
  query: {
    apl: `
['sample-http-logs']
| summarize count() by bin_auto(_time), ['geo.city']
| limit 20
    `,
    startTime: '2021-12-02T22:05:41.000Z',
    endTime: '2021-12-02T22:35:41.000Z',
  },
  showResultsTable: true,
} as ChartProps;

export const HeatMap = TimeSeriesTemplate.bind({});
HeatMap.args = {
  datasetId: 'sample-http-logs',
  type: 'TimeSeries',
  query: {
    startTime: '2021-12-02T22:05:41.000Z',
    endTime: '2021-12-02T22:35:41.000Z',
    aggregations: [
      {
        op: 'histogram',
        field: 'req_duration_ms',
        argument: 15,
      },
    ],
    limit: 20,
    resolution: '15s',
  },
} as ChartProps;

export const PercentilesMap = TimeSeriesTemplate.bind({});
PercentilesMap.args = {
  datasetId: 'sample-http-logs',
  type: 'TimeSeries',
  query: {
    startTime: '2021-12-02T22:05:41.000Z',
    endTime: '2021-12-02T22:35:41.000Z',
    aggregations: [
      {
        op: 'percentiles',
        field: 'req_duration_ms',
        argument: [95, 99, 99.9],
      },
    ],
    limit: 20,
    resolution: '15s',
  },
} as ChartProps;

export const TopK = TimeSeriesTemplate.bind({});
TopK.args = {
  datasetId: 'sample-http-logs',
  type: 'TimeSeries',
  query: {
    startTime: '2021-12-02T22:05:41.000Z',
    endTime: '2021-12-02T22:35:41.000Z',
    aggregations: [
      {
        op: 'topk',
        field: 'geo.city',
        argument: 10,
      },
    ],
    resolution: '15s',
  },
} as ChartProps;

export const RelativeStartDate = TimeSeriesTemplate.bind({});
RelativeStartDate.args = {
  datasetId: 'sample-http-logs',
  name: 'Count of logs in last 3 hours',
  type: 'TimeSeries',
  query: {
    startTime: 'now(-3h)',
    aggregations: [
      {
        op: 'count',
        field: '',
      },
    ],
  },
} as ChartProps;

// Internal Axiom Testing:
// export const NullValues = TimeSeriesTemplate.bind({});
// NullValues.args = {
//   // cSpell:disable-next-line
//   datasetId: 'ifttt-weather',
//   type: 'TimeSeries',
//   query: {
//     startTime: '2022-01-19T22:07:35.000Z',
//     endTime: '2022-01-27T22:07:35.000Z',
//     aggregations: [
//       {
//         field: 'pollenCount',
//         op: 'avg',
//       },
//       {
//         field: '',
//         op: 'count',
//       },
//     ],
//     filter: {
//       field: 'location',
//       op: '==',
//       value: 'Bend, OR',
//     },
//     groupBy: ['location'],
//     limit: 20,
//     resolution: '1h',
//   },
//   nullValues: 'zero',
// } as ChartProps;
