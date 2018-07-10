// По сути вся задача Gulp — мы берем какие-то файлы, что-то с ними делаем и выгружаем куда-то результаты работы с ним.
var gulp         = require('gulp'), //Подключаем Gilp пакет; 
    sass         = require('gulp-sass'), //Подключаем Sass пакет; 
    browserSync  = require('browser-sync'), // Подключаем Browser Sync
    concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify       = require('gulp-uglifyjs'),
    cssnano      = require('gulp-cssnano'),
    rename       = require('gulp-rename') // Подключаем gulp-uglifyjs (для сжатия JS)
    del          = require('del'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant')
    cache        = require('gulp-cache')
    autoprefixer = require('gulp-autoprefixer') ; 

// Давайте создадим обработчик, который будет компилировать Sass файлы в CSS (CSS препроцессинг)
gulp.task('sass', function() { // Создаем таск "sass"
  return gulp.src('app/sass/**/*.sass') // Берем источник. Выборку файлов можно делать с помощью разных шаблонов.
  //1. 'app/sass/*.sass' — мы выберем все файлы с расширением .sass, не учитывая название файлов.
  //1.1 Можно прописать путь до конкретного файла, например 'app/sass/main.sass' 
  //2. '!app/sass/**/*.sass' — Мало того, что выберутся все файлы с расширением .sass, но и нам неважна структура и директория до этих файлов.
  //3. 'app/sass/**/*.sass' — восклицательный знак показывает, что мы исключаем данный путь или файлы из выборки.
  //4. ['!app/sass/main.sass', 'app/sass/**/*.sass'] — квадратные скобки указывают на массив. В данном случае, мы выбираем все файлы .sass и исключаем файл main.sass.
  //5. 'app/sass/*.+(scss|sass)' — мы выбираем все .scss и .sass файлы
    .pipe(sass())  // Преобразуем Sass в CSS посредством gulp-sass
    .pipe(autoprefixer(['last 15 versions', '>1%', 'ie 8', 'ie 7'], {cascade: true}))
    .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css. Название файла писать не нужно.
    .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
})

gulp.task('scripts', function() {
  return gulp.src([
    'app/libs/jquery/dist/jquery.min.js',
    'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js',
  ])
  .pipe(concat('libs.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('app/js'));
});

gulp.task('css-libs', ['sass'], function() {
  return gulp.src('app/css/libs.css')
  .pipe(cssnano())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('app/css'));
})

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

gulp.task('clean', function() {
  return del.sync('dist');
});

gulp.task('clear-cache', function() {
  return cache.clearAll();
});

gulp.task('img', function() {
  return gulp.src('app/img/**/*')
  .pipe(cache(imagemin({
    interlaced: true,
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  })))
  .pipe(gulp.dest('dist/img'))
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
  gulp.watch('app/sass/**/*.sass', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('build', ['clean', 'sass', 'scripts', 'img'], function() {

  var buildCss = gulp.src([
    'app/css/main.css',
    'app/css/libs.min.css'
  ])
    .pipe(gulp.dest('dist/css'));

  var buildFonts = gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));

  var buildJs = gulp.src('app/js/**/*')
    .pipe(gulp.dest('dist/js'));

  var buildHtml = gulp.src('app/*html')
    .pipe(gulp.dest('dist'));

});