/** @type {import('next').NextConfig} */
const nextConfig = {
    // Force enable source maps in development
    productionBrowserSourceMaps: false,
    experimental: {
        serverSourceMaps: true,
    },
    
    // Ensure proper source map generation
    webpack: (config, { dev, isServer }) => {
        if (dev) {
            config.devtool = 'eval-source-map';
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
