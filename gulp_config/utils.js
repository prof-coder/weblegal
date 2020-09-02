const path = require('path');

// Base `src` path
module.exports.srcPath = (basePath = '', destPath = '') =>
	path.resolve(__dirname, '../markup', basePath, destPath);

// Base path
module.exports.basePath = (basePath = '', destPath = '') =>
	path.resolve(__dirname, '../', basePath, destPath);

// Base `build` path
module.exports.buildPath = (basePath = '', destPath = '') =>
	path.resolve(__dirname, '../build', basePath, destPath);

// Base `src` path for scripts
module.exports.srcScriptsPath = destPath => exports.basePath('assets/src/js', destPath);

// Base `build` path for scripts
module.exports.buildScriptsPath = destPath => exports.buildPath('../assets/js', destPath);

// Detect invironment type
module.exports.detectEnv = () => {
	const env = process.env.NODE_ENV || 'development';
	const isDev = env === 'development';
	const isProd = env === 'production';
	const isBuild = env === 'build';

	return {
		env,
		isDev,
		isProd,
		isBuild
	};
};

module.exports.srcVendorPath = destPath => exports.basePath('assets/src/vendor', destPath);

module.exports.destCssPath = destPath => exports.basePath('assets/css', destPath);
module.exports.srcStylesPath = destPath => exports.basePath('assets/src/css', destPath);
module.exports.buildStylesPath = destPath => exports.buildPath('assets/css', destPath);
module.exports.srcImagesPath = destPath => exports.basePath('assets/src/images', destPath);