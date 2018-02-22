/* Currently just using to bundle so can interact with deeplearn.js, hope to include angular eventuall */
module.exports = {
    entry: ['babel-polyfill','./public/application.js'],//'babel-polyfill',
    output: {
      filename: './public/javascripts/bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env']//es2015
            }
          }
        }
      ]
    }/*
    ,
    plugins:[
        "syntax-async-functions",
        "transform-regenerator"       
    ]*/
  };