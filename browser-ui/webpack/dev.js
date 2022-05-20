const path = require("path");
const { merge } = require("webpack-merge");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const commonConfig = require("./common.js");

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: "eval-source-map",
    plugins: [
        new BrowserSyncPlugin(
            {
                https: true,
                host: "localhost",
                port: 3001,
                proxy: "https://localhost:3100/"
            },
            {
                reload: false
            }
        )
    ],

    devServer: {
        static: {
            publicPath: "/",
            directory: path.resolve("dist"),
        },
        server: 'https',
        compress: true,
        client: {
            overlay: {
                warnings: false,
                errors: true
            },
        },
        port: 3100,
        historyApiFallback: true
    }
});