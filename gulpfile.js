'use strict'

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
cleanCSS = require('gulp-clean-css');

gulp.task('concatScripts', function() {
	return gulp.src([
		'js/plugins.js',
		'js/textfill.js',
		'js/main.js'
	])
	.pipe(maps.init())
	.pipe(concat("app.js"))
	.pipe(maps.write('./'))
	.pipe(gulp.dest('js'));
});

gulp.task("minifyScripts", ['concatScripts'], function() {
	return gulp.src("js/app.js")
	.pipe(uglify())
	.pipe(rename('app.min.js'))
	.pipe(gulp.dest('js'));
});

gulp.task('compileSass', function() {
	return gulp.src('sass/main.scss')
	.pipe(maps.init())
	.pipe(sass())
	.pipe(maps.write('./'))
	.pipe(gulp.dest('css'))
});

gulp.task('minifyCss', ['compileSass'], function() {
	return gulp.src('css/main.css')
	.pipe(cleanCSS())
	.pipe(rename('main.min.css'))
	.pipe(gulp.dest('./css'));
});

gulp.task('build', ['minifyScripts', 'minifyCss'], function() {
	gulp.src([
		'index.html',
		'404.html',
		'humans.txt',
		'robots.txt',
		])
	.pipe(gulp.dest('build'));

	gulp.src([
		'./fonts/*'
	])
	.pipe(gulp.dest('build/fonts'));

	gulp.src([
		'./images/*'
	])
	.pipe(gulp.dest('build/images'));

	gulp.src([
		'./css/*.min.css',
		'./css/*.css.map'
	])
	.pipe(gulp.dest('build/css'));

	gulp.src([
		'./js/*.min.js',
		'./js/*.js.map'
	])
	.pipe(gulp.dest('build/js'));

	gulp.src([
		'./js/vendor/*.min.js'
	])
	.pipe(gulp.dest('build/js/vendor'));
});








