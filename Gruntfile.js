// Js files to inject in `layout/_partial/script.ejs`
var JsFilesToInject = [
    'source/assets/js/jquery.js',
    'source/assets/js/jquery.fancybox.js',
    'source/assets/js/jquery.fancybox-thumbs.js',
    'source/assets/js/tranquil-peak.js'
];

// Css files to inject in `layout/_partial/head.ejs`
var CssFilesToInject = [
    'source/assets/css/font-awesome.css',
    'source/assets/css/jquery.fancybox.css',
    'source/assets/css/jquery.fancybox-thumbs.css',
    'source/assets/css/tranquil-peak.css'
];

module.exports = function(grunt) {
    grunt.initConfig({
        // Copy all needed files by types
        bower:          {
            dev: {
                dest:       'source/assets/images',
                js_dest:    'source/assets/js',
                css_dest:   'source/assets/css',
                fonts_dest: 'source/assets/fonts',
                options:    {
                    expand:                false,
                    keepExpandedHierarchy: false,
                    packageSpecific:       {
                        'fancybox': {
                            files: [
                                'source/blank.gif',
                                'source/fancybox_loading.gif',
                                'source/fancybox_loading@2x.gif',
                                'source/fancybox_overlay.png',
                                'source/fancybox_sprite.png',
                                'source/fancybox_sprite@2x.png',
                                'source/jquery.fancybox.js',
                                'source/jquery.fancybox.css',
                                'source/helpers/jquery.fancybox-thumbs.css',
                                'source/helpers/jquery.fancybox-thumbs.js'
                            ]
                        }
                    }
                }
            }
        },
        sass:           {
            // Compile `tranquil-peak.scss` file into `tranquil-peak.css`
            dev: {
                options: {
                    sourcemap: 'none'
                },
                files:   [
                    {
                        expand: true,
                        cwd:    'source/_css',
                        src:    ['tranquil-peak.scss'],
                        dest:   'source/assets/css/',
                        ext:    '.css'
                    }
                ]
            }
        },
        concat:         {
            // Concat all javascript file into `tranquil-peak.js`
            devJs:   {
                src:     ['source/_js/**/*.js'],
                dest:    'source/assets/js/tranquil-peak.js',
                options: {
                    separator: ';',
                }
            },
            // Concat all stylesheets file into `style.css`
            prodCss: {
                src:  ['source/assets/css/*.css'],
                dest: 'source/assets/css/style.css',
            },
            // Concat all javascript file in `script.js`
            prodJs:  {
                src:     JsFilesToInject,
                dest:    'source/assets/js/script.js',
                options: {
                    separator: ';',
                }
            }
        },
        cssmin:         {
            // Minify `style.css` file into `style.min.css`
            prod: {
                files: [
                    {
                        expand: true,
                        cwd:    'source/assets/css',
                        src:    ['style.css'],
                        dest:   'source/assets/css',
                        ext:    '.min.css'
                    }
                ]
            }
        },
        uglify:         {
            // Minify `script.js` file into `script.min.js`
            prod: {
                options: {
                    mangle: {
                        except: [
                            'jQuery',
                            'fancybox'
                        ]
                    }
                },
                files:   {
                    'source/assets/js/script.min.js': ['source/assets/js/script.js']
                }
            }
        },
        sync:           {
            // Synchronize images
            dev: {
                files: [
                    {
                        cwd:  'source/_images',
                        src:  ['**/*'],
                        dest: 'source/assets/images'
                    }
                ]
            }
        },
        // Link stylesheets and javascript files to views
        'sails-linker': {
            devJs:   {
                options: {
                    startTag: '<!--SCRIPTS-->',
                    endTag:   '<!--SCRIPTS END-->',
                    fileTmpl: '<%- js(\'%s\') EJS_ENDTAG',
                    appRoot:  'source/'
                },
                files:   {
                    'layout/_partial/script.ejs': JsFilesToInject
                }
            },
            devCss:  {
                options: {
                    startTag: '<!--STYLES-->',
                    endTag:   '<!--STYLES END-->',
                    fileTmpl: '<%- css(\'%s\') EJS_ENDTAG',
                    appRoot:  'source/'
                },
                files:   {
                    'layout/_partial/head.ejs': CssFilesToInject
                }
            },
            prodJs:  {
                options: {
                    startTag: '<!--SCRIPTS-->',
                    endTag:   '<!--SCRIPTS END-->',
                    fileTmpl: '<%- js(\'%s\') EJS_ENDTAG',
                    appRoot:  'source/'
                },
                files:   {
                    'layout/_partial/script.ejs': 'source/assets/js/script.min.js'
                }
            },
            prodCss: {
                options: {
                    startTag: '<!--STYLES-->',
                    endTag:   '<!--STYLES END-->',
                    fileTmpl: '<%- css(\'%s\') EJS_ENDTAG',
                    appRoot:  'source/'
                },
                files:   {
                    'layout/_partial/head.ejs': 'source/assets/css/style.min.css'
                }
            },
        },
        clean:          {
            // Delete the `assets` folder
            build: ['source/assets']
        },
        replace:        {
            // Replace `EJS_ENDTAG` string to resolve a problem of ejs escaping with sails-linker
            linker:      {
                overwrite:    true,
                src:          [
                    'layout/_partial/head.ejs',
                    'layout/_partial/script.ejs'
                ],
                replacements: [
                    {
                        from: 'EJS_ENDTAG',
                        to:   '%>'
                    }
                ]
            },
            // Modify url of images in fancybox.css to resolve images path.
            // Impossible to use an other plugin to do that
            // because in the bower fancybox packages, css files and images are in the same folder
            // and that not the case in assets folder.
            cssFancybox: {
                overwrite:    true,
                src:          [
                    'source/assets/css/jquery.fancybox.css'
                ],
                replacements: [
                    {
                        from: 'url(\'',
                        to:   'url(\'../images/'
                    }
                ]
            }
        },
        watch:          {
            // Watch assets to detect changes and launch `SyncAssets` task
            assets: {
                files: ['source/_*/**/*'],
                tasks: ['SyncAssets']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    // Compile assets all assets (css and js)
    grunt.registerTask('CompileAssets', [
        'sass:dev',
        'concat:devJs',
        'sync:dev'
    ]);

    // Build (environment : development)
    grunt.registerTask('Build', [
        'clean:build',
        'bower:dev',
        'CompileAssets',
        'LinkAssets',
        'replace:cssFancybox'
    ]);

    // Build (environment : production)
    grunt.registerTask('BuildProd', [
        'clean:build',
        'bower:dev',
        'CompileAssets',
        'concat',
        'cssmin',
        'uglify',
        'LinkAssetsProd',
        'replace:cssFancybox'
    ]);

    // Link all assets (environment : development)
    grunt.registerTask('LinkAssets', [
        'sails-linker:devJs',
        'sails-linker:devCss',
        'replace:linker'
    ]);

    // Link all assets (environment : production)
    grunt.registerTask('LinkAssetsProd', [
        'sails-linker:prodJs',
        'sails-linker:prodCss',
        'replace:linker'
    ]);

    // Synchronize all assets (css, js and images) after changes
    grunt.registerTask('SyncAssets', ['CompileAssets']);

    // Watch all assets (css, js and images) to detect changes
    grunt.registerTask('Watch', ['watch']);
};