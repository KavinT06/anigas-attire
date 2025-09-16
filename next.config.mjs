/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    productionBrowserSourceMaps: true, // ✅ allows debugging minified client bundles
    webpack(config, { dev, isServer }) {
        if (dev && !isServer) {
            config.devtool = 'source-map'; // ✅ proper client-side source maps
        }
        return config;
    },
    
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5025',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '5025',
                pathname: '/**',
            },
        ],
        // Alternative: disable image optimization for external images
        unoptimized: true,
    },
};

export default nextConfig;
