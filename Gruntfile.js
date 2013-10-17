/**
 * Grunt build file
 * @author Jasper Palfree
 */

'use strict';

module.exports = function(grunt) {

    var path = require('path');
    var pkg, config;

    pkg = grunt.file.readJSON('package.json');
    config = {
        banner : [
            '/**\n',
            ' * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n',
            ' * <%= pkg.description %>\n',
            ' *\n',
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
            ' * Licensed <%= pkg.license %>\n',
            ' */\n'
        ].join(''),

        sourceDir: 'browser/library',
        compressedDir: 'browser/library-build',
        pkg : pkg
    };

    // Project configuration.
    grunt.initConfig({
        pkg: config.pkg,
        config: config,

        // code cleanliness validation
        jshint : {
            options : require('./jshint.json'),
            server: {
                options: {
                    browser: false,
                    node: true
                },
                files: {
                    src: [
                        'app/**/*.js'
                    ]
                }
            },
            source: [
                '<%= config.sourceDir %>/js/{.,modules,mediators}/*.js'
            ]
        },

        // to help development
        bgShell: {
            _defaults: {
                bg: true
            },

            watchCompass: {
                cmd: 'compass watch'
            },

            cleanCompass: {
                cmd: 'compass clean --config <%= compass.source.options.config %>',
                bg: false
            },

            nodemon: {
                cmd: 'nodemon -e ".js|.html" ./app.js',
                bg: false
            },

            nodemonFE: {
                cmd: 'nodemon -e ".html" ./app.js',
                bg: false
            }
        },

        // for production image optimization
        img: {
            source: {
                src: '<%= config.compressedDir %>/images'
            }
        },

        // cleaning
        clean: [
            '<%= config.compressedDir %>'
        ],

        // for production compiling
        compass: {
            source: {
                options: {
                    config: 'config.rb',
                    environment: 'production',
                    force: true
                }
            }
        },

        // build a custom version of the lodash library for utility functions
        // lodash: {
        //     // modifiers for prepared builds
        //     // backbone, csp, legacy, mobile, strict, underscore
        //     modifier: 'backbone',
        //     // output location
        //     dest: '<%= config.sourceDir %>/js/vendor/lodash.js',
        //     // define a different Lo-Dash location
        //     // useful if you wanna use a different Lo-Dash version (>= 0.7.0)
        //     // by default, lodashbuilder uses always the latest version
        //     // of Lo-Dash (that was in npm at the time of lodashbuilders installation)
        //     // src: 'node_modules/lodash',
        //     // More information can be found in the [Lo-Dash custom builds section](http://lodash.com/#custom-builds)
        //     // category: ['collections', 'functions']
        //     exports: ['amd'],
        //     // iife: '(function(){%output%;lodash.extend(PhaseMatch.util, lodash);}());',
        //     // include: ['extend', 'bind', 'clone', 'keys', 'pick', 'memoize']
        //     // minus: ['result', 'shuffle']
        //     // plus: ['random', 'template'],
        //     // template: './*.jst'
        //     // settings: '{interpolate:/\\{\\{([\\s\\S]+?)\\}\\}/g}'
        // },

        // for production r.js optimization task
        requirejs: {
            source: {
                options: require('./build/require-build.js')
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-img');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-compass');
    // grunt.loadNpmTasks('grunt-lodash');
    
    // Tasks
    grunt.registerTask('compress-only', ['compass', 'requirejs:source'])

    // Primary tasks
    grunt.registerTask('dev', ['bgShell:watchCompass', 'bgShell:nodemon']);
    grunt.registerTask('devfe', ['bgShell:watchCompass', 'bgShell:nodemonFE']);
    grunt.registerTask('cleanup', ['clean', 'bgShell:cleanCompass']);
    grunt.registerTask('build', ['cleanup', 'jshint', 'compress-only', 'img:source']);

    // Build for deployment
    grunt.registerTask('dist', ['build']);

    // Default task(s).
    grunt.registerTask('default', ['build']);

};
