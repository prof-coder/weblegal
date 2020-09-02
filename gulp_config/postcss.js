/**
 * The module dependencies.
 */
const fs = require('fs-extra');
const path = require('path');
const slash = require('slash');
const utils = require('./utils');
const postcss = require('postcss');
const settings = require('./settings');

/**
 * Custom PostCSS resolve function
 * kindly borrwowed from `postcss-easy-import`
 *
 * @param  {String} id    File name
 *
 * @return {Function}
 */
function resolveCustom(id) {
	const isGlob = require('is-glob');
	const resolveGlob = require('postcss-easy-import/lib/resolve-glob');
	const resolveModule = require('postcss-easy-import/lib/resolve-module');
	const resolver = isGlob(id) ? resolveGlob : resolveModule;

	return resolver.apply(null, arguments);
}

/**
 * Export the configuration.
 */
module.exports = () => {
	const env = utils.detectEnv();
	const plugins = [];

	// Handle `@import` syntax.
	plugins.push(
		require('postcss-import')({
			extensions: '.css',
			prefix: false,
			plugins: [
				require('postcss-lazy-rules')({
					images: utils.srcImagesPath('sprite/*.png'),
					stylesheet: utils.srcStylesPath('_sprite.css')
				})
			],
			resolve(id, basedir, importOptions) {
				if (id.indexOf('~') === 0) {
					return path.resolve(
						__dirname,
						'../node_modules/',
						id.replace('~', '')
					);
				} else if (id.indexOf('../vendor') === 0) {
					return utils.srcVendorPath(id);
				} else {
					return resolveCustom(
						utils.srcStylesPath(id),
						basedir,
						importOptions
					);
				}
			}
		})
	);

	// Generate the spritesheets.
	if (!env.isDev) {
		plugins.push(
			require('postcss-sprites')({
				stylesheetPath: utils.srcStylesPath(),
				spritePath: utils.srcImagesPath(),
				retina: true,
				filterBy(image) {
					if (/sprite\//gi.test(image.url)) {
						return Promise.resolve();
					}

					return Promise.reject();
				},
				hooks: {
					onUpdateRule(rule, token, image) {
						let backgroundSizeX =
							image.spriteWidth / image.coords.width * 100;
						let backgroundSizeY =
							image.spriteHeight / image.coords.height * 100;
						let backgroundPositionX =
							image.coords.x /
							(image.spriteWidth - image.coords.width) *
							100;
						let backgroundPositionY =
							image.coords.y /
							(image.spriteHeight - image.coords.height) *
							100;

						backgroundSizeX = isNaN(backgroundSizeX)
							? 0
							: backgroundSizeX;
						backgroundSizeY = isNaN(backgroundSizeY)
							? 0
							: backgroundSizeY;
						backgroundPositionX = isNaN(backgroundPositionX)
							? 0
							: backgroundPositionX;
						backgroundPositionY = isNaN(backgroundPositionY)
							? 0
							: backgroundPositionY;

						let backgroundImage = postcss.decl({
							prop: 'background-image',
							value: `url(${image.spriteUrl})`
						});

						let backgroundSize = postcss.decl({
							prop: 'background-size',
							value: `${backgroundSizeX}% ${backgroundSizeY}%`
						});

						let backgroundPosition = postcss.decl({
							prop: 'background-position',
							value: `${backgroundPositionX}% ${
								backgroundPositionY
							}%`
						});

						backgroundImage.source = rule.source;
						backgroundSize.source = rule.source;
						backgroundPosition.source = rule.source;

						rule.insertAfter(token, backgroundImage);
						rule.insertAfter(backgroundImage, backgroundPosition);
						rule.insertAfter(backgroundPosition, backgroundSize);
					}
				},
				spritesmith: {
					padding: settings.spritePadding
				}
			})
		);
	}

	// Copy fonts & images.
	plugins.push(
		require('postcss-url')([
			{
				filter: /\.(woff2?)|(otf)|(eot)|(ttf)$/,
				url: (asset, dir) =>
					utils.copyAsset(asset, dir, utils.buildFontsPath)
			},

			{
				filter: /\.(jpe?g|png|gif|svg)$/,
				url: (asset, dir) =>
					utils.copyAsset(asset, dir, utils.buildImagesPath)
			}
		])
	);

	// Add helpers like `clearfix`.
	plugins.push(require('postcss-utilities'));

	// Fix flexbox for IE
	plugins.push(require('postcss-flexbugs-fixes'));

	// Add vendor prefixes.
	plugins.push(
		require('autoprefixer')({
			browsers: settings.supportedBrowsers
		})
	);

	// Minify the output.
	if (env.isProd) {
		plugins.push(
			require('cssnano')({
				discardComments: {
					removeAll: true
				}
			})
		);
	}

	return { plugins };
};
