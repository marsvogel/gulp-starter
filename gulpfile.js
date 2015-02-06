var gulp        = require("gulp");
var watch       = require("gulp-watch");
var sass        = require("gulp-ruby-sass");
var uglify      = require("gulp-uglify");
var browserify  = require("gulp-browserify");
var spritesmith = require('gulp.spritesmith');
var browserify  = require('browserify');
var buffer      = require('vinyl-buffer');
var imagemin    = require('gulp-imagemin');
var uglify      = require('gulp-uglify');
var sass        = require('gulp-ruby-sass');
var source      = require('vinyl-source-stream');
var sourcemaps  = require('gulp-sourcemaps');
var getBundleName = function () {
    var version = require('./package.json').version;
    var name = require('./package.json').name;
    return version + '.' + name;
};

gulp.task('scripts', function() {

    var bundler = browserify({
        entries: ['./src/scripts/app.js'],
        debug: true
    });

    var bundle = function() {
        return bundler
            .bundle()
            .pipe(source(getBundleName() + '.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            // Add transformation tasks to the pipeline here.
            .pipe(uglify())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest("dist/scripts"));
    };

    return bundle();
});

gulp.task('styles', function () {
    gulp.src("src/styles/**/*.scss")
        .pipe(sass({
            style: "compressed",
            sourcemapPath: '../src/styles'
        }))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulp.dest("dist/styles"));
});

gulp.task('sprites', function () {
    var spriteData = gulp.src("src/sprites/img/*.png")
    .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite.scss',
        cssFormat: 'scss',
        padding: 10,
        imgPath: "/dist/img/sprite.png",
        cssTemplate: "src/sprites/sprite.scss.mustache"
    }));
    spriteData.img
        .pipe(gulp.dest("src/img"));
    spriteData.css
        .pipe(gulp.dest("tmp/styles"));
});

gulp.task('img', function() {
    return gulp.src(["src/img/**/*.jpg","src/img/**/*.png"])
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest("dist/img"));
});

gulp.task('watch', function() {
  gulp.watch("src/scripts/*.js", ['scripts']);
  gulp.watch("src/scripts/**/*.js", ['scripts']);
  gulp.watch("src/styles/**/*.scss", ['styles']);
  gulp.watch("src/sprites/img/*.png", ['sprites']);
  gulp.watch(["src/img/**/*.jpg","src/img/**/*.png"], ['img']);
});

gulp.task("default",["watch","scripts","styles","sprites","img"]);