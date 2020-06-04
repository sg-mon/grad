var gulp             = require('gulp'),
	browserSync      = require('browser-sync'),
	concat           = require('gulp-concat'),
	imagemin         = require('gulp-imagemin'),
	pngquant         = require('imagemin-pngquant'),
	cache            = require('gulp-cache'),
	imageminZopfli   = require('imagemin-zopfli'),
	imageminMozjpeg  = require('imagemin-mozjpeg'),
	uglify           = require('gulp-uglify-es').default;

// файлы для сборки
var jsFiles = [
	'js/main.js'
];

var jsFilesVen = [
	'js/vendors/*.js'
];
// таск для объединения js файлов
gulp.task('scripts', () => {
	process.env.NODE_ENV = "release";
	return gulp.src(jsFiles)
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('js'))
		.pipe(browserSync.reload({stream: true}))
});

// таск для объединения js файлов
gulp.task('scripts-ven', () => {
	process.env.NODE_ENV = "release";
	return gulp.src(jsFilesVen)
		.pipe(concat('vendors.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('js'))
		.pipe(browserSync.reload({stream: true}))
});

// таск для сборки, транспонирования и сжатия скриптов
gulp.task('scripts-build', () => {
	process.env.NODE_ENV = "release";

	return gulp.src(jsFiles)
		.pipe(concat('main.min.js'))
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('js')); // Выгружаем в папку app/js
});

// таск для обновления страницы
gulp.task('browser-sync', () => {
	browserSync({
		// startPath:'./',
		server: {
			baseDir: '..'
		},
		serveStaticOptions: {
			extensions: ["html"]
		},
		ghostMode: {
			scroll: false
		},
		notify: false,
	})
});

// таск следит за изменениями файлов и вызывает другие таски
gulp.task('watch', function() {
	gulp.watch(['js/vendors/*.js', 'js/*.js', '!js/main.min.js', 'js/modules/*.js'], gulp.parallel('scripts'));
	gulp.watch('./*.html', gulp.parallel(() => { browserSync.reload(); }));
	gulp.watch('js/*.js', gulp.parallel(() => { browserSync.reload(); }));
	gulp.watch('../assets/*', gulp.parallel(() => { browserSync.reload(); }));
});

// таск сжимает картинки без потери качества
gulp.task('img', () => {
	return gulp.src(['../assets/*.png', '../assets/*.jpg']) // откуда брать картинки
	.pipe(cache(
		imagemin([
			pngquant({
				speed: 1,
				quality: 80 //lossy settings
			}),
			imageminZopfli({
				more: true,
				iterations: 10 // very slow but more effective
			}),
			//jpg lossless
			imagemin.jpegtran({
				progressive: true
			}),
			//jpg very light lossy, use vs jpegtran
			imageminMozjpeg({
				quality: 85
			})
		])
	))
	.pipe(gulp.dest('../assets/')) // куда класть сжатые картинки
});

// сборка проекта
gulp.task('build', gulp.series('scripts-build', 'img', () => { console.log('builded');}))

// основной таск, который запускает вспомогательные
gulp.task('default', gulp.parallel('watch', 'browser-sync', 'scripts', () => { console.log('dev start');}));