module.exports = {
    module: {
        rules: [
            {
                test: /\.(css|scss|sass)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    // Add PostCSS plugins here
                                    require('autoprefixer'),
                                    require('cssnano')
                                ],
                            },
                        },
                    },
                ],
            },
        ],
    },
};