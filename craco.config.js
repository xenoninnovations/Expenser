module.exports = {
    webpack: {
        configure: {
            module: {
                rules: [
                    {
                        test: /pdf\.worker\.(min\.)?js/,
                        type: 'asset/resource',
                        generator: {
                            filename: 'static/worker/[hash][ext][query]',
                        },
                    },
                ],
            },
            resolve: {
                fallback: {
                    fs: false,
                    path: false,
                    stream: require.resolve('stream-browserify'),
                },
            },
        },
    },
}; 