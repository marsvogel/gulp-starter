var browserify  = require('browserify');
var buffer      = require('vinyl-buffer');
var connect     = require('gulp-connect');
var gulp        = require('gulp');
var gulpif      = require('gulp-if');
var imagemin    = require('gulp-imagemin');
var kss         = require('gulp-kss');
var rename      = require("gulp-rename");
var sass        = require('gulp-sass');
var source      = require('vinyl-source-stream');
var sourcemaps  = require('gulp-sourcemaps');
var spritesmith = require('gulp.spritesmith');
var uglify      = require('gulp-uglify');
var watch       = require('gulp-watch');

var pkg         = require('./package.json');
var settings    = pkg.projectSettings;
var production  = !!(argv.production); // true if --production flag is used

var getBundleName = function () {
    var version = pkg.version;
    var name = pkg.name;
    return version + '.' + name;
};

gulp.task('scripts', function() {

    var bundler = browserify({
        entries: ['./src/scripts/app.js'],
        debug: true
    });

    var bundle = function() {
        return bundler.bundle()
            .pipe(source(getBundleName() + '.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(gulpif(production, uglify()))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest("dist/scripts"));
    };

    return bundle();
});

gulp.task('styles', function () {

    return gulp.src('src/styles/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: production ? "compressed" : "nested"}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist/styles"))
    .pipe(connect.reload());
});

gulp.task('server', function() {
    connect.server({
        root: settings.server.root,
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

    gulp.watch("src/styles/**/*.scss", ['styles']);
    gulp.watch("src/styles/*.scss", ['styles']);

    gulp.watch("src/sprites/img/*.png", ['sprites']);

    gulp.watch(["src/img/**/*.jpg","src/img/**/*.png"], ['img']);
});

gulp.task("default",["watch","scripts","styles","sprites","img","server"]);