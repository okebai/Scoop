/// <binding ProjectOpened='watch:js, watch:css' />
/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        clean: {
            js: ['Scripts/script.*', 'Scripts/site/*.js'],
            css: ['Content/Site.*css'],
        },
        typescript: {
            js: {
                src: ['Scripts/site/*.ts', 'Scripts/typings/**/*.d.ts'],
                dest: 'Scripts/script.js',
                options: {
                    target: 'es5'
                }
            }
        },
        less: {
            css: {
                files: {
                    'Content/Site.css': 'Content/Site.less'
                }
            }
        },
        cssmin: {
            css: {
                src: 'Content/Site.css',
                dest: 'Content/Site.min.css'
            }
        },
        //concat: {
        //    js: {
        //        src: ['Scripts/Site/*.js'],
        //        dest: 'Scripts/script.js'
        //    },
        //    css: {
        //        src: ['Content/Site.css'],
        //        dest: 'Content/Site.css'
        //    }
        //},
        uglify: {
            js: {
                src: ['Scripts/script.js'],
                dest: 'Scripts/script.min.js'
            },
            css: {
                src: ['Content/Site.css'],
                dest: 'Content/Site.min.css'
            },
        },
        watch: {
            js: {
                files: ['Scripts/Site/*.ts'],
                tasks: ['js']
            },
            css: {
                files: ['Content/Site.less'],
                tasks: ['css']
            },
        }
    });


    grunt.registerTask('js', ['clean:js', 'typescript:js', 'uglify:js']);
    grunt.registerTask('css', ['clean:css', 'less:css', 'cssmin:css']);
};