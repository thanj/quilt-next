/* jshint node: true */

module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/**\n' +
              '* <%= pkg.name %>.js v<%= pkg.version %> by @fat and @mdo\n' +
              '* Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
              '* <%= _.pluck(pkg.licenses, "url").join(", ") %>\n' +
              '*/\n',
    jqueryCheck: 'if (!jQuery) { throw new Error(\"Bootstrap requires jQuery\") }\n\n',

    // Task configuration.
    clean: {
      dist: ['dist']
    },

    jshint: {
      options: {
        jshintrc: 'js/.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['js/*.js']
      },
      test: {
        src: ['js/tests/unit/*.js']
      }
    },

    concat: {
      options: {
        banner: '<%= banner %><%= jqueryCheck %>',
        stripBanners: false
      },
      bootstrap: {
        src: [
          'js/transition.js',
          'js/alert.js',
          'js/button.js',
          'js/carousel.js',
          'js/collapse.js',
          'js/dropdown.js',
          'js/modal.js',
          'js/tooltip.js',
          'js/popover.js',
          'js/scrollspy.js',
          'js/tab.js',
          'js/affix.js'
        ],
        dest: 'dist/js/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      quilt: {
        src: ['<%= concat.bootstrap.dest %>'],
        dest: 'dist/js/<%= pkg.name %>.min.js'
      }
    },

    assemble: {
      options: {
        data: 'assets/js/providers.json',
        ext: ''
      },
      providers: {
        files: {
          '.': [
            'lib/providers.scss.hbs',
            'lib/providers-ie.scss.hbs',
            'assets/js/provider-config.json.hbs'
          ],
        }
      }
    },

    // Resize provider assets
    "imagemagick-resize": [48,32,24,16].reduce(
        function(subtasks, size) {
          subtasks[size] = {
            from: 'assets/images/providers/',
            to: 'assets/images/providers/'+size+'/',
            files: '*.png',
            props: {
              width: size,
              customArgs: [
                '-channel A -level 20,100%,0.85',
                '+channel -background black -alpha background'
              ]
            },
          }
          return subtasks
        }, {
          'grayscale': {
            from: 'assets/images/providers/',
            to: 'assets/images/providers/grayscale/',
            files: '*.png',
            props: {
              width: 128,
              customArgs: [ '-fx', '(r+b+g)/3', '-matte' ]
            },
          }
        }
      ),

    compass: {
      quilt: {
        options: {
          sassDir: 'lib/quilt.scss',
          cssDir: 'dist/css/'
        }
      },
      providers: {
        options: {
          outputStyle: 'compressed',
          sassDir: 'lib/providers.scss',
          cssDir: 'dist/css/<%= pkg.name %>.min.css'
        },
      }
    },

    copy: {
      fonts: {
        expand: true,
        src: ["fonts/*"],
        dest: 'dist/'
      }
    },

    qunit: {
      options: {
        inject: 'js/tests/unit/phantom.js'
      },
      files: ['js/tests/*.html']
    },

    watch: {
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'qunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      },
      compass: {
        files: 'lib/*.scss',
        tasks: ['compass']
      }
    }
  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-imagemagick');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html-validation');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('browserstack-runner');
  grunt.loadNpmTasks('assemble');

  // Docs HTML validation task
  grunt.registerTask('validate-html', ['jekyll', 'validation']);

  // Test task.
  var testSubtasks = ['dist-css', 'jshint', 'qunit', 'validate-html'];

  // JS distribution task.
  grunt.registerTask('dist-js', ['concat', 'uglify']);

  // CSS distribution task.
  grunt.registerTask('dist-css', ['compass']);

  // Fonts distribution task.
  grunt.registerTask('dist-fonts', ['copy']);

  // Full distribution task.
  grunt.registerTask('dist', ['clean', 'assemble', 'dist-css', 'dist-fonts', 'dist-js']);

  // Default task.
  grunt.registerTask('default', ['dist']);

};

// vi: sw=2 sts=2 ts=2 expandtab
