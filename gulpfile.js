var gulp = require("gulp");
var sass = require("gulp-sass");
var header = require("gulp-header");
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var autoprefixer = require("gulp-autoprefixer");
var nunjucksRender = require("gulp-nunjucks-render");
var pkg = require("./package.json");
var browserSync = require("browser-sync").create();

// Set the banner content
var banner = [
  "/*!\n",
  " * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n",
  " * Copyright 2013-" + new Date().getFullYear(),
  " <%= pkg.author %>\n",
  " * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n",
  " */\n",
  "\n"
].join("");

// Nunjuncks templating
// gulp.task("nunjucks", function() {
//   nunjucksRender.nunjucks.configure(["templates/"]);
//   // Gets .html and .nunjucks files in pages
//   return (
//     gulp
//       .src("pages/**/*.+(html|nunjucks)")
//       // Renders template with nunjucks
//       .pipe(nunjucksRender())
//       // output files in app folder
//       .pipe(gulp.dest("public"))
//   );
// });
gulp.task("nunjucks", function() {
  return gulp
    .src("pages/**/*.+(nunjucks|html)")
    .pipe(
      nunjucksRender({
        path: ["templates"]
      })
    )
    .pipe(gulp.dest("./"));
});

// Copy third party libraries from /node_modules into /vendor
gulp.task("vendor", function() {
  // Bootstrap
  gulp
    .src([
      "./node_modules/bootstrap/dist/**/*",
      "!./node_modules/bootstrap/dist/css/bootstrap-grid*",
      "!./node_modules/bootstrap/dist/css/bootstrap-reboot*"
    ])
    .pipe(gulp.dest("./vendor/bootstrap"));

  // Font Awesome 5
  gulp.src(["./node_modules/@fortawesome/**/*"]).pipe(gulp.dest("./vendor"));

  // jQuery
  gulp
    .src([
      "./node_modules/jquery/dist/*",
      "!./node_modules/jquery/dist/core.js"
    ])
    .pipe(gulp.dest("./vendor/jquery"));

  // jQuery Easing
  gulp
    .src(["./node_modules/jquery.easing/*.js"])
    .pipe(gulp.dest("./vendor/jquery-easing"));

  // Simple Line Icons
  gulp
    .src(["./node_modules/simple-line-icons/fonts/**"])
    .pipe(gulp.dest("./vendor/simple-line-icons/fonts"));

  gulp
    .src(["./node_modules/simple-line-icons/css/**"])
    .pipe(gulp.dest("./vendor/simple-line-icons/css"));
});

// Compile SCSS
gulp.task("css:compile", function() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(
      sass
        .sync({
          outputStyle: "expanded"
        })
        .on("error", sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(
      header(banner, {
        pkg: pkg
      })
    )
    .pipe(gulp.dest("./css"));
});

// Minify CSS
gulp.task("css:minify", ["css:compile"], function() {
  return gulp
    .src(["./css/*.css", "!./css/*.min.css"])
    .pipe(cleanCSS())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(gulp.dest("./css"))
    .pipe(browserSync.stream());
});

// CSS
gulp.task("css", ["css:compile", "css:minify"]);

// Minify JavaScript
gulp.task("js:minify", function() {
  return gulp
    .src(["./js/*.js", "!./js/*.min.js"])
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(
      header(banner, {
        pkg: pkg
      })
    )
    .pipe(gulp.dest("./js"))
    .pipe(browserSync.stream());
});

// JS
gulp.task("js", ["js:minify"]);

// Default task
gulp.task("default", ["css", "js", "vendor", "nunjucks"]);

// Configure the browserSync task
gulp.task("browserSync", function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

// Dev task
gulp.task("dev", ["css", "js", "browserSync"], function() {
  gulp.watch("./scss/*.scss", ["css"]);
  gulp.watch("./js/*.js", ["js"]);
  gulp.watch("./*.html", browserSync.reload);
});
