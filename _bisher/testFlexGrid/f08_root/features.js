class LazyCache {
	constructor(resetStorage = false) {
		this.caches = {};
		if (resetStorage) localStorage.clear(); //*** */
	}
	get(key) { return this.caches[key]; }

	asDict(key) { return this.caches[key].live; }

	getRandom(key) { let d = this.asDict(key); return chooseRandom(Object.values(d)); }
	getRandomKey(key) { return getRandomKey(this.asDict(key)); }
	getFirstKey(key, cond) { return firstCondDictKeys(this.asDict(key), cond); }

	invalidate(...keys) { for (const k of keys) if (this.caches[k]) this.caches[k].invalidate(); }

	async load(primKey, loaderFunc, reload = false, useLocal = true) {
		let cd = new CacheDict(primKey, { func: loaderFunc }, useLocal);
		this.caches[primKey] = cd;
		if (reload) await cd.reload(); else await cd.load();

		let handler = {
			get: function (target, name) { return target.live[name]; },
			set: function (target, name, val) { target.live[name] = val; return true; },
			has: function (target, name) { return name in target.live; },
			delete: function (target, name) { return delete target.live[name]; },
		};
		let proxy = new Proxy(cd, handler);
		return proxy;
	}
}

class CacheDict {
	constructor(primKey, { func = null } = {}, useLocal = true) {
		this.primKey = primKey; //this is key under which object is stored in localStorage/indexedDB
		this.func = func;
		this.live = null;
		this.useLocal = useLocal;
	}
	async load() {
		if (this.live) return this;
		return this._local() || await this._server();
	}
	invalidate() {
		//delete local copy and live
		localStorage.removeItem(this.primKey); //*** */
		this.live = null;
	}
	async reload() { this.invalidate(); return await this.load(); }

	_local() {
		if (!this.useLocal) return null;
		//console.log('....from local', this.primKey);
		let res = localStorage.getItem(this.primKey); //**** */
		if (res) this.live = JSON.parse(res);
		return res;
	}

	async _server() {
		//console.log('....from server', this.primKey);
		if (this.func) {
			this.live = await this.func();
			//console.log('after call: live',this.live)
			if (this.useLocal) localStorage.setItem(this.primKey, JSON.stringify(this.live)); //*** */
		}
		return this.func;
	}

}


//#region initZoomToFit, zoom_on_resize

var bodyZoom = 1.0;
var browserZoom = Math.round(window.devicePixelRatio * 100);
var countEvents = 0;
function initZoomToFit() { _zoomIfNeeded(arguments); }
function zoom_on_resize() {
	if (!window.onresize) {
		_zoomIfNeeded(arguments);

		window.onresize = () => {
			//console.log('onresize', countEvents); countEvents += 1;
			let newBrowserZoom = Math.round(window.devicePixelRatio * 100);
			if (isdef(browserZoom) && browserZoom != newBrowserZoom) { browserZoom = newBrowserZoom; return; }

			_zoomIfNeeded(arguments);

			if (nundef(browserZoom)) browserZoom = newBrowserZoom;
		};

	}
}
function _zoomIfNeeded(arr) {
	let wTotalNeeded = 0;
	for (const dName of arr) {
		let b = getBounds(dName);
		//console.log(dName,b);
		wTotalNeeded += b.width;
	}
	let wWindow = window.innerWidth;
	let newBodyZoom = (wWindow * bodyZoom / wTotalNeeded).toFixed(2);
	//console.log('w(win)', wWindow * bodyZoom, 'w(need)', wTotal, 'bz should be', newBodyZoom);
	if (newBodyZoom == bodyZoom || newBodyZoom > 1 && bodyZoom == 1.0) return;
	bodyZoom = Math.min(1.0, newBodyZoom);
	//console.log('new bodyZoom:', bodyZoom)
	document.body.style.transformOrigin = '0% 0%';
	document.body.style.transform = 'scale(' + bodyZoom + ')';

}

//#endregion


