export default {
	"*.{ts,tsx,js,jsx,css,md,html}": ["cspell lint"],
	"*.{ts,tsx,js,jsx}": ["biome check --write --no-errors-on-unmatched"],
};
