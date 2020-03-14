function calcNumRowsFitting(dParent,hGame) {
	let sz=getTextSize('hallo du',dParent);
	return hGame/sz.h;
}

function getTextSize(s='hallo',dParent) {
	var newDiv = document.createElement("div");
	newDiv.innerHTML = s;
	// hide the meassured (cloned) element
	newDiv.style.cssText = "position:fixed; top:-9999px; opacity:0;"
	// add the clone to the DOM 
	if (isdef(dParent)){
		if (isString(dParent)) dParent = document.getElementById(dParent);
		dParent.appendChild(newDiv); 
	} else	document.body.appendChild(newDiv);
	// meassure it
	height = newDiv.clientHeight;
	width = newDiv.clientWidth;
	// cleaup 
	newDiv.parentNode.removeChild(newDiv)
	return {w:width,h:height};
}



var bodyZoom = 1.0;
var browserZoom = Math.round(window.devicePixelRatio * 100);
function initZoom() {
	let bz = localStorage.getItem('bodyZoom');
	//console.log('bodyZoom retrieved', bz);
	if (bz) bz = Math.max(Number(bz), .2);
	else bz = 1.0;
	zoom(bz);
}
function zoom_on_resize(referenceDivId) {
	if (!window.onresize) {
		window.onresize = () => {
			//console.log('resize!');
			let newBrowserZoom = Math.round(window.devicePixelRatio * 100);
			//let newBrowserZoom=window.outerWidth / window.document.documentElement.clientWidth; //doesn't work!!!
			////console.log('new zoom:',newBrowserZoom, 'browserZoom',browserZoom);
			if (isdef(browserZoom) && browserZoom != newBrowserZoom) { browserZoom = newBrowserZoom; return; }
			console.log('RESIZE WINDOW!!!!!!!!!!!!');
			//only if browser has not been zoomed!
			if (nundef(browserZoom) || browserZoom == newBrowserZoom) {
				let wNeeded = document.getElementById(referenceDivId).getBoundingClientRect().width;
				let wNeededReally = wNeeded / bodyZoom;
				let wHave = window.innerWidth;
				let zn = wHave / wNeeded;
				let znr = wHave / wNeededReally;
				console.log('wNeeded', wNeeded, 'wNeededReally', wNeededReally, 'wHave', wHave, 'zn', zn, 'znr', znr, 'bodyZoom', bodyZoom)
				//do not zoom if reasonably close!
				if (Math.abs(znr - bodyZoom) > .01) zoom(znr); //wHave/wNeeded);
				//onClickAreaSizes();
			}
			browserZoom = newBrowserZoom;
		};
	}
}
function zoom(factor) {
	bodyZoom = factor;
	if (Math.abs(bodyZoom - 1) < .2) bodyZoom = 1;
	document.body.style.transformOrigin = '0% 0%';
	document.body.style.transform = 'scale(' + bodyZoom + ')'; //.5)'; //+(percent/100)+")";
	localStorage.setItem('bodyZoom', bodyZoom);
	//console.log('stored new bodyZoom', bodyZoom)
	////console.log('body scaled to',percent+'%')
}

function fireWheel(node) {
	if (document.createEvent) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent('wheel', true, false);
		console.log('fireClick: createEvent and node.dispatchEvent exist!!!', node)
		node.dispatchEvent(evt);
	} else if (document.createEventObject) {
		console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		console.log('fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}


function fillActions(dname, n) {
	let d = document.getElementById(dname);
	d.innerHTML = ''; d.style.width = 'auto';
	for (let i = 0; i < n; i++) {
		let d1 = document.createElement('div');
		d1.innerHTML = 'hallo' + i;
		d.appendChild(d1);

		// let b = getBounds(d1);
		// let bParent = getBounds(d);
		// let wNeeded = b.x + b.width - 8;
		// //console.log('have', bParent.width, 'need', wNeeded)
		// if (bParent.width < wNeeded) {
		// 	//console.log('resizing', d)
		// 	d.style.setProperty('min-width', wNeeded + 24 + 'px');
		// }

	}
}
function zooom(f) {
	SCALE *= f;
	// let domel=mById('root');
	let domel = document.body;
	domel.style.transform = 'scale(' + SCALE + ')';
	domel.style.transformOrigin = '0% 0%';
}








