var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');
var ts = require('gulp-typescript');
var merge = require('merge2');
var spawn = require('child_process').spawn;
var iojsInstance = null;
var notifier = require('node-notifier');
var sourcemaps = require('gulp-sourcemaps');


gulp.task('jshint', function () {
      return gulp.src('./lib/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

var tsProjectEmily = ts.createProject({
    declarationFiles: true,
    noExternalResolve: false,
    module: 'commonjs',
    target: 'ES6',
    noEmitOnError: false
});

gulp.task('ts', function() {
    var tsResult = gulp.src('lib/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts(tsProjectEmily));

    tsResult._events.error[0] = function(error) {
        notifier.notify({
            'title': 'Compilation error',
            'message': error.__safety.toString(),
            sound: true
        });
    };
    return merge([
        tsResult.dts.pipe(gulp.dest('build/definitions')),
        tsResult.js.pipe(gulp.dest('build/js'))
    ]);
});

gulp.task('test', ['ts'], function() {
    gulp.watch('lib/*.ts', ['ts']);
});

gulp.task('start', ['ts'], function () {
    if (iojsInstance) {
        iojsInstance.kill();
    }
    iojsInstance = spawn('iojs', ['build/js/main.js'], {stdio: 'inherit'});
    iojsInstance.on('close', function (code) {
        if (code === 8) {
            notifier.notify({
                'title': 'Restart error',
                'message': 'Error detected, waiting for changes...',
                sound: true
            });
            gulp.log('Error detected, waiting for changes...');
        }
    });
});


gulp.task('default', ['start'], function() {
    gulp.watch(['./lib/**/*.ts'], ['start']);
});
