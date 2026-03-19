import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	distDir: ".next",
	productionBrowserSourceMaps: true,
	serverExternalPackages: ["shiki", "@shikijs/core", "rehype-pretty-code"],
	images: {
		qualities: [50, 75, 100],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				port: "",
				pathname: "/u/**",
			},
			{
				protocol: "https",
				hostname: "raw.githubusercontent.com",
				port: "",
				pathname: "/tillicofess/Article-images/main/**",
			},
		],
	},
};

// Enable bundle analyzer when ANALYZE=true env var is set
export default withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
	openAnalyzer: false, // Set to true to auto-open browser
})(nextConfig);
