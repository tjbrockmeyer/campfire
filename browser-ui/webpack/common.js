const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const srcPath = path.resolve("src");
const distPath = path.resolve("dist");
const elmPath = path.resolve("../elm-ui");

module.exports = {
    entry: {
        app: "./src/index.ts",
    },
    output: {
        filename: "[name].js",
        path: distPath
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".elm"]
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.elm$/,
                exclude: [/elm-stuff/, /node_modules/],
                use: [
                    { loader: 'elm-hot-webpack-loader' },
                    {
                        loader: "elm-webpack-loader",
                        options: {
                            cwd: elmPath,
                        }
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    "file-loader"
                ]
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.join(srcPath, "index.html"),
                    to: path.join(distPath, "index.html")
                },
                // {
                //     from: path.join(elmPath, "static"),
                //     to: distPath
                // },
            ],
        }),
    ],
};