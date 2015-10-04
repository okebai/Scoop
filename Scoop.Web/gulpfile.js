/// <binding AfterBuild='watch' ProjectOpened='watch' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp'),
    less = require('gulp-less'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    ts = require('gulp-typescript'),
    uglify = require('gulp-uglify');

gulp.task('compileLess', function () {
    return gulp.src('Content/Site.less')
        .pipe(less())
        .pipe(minifyCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('Content'));
});

gulp.task('compileTypeScript', function () {
    return gulp.src(['Scripts/site/*.ts', 'Scripts/typings/**/*.d.ts'])
        .pipe(ts({
            out: 'script.js',
            target: 'ES5',
        }))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('Scripts'));
});

gulp.task('watch', function () {
    gulp.watch('Content/Site.less', ['compileLess']);
    gulp.watch('Scripts/site/*.ts', ['compileTypeScript']);
});