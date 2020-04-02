
//#region static helpers
function getDynId(loc, oid) { return loc + '@' + oid; }
function getObject(oid) { return POOLS.augData[oid]; }
function getDefaultPool() { return POOLS.augData; }
function halloFindDiv(ggg, areaName) {
	let a = ggg.areas[areaName];
	if (nundef(a)) {
		a = mBy(areaName);
		if (nundef(a)) a = mBy(qualId(ggg, areaName));
	}
	else a = a.ui;
	let parent = a;
	return parent;
}
function qualId(ggg, id) { return id + '_' + ggg.id; }


//#region misc helpers: parse dynamic spec
function getParams(ggg, areaName, oSpec, oid) {

	let params = oSpec.params ? oSpec.params : {}; //all defaults here!!!!!
	let panels = oSpec.panels ? oSpec.panels : [];

	let num = panels.length;
	let or = params.orientation ? params.orientation:'h';// == 'h' ? 'rows' : 'columns' : DEF_ORIENTATION;
	//let or = params.orientation ? params.orientation == 'h' ? 'rows' : 'columns' : DEF_ORIENTATION;
	let split = params.split ? params.split : DEF_SPLIT;
	let bg = oSpec.color ? oSpec.color : randomColor();
	let fg = bg ? colorIdealText(bg) : null;
	let id = oSpec.id ? oSpec.id : areaName;
	if (oid) { id = getDynId(id, oid); }
	//id=qualId(ggg,id);
	//console.log(areaName);
	//let parent = mBy(areaName);
	let parent = halloFindDiv(ggg, areaName);
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
function correctFuncName(specType) {
	switch (specType) {
		case 'list': specType = 'liste'; break;
		case 'dict': specType = 'dicti'; break;
		case undefined: specType = 'panel'; break;
	}
	return specType;
}
function addAREA(ggg, id, o) {
	//if (id=='market_loc') console.log(o);
	if (ggg.areas[id]) {
		error('ggg.areas ' + id + ' exists already!!! ');
		error(o);
		return;
	}
	ggg.areas[id] = o;
}
function annotate(sp) {
	//test	let x=makePool(sp.all_viz_cards);	return;

	for (const k in sp) {
		//console.log(k, sp[k]);

		let node = sp[k];
		node.pool = [];

		//determine source here!
		let pool = makePool(node);

		for (const oid in pool) {

			let o = pool[oid];

			if (!evalCond(o, node)) continue;

			//console.log('passed', oid);
			//mach ein p_elm
			if (nundef(o.RSG)) o.RSG = {};
			let rsg = o.RSG;
			rsg[k] = true;
			node.pool.push(oid);
			//let rsg = o.RSG;
			//let newRSG = deepmerge(rsg, node);
			//o.RSG = newRSG;
			//if (startsWith(oid,'P')) //console.log('???',o.RSG);


		}
	}



}
function mergeIncludingPrototype(sp, oid, o) {
	let merged = mergeDynSetNodes(sp, o);
	merged.oid = oid;

	let t = merged.type;
	let info;
	if (t && PROTO[t]) {
		info = deepmerge(merged, jsCopy(PROTO[t]));
		// console.log('base', merged);
		// console.log('proto', PROTO[t]);
		//console.log('result', oid, info);
		//console.log('____________________')
	} else info = merged;

	return info;
}
function mergeDynSetNodes(sp, o) {
	let merged = {};
	//console.log('------------',o.RSG);
	let interpool = null;
	for (const nodeId in o.RSG) {
		let node = jsCopy(sp[nodeId]);
		let pool = node.pool;
		if (pool) {
			if (!interpool) interpool = pool;
			else interpool = intersection(interpool, pool);
		}
		//console.log('node',node)
		merged = deepmerge(merged, node);
	}
	merged.pool = interpool;
	//console.log('pool:',interpool)
	return merged;
}
function prepParentForChildren(ggg, loc, numChildren) {

	let parent = halloFindDiv(ggg, loc);//areaName);
	//console.log('aaaaa ', loc, parent.id)
	// let parent = mBy(loc);
	clearElement(parent);
	parent.style.display = 'inline-grid';
	let uiNode = ggg.areas[loc];
	if (!uiNode.type) uiNode.type = 'panel';
	if (!uiNode.params) uiNode.params = { split: 'equal' };
	uiNode.params.num = numChildren;

	if (!uiNode.panels) uiNode.panels = [];
}
function addPanel(ggg, areaName, oid) {
	//mach so einen spec node
	let id = getDynId(areaName, oid);

	let color = randomColor();
	let parent = halloFindDiv(ggg, areaName); // mBy(areaName);
	//console.log('addP - - - ',areaName,parent.id)

	let ui = mDiv100(parent);
	ui.id = qualId(ggg, id);
	mColor(ui, color);

	let n = { type: 'panel', id: id, color: color, ui: ui };

	ggg.areas[areaName].panels.push(n);

	addAREA(ggg, id, n);
}
function makeDefaultPool(fromData) {
	let data = jsCopy(fromData.table);
	for (const k in fromData.players) {
		data[k] = jsCopy(fromData.players[k]);
	}
	return data;

}
function makePool(node) {
	let kpool = node._source ? node._source : 'augData';
	//console.log(kpool);
	if (nundef(POOLS[kpool])) {
		//_source has not been made!
		let pool = POOLS.augData;
		POOLS[kpool] = {};
		let node1 = SPEC.dynamicSpec[kpool];
		//console.log(node1);
		for (const oid in pool) {
			let o = pool[oid];
			//console.log('checking',oid)
			if (!evalCond(o, node1)) continue;
			//console.log('passed', oid);
			POOLS[kpool][oid] = o;
		}
	}
	return POOLS[kpool];
}
function setTableSize(ggg, areaName, w, h, unit = 'px') {
	//console.log(w,h);
	let d = mBy(areaName);
	mStyle(d, { 'min-width': w, 'min-height': h }, unit);
	// setCSSVariable('--hTable', h + unit);
	// setCSSVariable('--wTable', w + unit);
	//mById('tableTop').style.setProperty('width', w + unit);
}


//#region parse composite path LHS and RHS: parse dynamic spec
function parseIfContainer(k, info) {
	let infoProps = parseIfPath(k); //parses composite paths eg. panels.0.elm
	if (!infoProps) return null;

	//console.log('this is a path:',k);
	let container = getContainerAndKey(infoProps, info[k], info);
	//console.log(container);
	return container;

}
function parseIfPath(k) {
	let parts = k.split('.');
	let s = parts[0];
	let n = parts.length;
	//console.log(k,n);
	return (n > 1 || k == 'elm' || k == 'data') ? parts : null;
}
function getContainerAndKey(path, prop, info) {
	let oInfo = info;
	//	console.log('prop',prop)

	if (isString(prop)) prop = prop.slice(1);

	if (!isEmpty(path[0])) {
		let len = path.length - 1;
		let last1 = path[len];
		let rest = path.slice(0, len);
		// console.log('________________');
		// console.log(path);
		// console.log(rest);
		// console.log(last1);

		for (const s of rest) {
			if (oInfo[s]) oInfo = oInfo[s];
			else {
				console.log('cannot parse', s, oInfo);
				//return {o:oInfo,key:s};
			}
		}
		//oInfo points to container
		return { oInfo: oInfo, key: last1 };

	}
}
function getContent(path, o) {
	//console.log('getContent',path);
	if (isString(path) && path[0] == '.') {
		let props = path.split('.').slice(1);
		return lookup(o, props);

	}
	// if (!info.settings) info.settings = {};
	// let k = path.join('_');
	// info.settings[k] = [oInfo];
	// info.settings[k].push(last1);
	// if (isString(prop)) info.settings[k].push(getObject(info.oid)[prop]);
}


//#region FUNCTIONS fuer cond eval: parse dynamic spec
var FUNCTIONS = {
	instanceof: 'instanceOf',
	obj_type: (o, v) => o.obj_type == v,
	prop: (o, v) => isdef(o[v]),
	no_prop: (o, v) => nundef(o[v]),

}
function evalCond(o, node) {
	let qualifies = true;
	//console.log('o',o,'node',node)
	for (const fCond in node.cond) {
		let valOf = node.cond[fCond];
		// console.log(fCond,valOf)
		let func = FUNCTIONS[fCond];
		if (isString(func)) func = window[func];
		if (!func) { qualifies = false; break; }
		let val = func(o, node.cond[fCond]);
		//console.log('outcome',fCond,valOf,'is',val);
		if (!val) { qualifies = false; break; }
	}
	return qualifies;

}
function instanceOf(o, className) {
	let otype = o.obj_type;
	switch (className) {
		case '_player': return otype == 'GamePlayer' || otype == 'opponent'; break;
		case 'building': return otype == 'farm' || otype == 'estate' || otype == 'chateau' || otype == 'settlement' || otype == 'city' || otype == 'road'; break;
	}
}









