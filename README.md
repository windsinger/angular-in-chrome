# angular-2-in-chrome
Angular 2 Tour of Heroes implemented as a Chrome extension with hot module reload capability.

## Description
A proof of concept Google Chrome extension for Angular 2 development that bypasses common file restrictions when not running in a web server. It has a development configuration using typescript which transpiles directly in the browser rather than a build configuration featuring a single javascript file for the application. It uses SystemJS as the module loader.

Angular 2 in Chrome includes the dependencies and devDependencies found in v2.2.0 Angular 2 Tour of Heroes by John Papa. 

It also incorporates a hot module reload capability implementing the hmr primitives by Alexis Vincent for SystemJS using a web worker to monitor file system changes, and reload the whole page or only a specific module of a page when the web worker detects that a source file has changed.

Lastly, the this extension incorporates other tweaks to the assets in the Angular 2 Tour of Heroes to better adapt it for development in a local file system instead of running in a web server.

## How To Install
1. Download or clone from GitHub.
2. Run jspm install && jspm install -dev.
3. Load unpacked extension to Google Chrome.
4. Add folder to workspace in Chrome Dev Tools.
5. Happy Hacking!

## Motivations
### Run typescript "natively" in the browser using transpilation.

### Run Angular 2 from the filesystem without firing up a server.

### Incorporate HMR capability that uses a web worker to monitor file changes.
