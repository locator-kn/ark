var gulp = require('gulp');
var nodemon = require('gulp-nodemon');


gulp.task('develop', function () {
  nodemon({ script: 'index.js' })
    .on('restart', function () {
      console.log('restarted!');
    });
});
