/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  // let phones on the local Wi-Fi load the dev server's scripts (Next 16 blocks other origins by default)
  allowedDevOrigins: ["192.168.1.31", "192.168.1.*", "*.local"],
  images: { qualities: [75, 90] },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
