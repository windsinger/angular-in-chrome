class HotModuleChecker {
    constructor(directory) {
        postMessage({'type':'Initializing'});
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
    reinitialize(directory){
        clearTimeout(this.checker);
        clearTimeout(this.generator);
        
        this.checker = null;
        this.modules = new Map(directory);
        this.fetchers = new Set();
        this.generator = null;
        this.resources = new Map();Sy
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
            clearTimeout(this.generator);
            this.isInitialized = true;
            this.isInitializing = false;
            postMessage({'type':'Initialized'});
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
            //console.log('this.changeDetected: {this.changeDetected}');
            this.resources.set(url, newResource);
            this.fetchers.delete(fetchersUUID);
            
            if (oldResource !== newResource) {
                this.changeHandler(url)
            }
        };
    }
    isResourceChanged(url, oldResource) {
        this.getResource(url, this.compareResource(oldResource));
    }
    changeHandler(url) {
        clearTimeout(this.checker);
        this.changeDetected = true;
        this.changeMessage(url);
    }
    changeMessage(url) {
        let message = {
            "type": "ChangeDetected",
            "data": this.modules.get(url)
        };
        postMessage(message);
    }
    check() {        
        if (this.isInitialized && this.fetchers.size === 0) {
            this.isInitialized = false;
            for(let [url, cache] of this.resources.entries()) {
                this.isResourceChanged(url, cache);
                if (this.changeDetected) break;
                else continue;
            }
        } else if (this.fetchers.size === 0) {
            postMessage({'type': 'Finished'});
            clearTimeout(this.checker);
            return;
        }
        this.checker = setTimeout((this.check).bind(this), 1000);
    }
    static create(module) {
        return new HotModuleChecker(module);
    }
}
addEventListener('message', handleMessage);

var moduleChecker;

function handleMessage(message) {
    switch (message.data.type) {
        case "Initialize":
            postMessage("Message has been received");
            moduleChecker = HotModuleChecker.create(JSON.parse(message.data.data));
            break;
        case "Reinitialize":
            postMessage("Message has been received");
            moduleChecker = HotModuleChecker.reinitialize(JSON.parse(message.data.data));
            break;
        case "StartChecking":
            postMessage("StartChecking been received");
            moduleChecker.check();
            break;
        case "StopChecking":
            clearTimeout(moduleChecker.checker);
            clearTimeout(moduleChecker.generator);
            break;
        default:
            postMessage("I don't know what you are talking about.");
            break;
    }
}

//export default HotModuleChecker