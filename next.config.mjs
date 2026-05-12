/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable static export (for S3 hosting)
  output: "export",

  // Required for static hosting (no Next.js image server)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
