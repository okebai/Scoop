/// <binding BeforeBuild='beforeBuild' ProjectOpened='projectOpened' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp'),
    less = require('gulp-less'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    ts = require('gulp-typescript'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    usemin = require('gulp-usemin'),
    minifyHtml = require('gulp-minify-html'),
    clean = require('gulp-clean'),
    merge = require('merge-stream');

var bowerRoot = 'bower_components/';
var projectRoot = 'Scoop.Web/';
var srcRoot = projectRoot + 'src/';
var buildRoot = projectRoot + 'build/';
var distRoot = projectRoot + 'dist/';

gulp.task('cleanDist', function () {
    return gulp.src(distRoot)
        .pipe(clean({ read: false }));
});

gulp.task('cleanBuild', function () {
    return gulp.src(buildRoot)
        .pipe(clean({ read: false }));
});

gulp.task('copyHtmlToBuild', function() {
    return gulp.src(srcRoot + '*.html')
        .pipe(gulp.dest(buildRoot));
});

function copyAssets(targetFolder) {
    var copyRoot = gulp.src(srcRoot + '*.*')
    .pipe(gulp.dest(targetFolder));

    var copyIcons = gulp.src(srcRoot + 'icons/*.*')
    .pipe(gulp.dest(targetFolder + 'icons'));

    var copyFonts = gulp.src([
        bowerRoot + 'fontawesome/fonts/*.*',
        bowerRoot + 'bootstrap/fonts/*.*',
        bowerRoot + 'bootstrap-material-design/fonts/*.*',
    ])
    .pipe(gulp.dest(targetFolder + 'fonts'));

    var copyImg = gulp.src([
        bowerRoot + 'admin-lte/dist/img/*.*'
    ])
    .pipe(gulp.dest(targetFolder + 'img'));

    var copyVendorJs = gulp.src([
        srcRoot + 'vendor/**/*.js'
    ])
    .pipe(gulp.dest(targetFolder + 'js/vendor'));

    return merge(copyRoot, copyIcons, copyFonts, copyImg, copyVendorJs);
}

gulp.task('copyAssetsToBuild', function () {
    return copyAssets(buildRoot);
});

gulp.task('copyAssetsToDist', function () {
    return copyAssets(distRoot);
});

gulp.task('copyBowerToBuild', function () {
    var js = gulp.src([
        bowerRoot + '/*/dist/**/*.js',
        bowerRoot + '/*/dist/**/*.map',
        bowerRoot + '/*/*.js',
        bowerRoot + '/*/*.map',
        bowerRoot + '/js-cookie/src/*.*',
        '!' + bowerRoot + '/**/Gruntfile.js',
        '!' + bowerRoot + '/**/package.js',
        '!' + bowerRoot + '/**/npm.js'
    ])
    .pipe(gulp.dest(buildRoot + 'js'));

    var css = gulp.src([
        bowerRoot + '/*/dist/**/*.css',
        bowerRoot + '/*/dist/**/*.map',
        bowerRoot + '/fontawesome/css/*.*'
    ])
    .pipe(gulp.dest(buildRoot + 'css'));

    return merge(js, css);
});

gulp.task('dist', ['build', 'copyAssetsToDist'], function () {
    return gulp.src(buildRoot + '/*.html')
      .pipe(usemin({
          //css: [rev()],
          html: [minifyHtml({ empty: true })],
          js: [uglify()],
          //inlinejs: [uglify()],
          //inlinecss: [minifyCss(), 'concat']
      }))
      .pipe(gulp.dest(distRoot));
});

gulp.task('build', ['copyAssetsToBuild', 'copyBowerToBuild', 'compileLess', 'compileTypeScript']);

gulp.task('compileLess', function () {
    return gulp.src(srcRoot + 'less/*.less')
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(less())
    .pipe(gulp.dest(buildRoot + 'css'));
});

gulp.task('compileTypeScript', function () {
    return gulp.src([srcRoot + 'typescript/*.ts', 'vendor/typings/**/*.d.ts'])
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(ts({
            target: 'ES5',
        }))
        .pipe(gulp.dest(buildRoot + 'js'));
});

gulp.task('projectOpened', ['cleanDist', 'cleanBuild'], function () {
    gulp.watch(srcRoot + 'less/*.less', ['compileLess']);
    gulp.watch(srcRoot + 'typescript/*.ts', ['compileTypeScript']);
    gulp.watch(srcRoot + '*.html', ['copyHtmlToBuild']);
});

gulp.task('beforeBuild', ['build']);

function handleError(err) {
    console.log(err);
    this.emit('end');
}