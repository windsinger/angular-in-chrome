const blob = new Blob([`
class HotModuleChecker {
    constructor(directory) {
        this.initialize(directory);
    }
    initialize(directory){
        clearTimeout(this.checker);
        clearTimeout(this.checker);
        clearTimeout(this.generator);
        clearTimeout(this.generator);
        
        this.checker = null;
        this.modules = new Map(directory);
        this.fetchers = new Set();
        this.generator = null;
        this.resources = new Map();
        this.isInitialized = false;
        this.isInitializing = false;
        this.changeDetected = false;

        this.generateCache();
    }
    generateCache() {
        if (!(this.isInitialized || this.isInitializing)) {
            this.isInitializing = true;
            for(let url of this.modules.keys()) {
                this.getResource(url, this.setResource());
            }
            this.generator = setTimeout((this.generateCache).bind(this), 100);
        }  else if  (this.fetchers > 0) {
            this.generator = setTimeout((this.generateCache).bind(this), 100);
        } else {
            postMessage('WorkerInitialized');
            clearTimeout(this.generator);
            clearTimeout(this.generator);
            this.isInitializing = false;
            this.isInitialized = true;
            this.generator = null;
            this.check();
        }
    }
    
    //   FOLLOWING CODE ADAPTED FROM
    //   Fast UUID generator, RFC4122 version 4 compliant.
    //   @author Jeff Ward (jcward.com).
    //   @license MIT license
    //   @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
    
    generateUUID(){
        let lut = [],    
             d0 = Math.random()*0xffffffff|0,
             d1 = Math.random()*0xffffffff|0,
             d2 = Math.random()*0xffffffff|0,
             d3 = performance.now()*0xffffffff|0;
            
        for(let i=0; i<256; i++) { 
            lut[i] = (i<16?'0':'')+(i).toString(16);
         }
         
        return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
               lut[d1&0xff]+lut[d1>>8&0xff]+'-'+
               lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
               lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+
               lut[d2>>16&0xff]+lut[d2>>24&0xff]+lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
    }
    getResource(url, callback) {
        let init = { method: 'GET',
                     cache: 'no-cache' },
            request = new Request(url, init),
            fetchersUUID = this.generateUUID();
            
        this.fetchers.add(fetchersUUID);
        fetch(request).then(response => response.text())
            .then(text => callback(url, text, fetchersUUID))
            .catch(error => this.delResource(url, fetchersUUID));
            
    }
    delResource(url, fetchersUUID) {
        this.resources.delete(url);
        this.fetchers.delete(fetchersUUID);
        this.modules.delete(url);
    }
    setResource() {
        return (url, newResource, fetchersUUID) => {
            this.fetchers.delete(fetchersUUID);
            this.resources.set(url, newResource);
        }
    }
    compareResource(oldResource) {            
        return (url, newResource, fetchersUUID) => {
            this.resources.set(url, newResource);
            this.fetchers.delete(fetchersUUID);
            this.changeDetected = (oldResource !== newResource)
            if (this.changeDetected) {
                this.changeHandler(url)
            }
        };
    }
    isResourceChanged(url, oldResource) {
        this.getResource(url, this.compareResource(oldResource));
    }
    changeHandler(url) {
        let message = {
            "type": "ChangeDetected",
            "data": this.modules.get(url)
        };
        postMessage(message);
    }
    check() { 
        if ((this.isInitialized ) && this.fetchers.size === 0) {
            for(let [url, cache] of this.resources.entries()) {
                this.isResourceChanged(url, cache);
                if (this.changeDetected) break;
                else continue;
            }
        }
        this.checker = setTimeout((this.check).bind(this), 1000);
    }
    report(){
        let message = {
            checker: this.checker,
            modules: Array.from(this.modules),
            fetchers: Array.from(this.fetchers),
            generator: this.generator,
            resources: Array.from(this.resources),
            isInitialized: this.isInitialized,
            isInitializing: this.isInitializing,
            changeDetected: this.changeDetected
        };
        postMessage(message);
    }
    static create(module) {
        return new HotModuleChecker(module);
    }
}
addEventListener('message', handleMessage);

var moduleChecker;

function handleMessage(message) {
    switch (message.data.type) {
        case "Report":
            moduleChecker.report();
            break;
        case "Initialize":
            moduleChecker = HotModuleChecker.create(JSON.parse(message.data.data));
            break;
        case "Reinitialize":
            moduleChecker.initialize(JSON.parse(message.data.data));
            break;
        case "StopChecking":
            clearTimeout(moduleChecker.checker);
            clearTimeout(moduleChecker.checker);
            clearTimeout(moduleChecker.generator);
            clearTimeout(moduleChecker.generator);
            break;
        default:
            break;
    }
}
`]);

const HotModuleChecker = window.URL.createObjectURL(blob);

class HotModuleReloader {
    constructor() {
        this.stylesReload = this.getStylesReloadPackages();
        this.pageReload = this.getPageReloadPackages('/app/');
        this.monitored = this.getMonitoredModules('/app/');
        this.directory = [...Array.from(this.stylesReload),
                          ...Array.from(this.pageReload),
                          ...Array.from(this.monitored)];
        this.checker = new Worker(HotModuleChecker);
        this.initializeWorker();
        this.checker.addEventListener('message', (this.handleMessage).bind(this));
    }
    handleMessage(message) {
        switch (message.data.type) {
            case "ChangeDetected":
                this.reload(message.data.data);
                break;
            default:
                console.log(message.data);
        }
    }
    getStylesReloadPackages() {
        let pageStyles = Array.from(document.querySelectorAll('link'))
                              .filter(link => link.rel = 'stylesheet' && link.href)
                              .map(link => [link.href, link.href]);
                              
        return new Map(pageStyles);
    }
    getPageReloadPackages(flag) {
        var pageScripts = Array.from(document.querySelectorAll('script'))
                               .filter(script => script.src && !script.src.includes('system.src.js'))
                               .map(script => [script.src, script.src]),
            pagePackages = [[document.location.href, document.location.href]];
                
        for(let url in System.packages) {
            if (url.includes(flag) && System.packages[url].main){
                pagePackages.push([url+'/'+System.packages[url].main, url+'/'+System.packages[url].main]);
            }
        }
        
        return new Map([...pageScripts, 
                        ...pagePackages]);
    }    
    getMonitoredModules(flag) {
        let moduleResources = [];
        
        for (let url in System.loads) {
            if (url.includes(flag)) {
                moduleResources.push([ url, url]);
                moduleResources = [...moduleResources, ...this.generateModuleResources(url)]
            }
        }
        
        return new Map(moduleResources);
    }
    generateModuleResources(url) {
        let cssName = url.replace(/\.([A-Za-z0-9_]*$)/, '.css'),
            htmName = url.replace(/\.([A-Za-z0-9_]*$)/, '.htm');
            
        return [[cssName, url],
                [htmName, url]];
    }    
    reload(url) {
        if (this.stylesReload.has(url)) {
            console.log(`Received pageStyles reload on: ${url}`);
            //this.reloadStyle(url);
        } else if (this.pageReload.has(url)) {
            console.log(`Received pageReload reload on: ${url}`);
            document.location.reload(true);
        } else if (this.monitored.has(url)){
            console.log(`Received systemJS reload on: ${url}`);
            System.reload(url);
        }
    }
    initializeWorker() {
        let message = {
            'type':'Initialize', 
            'data':JSON.stringify(this.directory)
        }
        this.postMessage(message);
        return this;
    }
    terminateWorker() {
        let message = {'type':'StopChecking'};
        this.postMessage(message);
        this.checker.terminate();
    }
    postMessage(message) {
        this.checker.postMessage(message);
    }
}

//export { HotModuleReloader }