const { merge } = require("webpack-merge");
const commonConfig = require("./common.js");

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: "source-map",
    performance: {
        hints: "warning"
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin()
    ]
});