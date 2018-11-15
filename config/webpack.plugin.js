const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
/* Import webpack-manifest-plugin */
const ManifestPlugin = require('webpack-manifest-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

exports.loaderOptions = new webpack.LoaderOptionsPlugin({
  options: {
    context: __dirname,
  },
});

exports.environmentVariables = new webpack.DefinePlugin({
  'process.env': {
    'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
});

exports.uglifyJs = new webpack.optimize.UglifyJsPlugin({
  output: {
    comments: false,
  },
  compress: {
    warnings: false,
    drop_console: true,
  },
});

exports.extractText = (() => {
  const config = {
    filename:  'style.css',
  };
  return new ExtractTextPlugin(config);
})();

/* The basic is very easy, just define the file name and 
 * it's gonna be created in the public folder along with the assets 
 */
exports.manifest = new ManifestPlugin({
  fileName: 'asset-manifest.json', // Not to confuse with manifest.json 
});