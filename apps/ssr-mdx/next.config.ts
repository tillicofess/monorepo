import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  distDir: '.next',
};

// Enable bundle analyzer when ANALYZE=true env var is set
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false, // Set to true to auto-open browser
})(nextConfig);
