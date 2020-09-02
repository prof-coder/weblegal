/**
 * The module dependencies.
 */
const del = require('del');
const path = require('path');
const gulp = require('gulp');
const utils = require('./utils');
const gulpif = require('gulp-if');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const bundler = require('webpack');
const sftp = require('gulp-sftp');

/**
 * Setup the env.
 */
const { isProd, isDev, isBuild } = utils.detectEnv();

/**
 * Show notification on error.
 */
const error = function(e) {
	notify.onError({
		title: 'Gulp',
		message: e.message,
		sound: 'Beep'
	})(e);

	this.emit('end');
};

const postcssTask = () => {
	const plugins = [];
	const pathToRemove = '../../../shopify/assets/';
	const pathToAdd = './';

	plugins.push(
		require('postcss-url')({
			url: (asset, dir) => {
				if (asset.absolutePath === utils.buildStylesPath('../temp/bundle.css')) {
					return;
				}

				return utils.copyAsset(asset, dir, utils.shopifyAssetsPath, url => {
					return url
						.replace(pathToRemove, pathToAdd)
						.replace(/[\.\/]+(.+?)(\??#.+)?$/g, "{{ '$1' | asset_url }}$2");
				});
			}
		})
	);

	return { plugins };
};

const watch = () => {
	gulp.watch([utils.srcStylesPath('**/*.scss')], styleTask);
};

const styleTask = () => {
	const config = require('./postcss');
	const src = utils.srcStylesPath('main.scss');
	const build = utils.buildStylesPath('../temp');
	const dest = utils.destCssPath();

	return (
		gulp
			.src(src)
			.pipe(gulpif(isDev || isBuild, sourcemaps.init()))
			.pipe(
				sass({
					includePaths: [
						'.',
						utils.srcVendorPath(),
						path.resolve(__dirname, '../node_modules')
					]
				}).on('error', error)
			)
			//.pipe(rename('bundle-temp.css'))
			.pipe(plumber({ errorHandler: error }))
			.pipe(postcss(config))
			.pipe(rename('bundle.css'))
			.pipe(gulp.dest(build))
			.pipe(postcss(postcssTask))
			.pipe(
				gulpif(
					isDev || isBuild,
					sourcemaps.write(dest, {
						includeContent: false,
						sourceMappingURL: file => '{{ "bundle.css.map" | asset_url }}'
					})
				)
			)
			.pipe(gulp.dest(build))
			.pipe(rename('bundle.css'))
			.pipe(gulp.dest(dest))
	);
};

/**
 * Process JS files through Webpack.
 */
const scripts = () => {
	const src = utils.srcScriptsPath('app.js');
	const dest = utils.buildScriptsPath();
	const config = require('./webpack');

	return gulp
		.src(src)
		.pipe(plumber({ errorHandler: error }))
		.pipe(webpack(config, bundler))
		.pipe(gulp.dest(dest));
};
/**
 * Remove the build.
 */
const clean = () => {
	return del([utils.buildPath()], { force: true });
};

/**
 * Register the tasks.
 */
let devProcesses = gulp.series(
	clean,
	gulp.parallel(scripts, styleTask, watch)
);

gulp.task('dev', devProcesses);
gulp.task('default', gulp.series('dev'));