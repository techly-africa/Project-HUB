/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["react-window"],
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000"],
        },
    },
};

export default nextConfig;
