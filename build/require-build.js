/* 
 * build profile
 * All config options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
module.exports = ({
	dir: '<%= config.compressedDir %>',
    appDir: '<%= config.sourceDir %>',
    baseUrl: 'js/',
    optimize: 'uglify',
    optimizeCss: 'none', // https://github.com/jrburke/r.js/issues/167
    fileExclusionRegExp: /^\.|node_modules/,
    findNestedDependencies: false,
    mainConfigFile: '<%= config.sourceDir %>/js/config/require-config.js',

    // removeCombined: true,

    // don't need these modules to function in the build. So create stubs.
    // stubModules: [ 'plugins/tpl' ],// 'plugins/text' ],

    modules: [
        {
            // layer included with every page
            name: 'config/require-config',
            include: [
                'jquery',
                'stapes',
                'dot'
            ]
        },
        {

            name: 'mediators/general',
            exclude: [
                'config/require-config'
            ],
            excludeShallow: [
                'dot'
            ]
        },
        {

            name: 'mediators/course',
            exclude: [
                'config/require-config'
            ],
            excludeShallow: [
                'dot'
            ]
        },
        {

            name: 'mediators/question',
            exclude: [
                'config/require-config'
            ],
            excludeShallow: [
                'dot'
            ]
        },
        {

            name: 'mediators/search',
            exclude: [
                'config/require-config'
            ],
            excludeShallow: [
                'dot'
            ]
        },
        {

            name: 'mediators/admin',
            exclude: [
                'config/require-config'
            ],
            excludeShallow: [
                'dot'
            ]
        }
    ]

})
