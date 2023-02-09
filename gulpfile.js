const fs = require('fs');
const gulp = require('gulp');
const bump = require('gulp-bump');
const git = require('gulp-git');
var exec = require('child_process').exec;
var path = require('path');
var AndroidManifest = require('manifest-android');
const { series } = require('gulp');

const _minor = () => (
    gulp.src('./package.json')
    .pipe(bump({ type: 'minor' }))
    .pipe(gulp.dest('./'))
);

const _patch = () => (
    gulp.src('./package.json')
    .pipe(bump({ type: 'patch' }))
    .pipe(gulp.dest('./'))
);

const _gitAdd = async(cb) => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json'));

    if (!fs.existsSync(`./releases/release_notes-${packageJson.version}.txt`)) {
        return cb(`cannot release, missing ./releases/release_notes-${packageJson.version}.txt`)
    }
    // add release note
    await gulp
        .src(`./releases/release_notes-${packageJson.version}.txt`)
        .pipe(git.add())
    cb();
};

const _gitCommit = async(cb) => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json'));

    // commit package.json, AndroidManifest.xml and release notes
    await gulp
        .src([
            `./releases/release_notes-${packageJson.version}.txt`,
            'package.json',
            'App_Resources/Android/src/main/AndroidManifest.xml'
        ])
        .pipe(git.commit(`release ${packageJson.version}`))
        // tag
    cb();
};

const _gitTag = async(cb) => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json'));
    await git.tag(packageJson.version, `release ${packageJson.version}`);
    // push
    //await git.push('origin', ['master']);
    // push tags
    //await git.push('origin', ['master'], { args: " --tags" });
    cb();
};


const _updateAndroidManifest = async(cb) => {
    const manifestPath = './App_Resources/Android/src/main'
    const packageJson = JSON.parse(fs.readFileSync('./package.json'));
    var android = new AndroidManifest();
    android.load({ file: path.join(manifestPath, "AndroidManifest.xml") }, function(err) {
        const version = packageJson.version.split('.')
        const build = parseInt(android.version.build) + 1
        android.version = `${packageJson.version}.${build}`
        android.save({ file: path.join(manifestPath, "AndroidManifest.xml") }, function(err) {
            console.log('updateAndroidManifest: android version', android.version)
            cb(err);
        })
    })
};

const _buildAAB = async(cb) => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json'));
    exec(`tns build android --release --key-store-path ./keys/keystore.jks --key-store-password p1pp0996 --key-store-alias upload --key-store-alias-password p1pp0996 --aab --copy-to releases/biketracking-${packageJson.version}.aab
`, (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (!err) {
            console.log(`\n\nBefore publish compile release notes ./releases/release_notes-${packageJson.version}.txt`)
        }

        cb(err);
    });
};

const _publish = async(cb) => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json'));
    const releaseNotes = fs.readFileSync(`./releases/release_notes-${packageJson.version}.txt`);
    exec(`appcenter distribute stores publish --app heyteacher70-gmail.com/BikeTracking --file releases/biketracking-${packageJson.version}.aab --store Production --release-notes "${releaseNotes}"`, (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
};

const buildReleaseAndroid = series(_updateAndroidManifest, _buildAAB)

exports.publish = series(_gitAdd, _gitCommit, _gitTag, _publish)
exports.minor = series(_minor, buildReleaseAndroid)
exports.patch = series(_patch, buildReleaseAndroid)
exports.default = buildReleaseAndroid