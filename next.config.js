/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  // Gold accent and backdrop close. Rebuild after the failed production deploy.
};

module.exports = nextConfig;
