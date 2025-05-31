/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    serverActions: {},
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
