require('dotenv').config();

const webpackConfigCommon = require('./webpack.config.common');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: '@storybook/react',
  core: {
    builder: 'webpack5',
  },
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    //ability to turn off HMR with an env variable.
    if (process.env.DISABLE_HMR === 'true') {
      console.log('⚠️  DISABLING HMR');
      config.entry = config.entry.filter((singleEntry) => !singleEntry.includes('/webpack-hot-middleware/'));
    }

    // Remove default .css rule.
    config.module.rules = config.module.rules.filter((rule) => String(rule.test) !== String(/\.css$/));

    // Insert our rules at a specific position to match what we're doing in the regular webpack.config.ts
    config.module.rules.splice(1, 0, ...webpackConfigCommon.rules);

    // Return the altered config
    return config;
  },
};
