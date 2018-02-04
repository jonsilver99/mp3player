const paths = require('path');
const webpack = require('webpack');
const UglifyJsPlugin  = require('uglifyjs-webpack-plugin')
const $ = require('jquery')


module.exports = {

    entry: './public/js/script.js',
    
    output: {
        path: paths.resolve(__dirname, 'public/js'),
        filename: 'bundle.js'

    },

    plugins: [

        new webpack.ProvidePlugin({
            $: 'jquery',
            jquery: 'jquery',
            Emitter: paths.resolve(__dirname, 'public/js/eventEmitter.js')
        })
        // new UglifyJsPlugin(),
    ]
};