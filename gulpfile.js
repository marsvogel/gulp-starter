var browserify  = require('browserify');
var buffer      = require('vinyl-buffer');
var connect     = require('gulp-connect');
var gulp        = require('gulp');
var imagemin    = require('gulp-imagemin');
var kss         = require('gulp-kss');
var rename      = require("gulp-rename");
var sass        = require('gulp-ruby-sass');
var source      = require('vinyl-source-stream');
var sourcemaps  = require('gulp-sourcemaps');
var spritesmith = require('gulp.spritesmith');
var uglify      = require('gulp-uglify');
var watch       = require('gulp-watch');

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
    return sass(
        "src/styles/",
        {
            style: "compressed",
            sourcemap: true
        }
    )
    .on('error', function (err) { console.error('Error!', err.message); })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist/styles"))
    .pipe(rename(function (path) {
        path.basename = "style"
    }))
    .pipe(gulp.dest("dist/styleguide/public"))
    .pipe(connect.reload());
});

gulp.task('styleguide', function(){
    gulp.src("src/styles/**/*.scss")
        .pipe(kss({
            overview: __dirname + '/src/styles/README.md'
        }))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulp.dest("dist/styleguide"))
        .pipe(connect.reload());
});

gulp.task('living-styleguide', function() {
    connect.server({
        root: 'dist/styleguide',
        livereload: true
    });
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
  gulp.watch("src/styles/**/*.scss", ['styles', 'styleguide']);
  gulp.watch("src/styles/README.md", ['styleguide']);
  gulp.watch("src/sprites/img/*.png", ['sprites']);
  gulp.watch(["src/img/**/*.jpg","src/img/**/*.png"], ['img']);
});

gulp.task("default",["watch","scripts","styles","styleguide","sprites","img","living-styleguide"]);