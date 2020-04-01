const DEF_ORIENTATION = 'rows';
const DEF_SPLIT = 0.5;

function staticArea(areaName, oSpec) {
	//console.log('_______ staticArea', areaName,oSpec)
	func = correctFuncName(oSpec.type);
	oSpec.ui = window[func](areaName, oSpec);
}
function dynamicArea(areaName,oSpec,oid,o){
	func = correctFuncName(oSpec.type);
	//console.log(func,areaName);
	oSpec.ui = window[func](areaName, oSpec, oid, o);
}

function panel(areaName, oSpec, oid, o) {

	// console.log('________ instantiating panel', areaName,oid,o)
	// showFullObject(oSpec)
	let [num,or,split,bg,fg,id,panels,parent]=getParams(areaName,oSpec,oid);
	//console.log(num, or, split, bg, fg, id);

	if (num>0){
		parent.style.display = 'grid';
		clearElement(parent);

		if (or == 'rows') {
			//split=1;
			console.log('====',split*100)
			parent.style.gridTemplateColumns = `${split*100}% auto`;
			// parent.style.gridTemplateColumns = 'auto auto';// `${split*100}% ${100 - split*100}%`;
			// parent.style.gridTemplateColumns = `${split*100}% ${100 - split*100}%`;
			//parent.style.gridTemplateColumns = `${split}fr ${1 - split}fr`;
		}

		for (let i = 0; i < num; i++) {
			let d = mDiv100(parent);
			d.id = getUID();
			if (panels.length > i) {
				if (oid) dynamicArea(d.id,panels[i],oid,o); else staticArea(d.id, panels[i]);
			}
		}
		// if (or == 'rows') {
		// 	//split=1;
		// 	console.log('====',split*100);
		// 	parent.style.gridTemplateColumns = `${split*100}% 1fr`;
		// 	// parent.style.gridTemplateColumns = '60% auto';
		// 	// parent.style.gridTemplateColumns = `${split*100}% auto`;
		// 	// parent.style.gridTemplateColumns = 'auto auto';// `${split*100}% ${100 - split*100}%`;
		// 	// parent.style.gridTemplateColumns = `${split*100}% ${100 - split*100}%`;
		// 	//parent.style.gridTemplateColumns = `${split}fr ${1 - split}fr`;
		// }
	}
	return parent;
}
function liste(areaName, oSpec, oid, o) {

	//console.log('________ liste', areaName, o);
	let [num,or,split,bg,fg,id,panels,parent]=getParams(areaName,oSpec,oid);
	parent.style.display = 'inline-grid';
	return parent;
}
function dicti(areaName, oSpec, oid, o) {

	//console.log('________ dict', areaName, oSpec);
	let [num,or,split,bg,fg,id,panels,parent]=getParams(areaName,oSpec,oid);
	parent.style.display = 'inline-grid';
	return parent;
}



