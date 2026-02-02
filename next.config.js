/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Prevent native canvas packages from being bundled into client-side code
    if (!isServer) {
      config.resolve.alias['@napi-rs/canvas'] = false;
      config.resolve.alias.canvas = false;
    }

    // For server builds, mark the native canvas package as external so webpack
    // doesn't try to parse the .node binary (causes the "Unexpected character" error).
    if (isServer) {
      // Ensure externals is an array we can push to
      if (!config.externals) config.externals = [];
      // If externals is a function, wrap it to delegate to the original behavior
      if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = async (context, request, callback) => {
          if (request === '@napi-rs/canvas' || request.startsWith('@napi-rs/canvas/')) {
            return callback(null, `commonjs ${request}`);
          }
          return originalExternals(context, request, callback);
        };
      } else if (Array.isArray(config.externals)) {
        config.externals.push('@napi-rs/canvas');
      } else if (typeof config.externals === 'object') {
        config.externals['@napi-rs/canvas'] = `commonjs @napi-rs/canvas`;
      }
    }

    return config;
  },
}

module.exports = nextConfig
