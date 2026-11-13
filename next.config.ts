import type { NextConfig } from "next";
import { pickSecurityHeaders } from "./lib/pick/headers";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // Help me pick vote page: the share token is in the path (Guard P3, #3). No referrer, no caching, no
        // indexing, no framing, plus a CSP. Host request logs also see the path: keep their retention short.
        source: '/pick/:token*',
        headers: pickSecurityHeaders(process.env, process.env.NODE_ENV !== 'production'),
      },
      {
        // Serve apple-app-site-association without .json extension and proper content-type
        source: '/.well-known/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        // Also support the .json extension for compatibility
        source: '/.well-known/apple-app-site-association.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
