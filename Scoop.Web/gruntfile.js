/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
var timer = require('grunt-timer');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-timer');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');

    timer.init(grunt);

    grunt.initConfig({
        clean: {
            ts: ['Scripts/script.*', 'Scripts/site/*.js'],
            less: ['Content/Site.*css'],
        },
        typescript: {
            ts: {
                src: ['Scripts/site/*.ts', 'Scripts/typings/**/*.d.ts'],
                dest: 'Scripts/script.js',
                options: {
                    target: 'es5'
                }
            }
        },
        less: {
            less: {
                files: {
                    'Content/Site.css': 'Content/Site.less'
                }
            }
        },
        cssmin: {
            less: {
                src: 'Content/Site.css',
                dest: 'Content/Site.min.css'
            }
        },
        uglify: {
            ts: {
                src: ['Scripts/script.js'],
                dest: 'Scripts/script.min.js'
            },
            less: {
                src: ['Content/Site.css'],
                dest: 'Content/Site.min.css'
            },
        },
        watch: {
            ts: {
                files: ['Scripts/Site/*.ts'],
                tasks: ['recompileTypeScript']
            },
            less: {
                files: ['Content/Site.less'],
                tasks: ['recompileLess']
            },
        }
    });


    grunt.registerTask('recompileTypeScript', ['clean:ts', 'typescript:ts', 'uglify:ts']);
    grunt.registerTask('recompileLess', ['clean:less', 'less:less', 'cssmin:less']);
};