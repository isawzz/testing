
function fillActions(n) {
	let d = document.getElementById('left');
	for (let i = 0; i < n; i++) {
		let d1 = document.createElement('div');
		d1.innerHTML = 'hallo' + i;
		d.appendChild(d1);

		let b = getBounds(d1);
		let bParent = getBounds(d);
		let wNeeded = b.x + b.width - 8;
		//console.log('have', bParent.width, 'need', wNeeded)
		if (bParent.width < wNeeded) {
			//console.log('resizing', d)
			d.style.setProperty('min-width', wNeeded + 24 + 'px');
		}

	}
}
function getBounds(el) { return el.getBoundingClientRect(); }
function zooom(f) {
	SCALE *= f;
	// let domel=mById('root');
	let domel = document.body;
	domel.style.transform = 'scale(' + SCALE + ')';
	domel.style.transformOrigin = '0% 0%';
}








