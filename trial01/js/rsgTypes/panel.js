
function staticArea(ggg, areaName, oSpec) {
	trace(areaName, oSpec)
	func = correctFuncName(oSpec.type);
	oSpec.ui = window[func](ggg, areaName, oSpec);
}
function dynamicArea(ggg, areaName, oSpec, oid, o) {
	func = correctFuncName(oSpec.type);
	trace(areaName, oid, 'func', func)
	oSpec.ui = window[func](ggg, areaName, oSpec, oid, o);
}

function panel(ggg, areaName, oSpec, oid, o) {

	let params = oSpec.params ? oSpec.params : {}; //all defaults here!!!!!
	let panels = oSpec.panels ? oSpec.panels : [];

	let num = panels.length;
	let or = params.orientation ? params.orientation : DEF_ORIENTATION;
	let split = params.split ? params.split : DEF_SPLIT;

	let parent = halloFindDiv(ggg, areaName);

	let bg = oSpec.color ? oSpec.color : SET_RANDOM_COLORS ? randomColor() : null;
	if (bg) { mColor(parent, bg, colorIdealText(bg)); }

	if (oSpec.id) {
		let id = oid ? getDynId(oSpec.id, oid) : oSpec.id;
		parent.id = qualId(ggg, id);
		addIdToAreaDict(ggg, id, oSpec);
		if (SET_AREA_IDS) parent.innerHTML = id;  //title for test reasons!
	}

	// trace(num, or, split, bg, fg, id, parent.id, oid, o);
	if (num == 0) return parent;

	clearElement(parent);
	let bounds = getBounds(parent);
	let wParent = bounds.w;
	let hParent = bounds.h;
	let perc = nundef(split) || split == 'equal' ? num > 0 ? 100 / num : 100 : split * 100;
	let wPanel = or == 'h' ? perc + '%' : '100%';
	let hPanel = or == 'v' ? perc + '%' : '100%';

	parent.style.display = 'inline-grid';
	// if (or == 'rows') { parent.style.gridTemplateColumns = `minmax(${split * 100}%, auto) auto`; }
	//#region no code
	//split=1;
	//console.log('====',split*100)
	split *= 100;
	parent.style.gridTemplateColumns = `minmax(${split}%, auto) auto`; //`minmax(${split * 100}% auto`;
	// parent.style.gridTemplateColumns = 'minmax(60%, auto) auto'; //`minmax(${split * 100}% auto`;
	// 	parent.style.gridTemplateColumns = `${split*100}% 1fr`;
	// 	// parent.style.gridTemplateColumns = '60% auto';
	// parent.style.gridTemplateColumns = 'auto auto';// `${split*100}% ${100 - split*100}%`;
	// parent.style.gridTemplateColumns = `${split*100}% ${100 - split*100}%`;
	//parent.style.gridTemplateColumns = `${split}fr ${1 - split}fr`;
	//#endregion

	for (let i = 0; i < num; i++) {
		let d = mDiv(parent);
		// mStyle(d,{'min-width':wPanel,'min-height':hPanel,position:'relative',display:'inline-box'});
		d.id = getUID();
		if (panels.length > i) {
			if (oid) dynamicArea(ggg, d.id, panels[i], oid, o); else staticArea(ggg, d.id, panels[i]);
		}
	}
	return parent;
}
function liste(ggg, areaName, oSpec, oid, o) {

	//console.log('________ liste', areaName, o);
	let [num, or, split, bg, fg, id, panels, parent] = getParams(ggg, areaName, oSpec, oid);
	// parent.style.display = 'flex';
	// parent.classList.add('liste')
	// if (or == 'rows') {
	// 	//split=1;
	// 	//console.log('====',split*100)
	// 	parent.style.gridTemplateColumns = `${split * 100}% auto`;
	// 	// 	parent.style.gridTemplateColumns = `${split*100}% 1fr`;
	// 	// 	// parent.style.gridTemplateColumns = '60% auto';
	// 	// parent.style.gridTemplateColumns = 'auto auto';// `${split*100}% ${100 - split*100}%`;
	// 	// parent.style.gridTemplateColumns = `${split*100}% ${100 - split*100}%`;
	// 	//parent.style.gridTemplateColumns = `${split}fr ${1 - split}fr`;
	// }
	return parent;
}
function dicti(ggg, areaName, oSpec, oid, o) {

	//console.log('________ dict', areaName, oSpec);
	let [num, or, split, bg, fg, id, panels, parent] = getParams(ggg, areaName, oSpec, oid);
	//parent.style.display = 'inline-grid';
	return parent;
}

