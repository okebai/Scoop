/// <binding AfterBuild='concatLibScript, concatLibCss, copyFonts, copyImages' ProjectOpened='onProjectOpened, compileLess, compileTypeScript, copyFonts, concatLibScript, concatLibCss, copyImages' />
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
    plumber = require('gulp-plumber');

gulp.task('concatLibScript', function () {
    return gulp.src([
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/bootstrap/dist/js/bootstrap.min.js',
            'bower_components/bootstrap-material-design/dist/js/material.min.js',
            //'bower_components/bootstrap-material-design/dist/js/ripples.min.js',
            'bower_components/signalr/jquery.signalR.min.js',
            'bower_components/moment/min/moment.min.js',
            'bower_components/knockout/dist/knockout.js',
            'Scripts/knockout.viewmodel.2.0.3.min.js',
            'bower_components/select2/dist/js/select2.min.js',
            'bower_components/chartist/dist/chartist.min.js',
            'bower_components/js-cookie/src/js.cookie.js'
    ])
        .pipe(concat('lib.min.js'))
        .pipe(gulp.dest('Scripts'));
});

gulp.task('concatLibCss', function () {
    return gulp.src([
            'bower_components/fontawesome/css/font-awesome.min.css',
            'bower_components/bootstrap/dist/css/bootstrap.min.css',
            'bower_components/bootstrap-material-design/dist/css/material-fullpalette.min.css',
            'bower_components/chartist/dist/chartist.min.css',
            'bower_components/select2/dist/css/select2.min.css'
    ])
        .pipe(concat('lib.min.css'))
        .pipe(gulp.dest('Content'));
});

gulp.task('copyFonts', function() {
    return gulp.src([
            'bower_components/fontawesome/fonts/*.*',
            'bower_components/bootstrap/fonts/*.*',
            'bower_components/bootstrap-material-design/fonts/*.*',
        ])
        .pipe(gulp.dest('fonts'));
});

gulp.task('copyImages', function () {
    return gulp.src([
            'bower_components/admin-lte/dist/img/*.*'
    ])
        .pipe(gulp.dest('Content/img'));
});

gulp.task('compileLess', function () {
    return gulp.src('Content/site.less')
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(less())
        .pipe(minifyCss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('Content'));
});

gulp.task('compileTypeScript', function () {
    return gulp.src(['Scripts/site/*.ts', 'Scripts/typings/**/*.d.ts'])
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(ts({
            out: 'script.js',
            target: 'ES5',
        }))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('Scripts'));
});

gulp.task('onProjectOpened', function () {
    gulp.watch('Content/site.less', ['compileLess']);
    gulp.watch('Scripts/site/*.ts', ['compileTypeScript']);
});

function handleError(err) {
    console.log(err);
    this.emit('end');
}