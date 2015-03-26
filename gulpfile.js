var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');


gulp.task('jshint', function () {
      return gulp.src('./lib/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('develop', function () {
  nodemon({
    script: 'index.js',
    tasks: ['jshint']
    })
    .on('restart', function () {
      console.log('restarted!');
    });
});
