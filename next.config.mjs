/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["react-window"],
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000", "hub.avel.africa"],
        },
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "style-src 'self' 'unsafe-inline'",
                            "img-src 'self' data: blob: https://rmqnwesgfbdxnarkhcos.supabase.co",
                            "font-src 'self'",
                            "connect-src 'self' https://rmqnwesgfbdxnarkhcos.supabase.co wss://rmqnwesgfbdxnarkhcos.supabase.co",
                            "frame-ancestors 'none'",
                        ].join("; "),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
