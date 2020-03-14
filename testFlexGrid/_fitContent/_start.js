var SCALE = 1.0;

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

document.getElementById('game').innerHTML = 'HALOQWWWWwwwWW';//style.minWidth='400px';
document.getElementById('log').innerHTML = 'HALOQWWWWWW';//style.minWidth='400px';
fillActions2('actions2', 25, 100);
//initZoom();
//zoom_on_resize('rsg');

//let b=getBounds('actions2');
//console.log(b)






//#region vorher
window.addEventListener("wheel", ev => {
	if (!ev.altKey) return;
	ev.preventDefault(); if (ev.deltaY > 0) { zooom(.9); } else if (ev.deltaY < 0) zooom(1.1);
}, { passive: false }
);

//fillActions(12);

