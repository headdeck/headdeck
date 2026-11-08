import type {NextConfig} from "next";
import {version} from "./package.json";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    env: {
        NEXT_PUBLIC_APP_VERSION: version,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {key: 'X-Content-Type-Options', value: 'nosniff'},
                    {key: 'X-Frame-Options', value: 'DENY'},
                    {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
                ],
            }
        ];
    },
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
    output: "standalone",
};

export default nextConfig;
