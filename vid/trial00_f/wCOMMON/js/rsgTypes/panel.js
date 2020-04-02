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
	if (num == 0) return parent;

	clearElement(parent);
	let bounds=getBounds(parent);
	let wParent=bounds.w;
	let hParent=bounds.h;
	let perc=nundef(split)||split=='equal'?num>0?100/num : 100:split*100;
	let wPanel=or=='h'?perc+'%':'100%';
	let hPanel=or=='v'?perc+'%':'100%';

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

