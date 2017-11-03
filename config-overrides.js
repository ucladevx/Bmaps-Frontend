var path = require('path');

module.exports = (config, env) => {
  config.module.rules.push(
    {
      test: /\.module\.css$/,
      use: [
        'style-loader',
        {
          loader: require.resolve('css-loader'),
          options: {
            modules: true,
            importLoaders: 1,
            localIdentName: '[local]___[hash:base64:5]'
          }
        }
      ],
      include: path.resolve('src')
    }
  )
  return config
}
