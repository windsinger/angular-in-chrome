load('./libraries/system.src.js',
load('./libraries/config/app.config.json',
load('./libraries/config/dev.config.json',
load('./libraries/config/package.config.json', initialize))), true);

function initialize(){
    System.import('core-js')
          .then(() => {System.import('zone.js')})
          .then(() => {System.import('reflect-metadata')})
          .then(() => {System.import('systemjs-hmr')})
          .then(() => {System.import('main')})
          .catch(console.error.bind(console));
    document.getElementById("reload")
            .addEventListener("click", event => location.replace('pages/index.html'))
    setTimeout( () => load('./libraries/custom/hot-module-reloader.js', 
                () =>{const hmr = new HotModuleReloader()}, true), 5000);
}
function load(src,callback,loadNow){
    if (loadNow) {
        let type='text/javascript',
            script=document.createElement('script');
            script.onload=callback;
            script.type=type;
            script.src=src;
        document.head.appendChild(script);
    } else { return () => load(src, callback, true); }
}

// CODE USED TO PROTOTYPE SEQUENTIAL LOADER
// 
// var inter = 1;
// load('1',
// load('2',
// load('3',
// load('4',
// load('5', initialize )))), 'start');
// function load(src, callback, mode){
//     if (mode === 'start') {
//         setTimeout(callback, 1000);
//         console.log(inter);
//         inter++;
//     } else {
//         return () => {load(src, callback, 'start')};
//     }
// }
// function initialize() {
//     console.log(inter);
// }