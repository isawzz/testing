//#region work!
function parsePath(legs,prop, info) {
	let oInfo = info;
//	console.log('prop',prop)
	
	if (isString(prop))	prop = prop.slice(1);
	
	if (!isEmpty(legs[0])) {
		let len = legs.length-1;
		let lastLeg=legs[len];
		let restLegs=legs.slice(0,len);
		// console.log('________________');
		// console.log(legs);
		// console.log(restLegs);
		// console.log(lastLeg);

		for (const leg of restLegs) {
			if (oInfo[leg]) oInfo = oInfo[leg];
			else {
				console.log('cannot parse', leg, oInfo);
			}
		}
		if (!info.settings) info.settings={};
		let k=legs.join('_');
		info.settings[k]=[oInfo];
		info.settings[k].push(lastLeg);
		if (isString(prop)) info.settings[k].push(getObject(info.oid)[prop]);

	}
}



//#region FUNCTIONS
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


//#region helpers
function addAREA(id, o) {
	//if (id=='market_loc') console.log(o);
	if (AREAS[id]) {
		error('AREAS ' + id + ' exists already!!! ');
		error(o);
		return;
	}
	AREAS[id] = o;
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
function getObject(oid) { return POOLS.augData[oid]; }

function mergeIncludingPrototype(oid, o) {
	let merged = mergeDynSetNodes(o);
	merged.oid = oid;

	let t = merged.type;
	let info;
	if (t && PROTO[t]) {
		//console.log(PROTO[t])
		//console.log('merging w/ prototype',oid,merged);
		info = deepmerge(merged, jsCopy(PROTO[t]));
		// console.log('base', merged);
		// console.log('proto', PROTO[t]);
		//console.log('result', oid, info);
		//console.log('____________________')
	} else info = merged;

	return info;
}
function getDynamicBaseArea(info, oid) {
	let loc = info.loc;
	let areaName = getDynId(info.loc, oid);
	if (!AREAS[areaName]) {

		let uiNode = AREAS[loc];
		//console.log('loc', loc, 'uiNode', uiNode);
		let group = info.pool;
		prepParentForChildren(loc, group.length);
		for (const oid of group) {
			//TODO!!! simplification: mach einfach panels!
			//TODO!!! simpl: keine params... werden verwendet!
			addPanel(loc, oid);
			//console.log('added panel for',loc,oid)

		}
	}
	return areaName;
}
function mergeDynSetNodes(o) {
	let merged = {};
	//console.log('------------',o.RSG);
	let interpool = null;
	for (const nodeId in o.RSG) {
		let node = jsCopy(dynSpec[nodeId]);
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
function getDynId(loc, oid) { return loc + '@' + oid; }
function prepParentForChildren(loc, numChildren) {
	let parent = mBy(loc);
	clearElement(loc);
	parent.style.display = 'inline-grid';
	let uiNode = AREAS[loc];
	if (!uiNode.type) uiNode.type = 'panel';
	if (!uiNode.params) uiNode.params = { split: 'equal' };
	uiNode.params.num = numChildren;

	if (!uiNode.panels) uiNode.panels = [];
}
function addPanel(areaName, oid) {
	//mach so einen spec node
	let id = getDynId(areaName, oid);

	let color = randomColor();
	let parent = mBy(areaName);
	let ui = mDiv100(parent); ui.id = id; mColor(ui, color);
	let n = { type: 'panel', id: id, color: color, ui: ui };
	AREAS[areaName].panels.push(n);
	//console.log('.....in addPanel')
	addAREA(id, n);
}
function correctFuncName(specType) {
	switch (specType) {
		case 'list': specType = 'liste'; break;
		case 'dict': specType = 'dicti'; break;
		case undefined: specType = 'panel'; break;
	}
	return specType;
}
function getParams(areaName, oSpec, oid) {

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
	let parent = mBy(areaName);
	if (oSpec.id) {
		parent.id = id;
		//console.log('adding',id)
		addAREA(id, oSpec);
		// if (oSpec.id && oid) addDynamicName(oSpec.id,id);
		parent.innerHTML = id;  //title for test reasons!
	}
	if (bg) { mColor(parent, bg, fg); }

	return [num, or, split, bg, fg, id, panels, parent];
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
function setTableSize(areaName, w, h, unit = 'px') {
	//console.log(w,h);
	let d = mBy(areaName);
	mStyle(d, { 'min-width': w, 'min-height': h }, unit);
	// setCSSVariable('--hTable', h + unit);
	// setCSSVariable('--wTable', w + unit);
	//mById('tableTop').style.setProperty('width', w + unit);
}








