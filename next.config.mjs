/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

// next.config.js
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "lh3.googleusercontent.com",
//         pathname: "/",
//       },
//     ],
//   },

//   webpack: (config, { isServer }) => {
//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         fs: false,
//       };
//     }
//     return config;
//   },
// };

// module.exports = nextConfig;
