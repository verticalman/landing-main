/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.fater.ai' }],
        destination: 'https://fater.ai/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
