

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
	clearElement(d);
	//d.innerHTML = ''; d.style.width = 'auto';
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
function fillActions2(dname, nActions, availHeight) {
	let nRowsFit = calcNumRowsFitting(dname,availHeight);//b.height);
	nRowsFit = Math.floor(nRowsFit);
	let colsNeeded = Math.ceil(nActions / nRowsFit);
	console.log('need', colsNeeded, 'to fit all actions')

	let d = document.getElementById(dname);
	d.style.gridTemplateColumns = 'auto '.repeat(colsNeeded);

	d.innerHTML = ''; 
	d.style.width = 'auto';
	for (let i = 0; i < nActions; i++) {
		let d1 = document.createElement('div');
		d1.innerHTML = 'hallo' + i;
		d.appendChild(d1);
	}
}






