const autoprefixer = require('autoprefixer');

const path = require('path');

function resolveApp(relativePath) {
  return path.resolve(relativePath);
}

const paths = {
  appSrc: resolveApp('src'),
  vendorLessSrc: resolveApp('src/styles'),
  appNodeModules: resolveApp('node_modules'),
};

const postCSSLoaderOptions = {
  postcssOptions: {
    plugins: () => [autoprefixer],
  },
};

const lessLoaderOptions = {
  math: 'always',
  // Can't seem to get url() in .less files to work so turning off.
  // All images referenced in url() will also need to be imported in the .tsx file.
  // See GridLayout's move.svg
  // https://github.com/webpack-contrib/less-loader/issues/109
  rewriteUrls: 'off',
};

module.exports = {
  rules: [
    {
      test: /\.css$/,
      include: [paths.appSrc, paths.appNodeModules],
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
        },
        {
          loader: 'postcss-loader',
          options: postCSSLoaderOptions,
        },
      ],
    },
    {
      test: /\.less$/,
      include: [paths.appSrc, paths.appNodeModules],
      exclude: [paths.vendorLessSrc],
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            // See comment in `lessLoaderOptions` for `rewriteUrls: 'off'`
            url: false,
            modules: {
              // Scope all our CSS to be prefixed with `axiom-`
              localIdentName: 'axiom-[name]-[local]',
              exportLocalsConvention: 'camelCase',
            },
          },
        },
        {
          loader: 'postcss-loader',
          options: postCSSLoaderOptions,
        },
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              ...lessLoaderOptions,
              paths: [paths.appSrc, paths.appNodeModules],
            },
          },
        },
      ],
    },
    {
      test: /\.less$/,
      include: [paths.vendorLessSrc, paths.appNodeModules],
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            // In theory I think it should be `modules: false`, but
            // that is outputting stuff from axiom-base.less like:
            // .ant-btn-primary:global(.active) {
            // 'global' is supposed to "return old behavior"
            // https://github.com/webpack-contrib/css-loader/blob/0c8a23b48521656d8f2ea4c14108b44882ecb0f2/CHANGELOG.md#200-2018-12-07
            modules: {
              mode: 'global',
            },
          },
        },
        {
          loader: 'postcss-loader',
          options: postCSSLoaderOptions,
        },
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              ...lessLoaderOptions,
              paths: [paths.appSrc, paths.appNodeModules],
            },
          },
        },
      ],
    },
  ],
};
