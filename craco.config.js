
// You can also use craco-alias plugin: https://github.com/risenforces/craco-alias

const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            const wasmExtensionRegExp = /\.wasm$/;
            webpackConfig.resolve.extensions.push('.wasm');
            webpackConfig.experiments = {
                asyncWebAssembly: true,
                // lazyCompilation: true,
                // syncWebAssembly: true,
                // topLevelAwait: true,
            };
            webpackConfig.resolve.fallback = {
                buffer: require.resolve('buffer/')
            }
            webpackConfig.module.rules.forEach((rule) => {
                (rule.oneOf || []).forEach((oneOf) => {
                    if (oneOf.type === "asset/resource") {
                        oneOf.exclude.push(wasmExtensionRegExp);
                    }
                });
            });
            webpackConfig.plugins.push(new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }));

            return webpackConfig;
        }
    }
}

// const plugin = {
//   overrideWebpackConfig: ({ webpackConfig, cracoConfig, pluginOptions, context: { env, paths } }) => {
//       // if (pluginOptions.preText) {
//       //     console.log(pluginOptions.preText);
//       // }
//       const wasmExtensionRegExp = /\.wasm$/;
//       webpackConfig.resolve.extensions.push('.wasm');

//       webpackConfig.experiments = {
//         asyncWebAssembly: true,
//         lazyCompilation: true,
//         syncWebAssembly: true,
//       };

//       // console.log(JSON.stringify(context, null, 2));
//       console.log(JSON.stringify(cracoConfig, null, 2));
//       cracoConfig.experimental = {
//         craCompat: false
//       }
      
//       // Always return the config object.
//       return webpackConfig;
//   }
// }

// module.exports = {
//   plugins: [
//     { plugin }
//   ],
//   // experimental: {
// 	// 	craCompat: false, //This line was breaking it for me.
//   // },
//   // webpack: (config) => {
//   //     console.log("!hello!")
//   //     const experiments = config.experiments || {};
//   //     config.experiments = {
//   //       ...experiments,
//   //       syncWebAssembly: true,
//   //       asyncWebAssembly: true,
//   //     };
//   //     return config
//   //   }
// };