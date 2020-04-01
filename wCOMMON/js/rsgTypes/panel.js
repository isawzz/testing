const DEF_ORIENTATION = 'rows';
const DEF_SPLIT = 0.5;


function staticArea(ggg, areaName, oSpec) {
	//console.log('_______ staticArea',ggg, areaName,oSpec)
	func = correctFuncName(oSpec.type);
	oSpec.ui = window[func](ggg, areaName, oSpec);
}
function dynamicArea(ggg, areaName, oSpec, oid, o) {
	func = correctFuncName(oSpec.type);
	//console.log(func,areaName);
	oSpec.ui = window[func](ggg, areaName, oSpec, oid, o);
}

function panel(ggg, areaName, oSpec, oid, o) {

	//console.log('________ instantiating panel', areaName,oid,o)
	// showFullObject(oSpec)
	let [num, or, split, bg, fg, id, panels, parent] = getParams(ggg, areaName, oSpec, oid);
	//console.log(num, or, split, bg, fg, id);

	if (num > 0) {
		parent.style.display = 'grid';
		clearElement(parent);

		if (or == 'rows') {
			//split=1;
			//console.log('====',split*100)
			parent.style.gridTemplateColumns = `${split * 100}% auto`;
			// 	parent.style.gridTemplateColumns = `${split*100}% 1fr`;
			// 	// parent.style.gridTemplateColumns = '60% auto';
			// parent.style.gridTemplateColumns = 'auto auto';// `${split*100}% ${100 - split*100}%`;
			// parent.style.gridTemplateColumns = `${split*100}% ${100 - split*100}%`;
			//parent.style.gridTemplateColumns = `${split}fr ${1 - split}fr`;
		}

		for (let i = 0; i < num; i++) {
			let d = mDiv100(parent);
			d.id = getUID();
			if (panels.length > i) {
				if (oid) dynamicArea(ggg, d.id, panels[i], oid, o); else staticArea(ggg, d.id, panels[i]);
			}
		}
	}
	return parent;
}
function liste(ggg, areaName, oSpec, oid, o) {

	//console.log('________ liste', areaName, o);
	let [num, or, split, bg, fg, id, panels, parent] = getParams(ggg, areaName, oSpec, oid);
	parent.style.display = 'flex';
	if (or == 'rows') {
		//split=1;
		//console.log('====',split*100)
		parent.style.gridTemplateColumns = `${split * 100}% auto`;
		// 	parent.style.gridTemplateColumns = `${split*100}% 1fr`;
		// 	// parent.style.gridTemplateColumns = '60% auto';
		// parent.style.gridTemplateColumns = 'auto auto';// `${split*100}% ${100 - split*100}%`;
		// parent.style.gridTemplateColumns = `${split*100}% ${100 - split*100}%`;
		//parent.style.gridTemplateColumns = `${split}fr ${1 - split}fr`;
	}
	return parent;
}
function dicti(ggg, areaName, oSpec, oid, o) {

	//console.log('________ dict', areaName, oSpec);
	let [num, or, split, bg, fg, id, panels, parent] = getParams(ggg, areaName, oSpec, oid);
	parent.style.display = 'inline-grid';
	return parent;
}

function qualId(ggg, id) { return id + '_' + ggg.id; }
function getParams(ggg, areaName, oSpec, oid) {

	let params = oSpec.params ? oSpec.params : {}; //all defaults here!!!!!
	let panels = oSpec.panels ? oSpec.panels : [];

	let num = panels.length;
	let or = params.orientation ? params.orientation == 'h' ? 'rows'
		: 'columns' : DEF_ORIENTATION;
	let split = params.split ? params.split : DEF_SPLIT;
	let bg = oSpec.color ? oSpec.color : randomColor();
	let fg = bg ? colorIdealText(bg) : null;
	let id = oSpec.id ? oSpec.id : areaName;
	if (oid) { id = getDynId(id, oid); }
	//id=qualId(ggg,id);
	//console.log(areaName);
	//let parent = mBy(areaName);
	let parent=halloFindParent(ggg,areaName);
	//console.log('panel 91.....', areaName, parent.id)

	if (oSpec.id) {
		parent.id = qualId(ggg, id);
		//console.log('adding',id)
		addAREA(ggg, id, oSpec);
		// if (oSpec.id && oid) addDynamicName(oSpec.id,id);
		parent.innerHTML = id;  //title for test reasons!
	}
	if (bg) { mColor(parent, bg, fg); }

	return [num, or, split, bg, fg, id, panels, parent];
}

function halloFindParent(ggg,areaName){
	let a = ggg.areas[areaName];
	if (nundef(a)) {
		a = mBy(areaName);
		if (nundef(a)) a = mBy(qualId(ggg, areaName));
	}
	else a = a.ui;
	let parent = a;
	return parent;
}

//#region static helpers
function correctFuncName(specType) {
	switch (specType) {
		case 'list': specType = 'liste'; break;
		case 'dict': specType = 'dicti'; break;
		case undefined: specType = 'panel'; break;
	}
	return specType;
}

