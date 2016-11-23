# angular-2-in-chrome
Angular 2 Tour of Heroes implemented as a Chrome extension with hot module reload capability. A template for developing Angular 2 applications offline without firing a local server instance.

## Description
A proof of concept Google Chrome extension for Angular 2 development that bypasses common file restrictions when not running in a web server. It has a development configuration using typescript which transpiles directly in the browser rather than a build configuration featuring a single javascript file for the application. It uses SystemJS as the module loader.

Angular 2 in Chrome includes the dependencies and devDependencies found in v2.2.0 Angular 2 Tour of Heroes by John Papa. 

It also incorporates a hot module reload capability implementing the hmr primitives by Alexis Vincent for SystemJS using a web worker to monitor file system changes, and reload the whole page or only a specific module of a page when the web worker detects that a source file has changed.

Lastly, the this extension incorporates other tweaks to the assets in the Angular 2 Tour of Heroes to better adapt it for development in a local file system instead of running in a web server.

## Usage
1. Download or clone from GitHub.
2. Run jspm install && jspm install -dev.
3. Load unpacked extension to Google Chrome.
4. Add folder to workspace in Chrome Dev Tools.
5. Happy Hacking!

NOTE: Make sure that the access file extensions setting is checked in the setting of the application found in the extensions page.

## Architecture
- The Tour of Heroes frontend is in the options page of the extension mapped to ./pages/index.html. To access it go to extensions settings and click options. Alternatively, right-click on the extension icon and click option. Doing it from chrome rather than opening the ./pages/index.html file directly bypasses Google Chrome's file access restrictions.
- The Tour of Heroes application code is mapped to ./app/ folder. The code is the typescript source code used in the tutorial with a few tweaks to adapt it to work as a google chrome extension.
- The hot module reloader monitors changes to the files in ./app/ and ./pages/ if they are used in the current execution context.
- The jspm_modules folder used for the dependencies and devDependencies is mapped to ./libraries/
- SystemJS configuration settings are located in ./libraries/config/ with the package.config.json, dev.config.json, and browser.config.json handling the dependency and devDependency registrations. These configurations are managed automatically by jspm. To use the latest versions of the dependencies and devDependencies, run jspm update.
- Application specific or custom configuration settings is in ./libraries/config/app.config.json. This configuration is invisible to jspm and must be managed manually. It contains the package registration of the application modules, the path mapping of the application code relative to the root folder, the alias registration of locations used in the dependencies or devDependencies in the other configuration files, transpiler options, as well as the baseUrl settings for SystemJS.

## Build for Production
**NOTE BY DEVELOPER**: I am new to Angular 2 application development as well as to the npm and jspm configuration settings for build options. I am still learning the basics of Angular 2 code and as such I currently lack the knowledge or the motivation to research the optimum build configuration for deployment. Theoretically, one can use AoT or JIT or bundling the application as is. More knowledgeable and experienced developers are invited to share their suggestions by doing a commit directly to this page.

## Motivations
### Develop Angular 2 applications offline.

### Run typescript "natively" in the browser using transpilation.

### Incorporate HMR capability that uses web worker instead of file watcher.

### Create template for Angular 2/SystemJS development with a minimum number of dependencies.
