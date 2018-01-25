const gulp = require('gulp');
const handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const options = {
    ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false
    batch : ['./static/views/partials'],
};
const files = [
    { task: 'index', name: 'index.html', path: 'static/views/index.hbs' },
    { task: 'team', name: 'team.html', path: 'static/views/team.hbs' },
    { task: '404', name: '404.html', path: 'static/views/404.hbs' },
];

function buildFile(path, name) {
    return gulp.src(path)
        .pipe(handlebars({}, options))
        .pipe(rename(name))
        .pipe(gulp.dest('dist'));
}

files.forEach(f => gulp.task(f.task, () => buildFile(f.path, f.name)));
gulp.task('default', files.map(f => f.task));
