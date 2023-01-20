var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('compress', function () {
  return gulp.src(['lib/*.js', 'src/templates.js', 'src/gdpr.js']).
    pipe(concat('gdpr.js')).
    pipe(sourcemaps.init()).
    pipe(uglify()).
    pipe(sourcemaps.write('/')).
    pipe(gulp.dest('dist'));
});

gulp.task('copy', function() {
  return gulp.src(['src/gdpr.css', 'src/xdomain_cookie.html']).
    pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.series(['compress', 'copy']));