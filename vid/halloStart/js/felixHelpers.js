

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
function correctFuncName(specType) {
	switch (specType) {
		case 'list': specType = 'liste'; break;
		case 'dict': specType = 'dicti'; break;
		case undefined: specType = 'panel'; break;
	}
	return specType;
}
function addIdToAreaDict(ggg, id, o) {
	//if (id=='market_loc') console.log(o);
	if (ggg.areas[id]) {
		error('ggg.areas ' + id + ' exists already!!! ');
		error(o);
		return;
	}
	ggg.areas[id] = o;
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
	//eg., parent: all_opps
	let parent = halloFindDiv(ggg, loc);
	//console.log('aaaaa ', loc, parent.id)

	//how to hold size of this element?
	//mMinBounds(parent);
	clearElement(parent);
	//parent.innerHTML='wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww'

	//parent.style.display = 'inline-grid';

	let uiNode = ggg.areas[loc];

	if (nundef(uiNode.ui) || uiNode.ui != parent) error('HALLOOOOOOOO');
	//console.log(uiNode.id,uiNode.type,uiNode.params);
	// if (!uiNode.type) uiNode.type = 'panel';
	if (!uiNode.params) uiNode.params = { split: 'equal' };
	uiNode.params.num = numChildren;

	if (!uiNode.panels) uiNode.panels = [];
}

function addPanelForOid(ggg, areaName, oid) {
	//mach so einen spec node und base panel fuer oid
	let parent = halloFindDiv(ggg, areaName); 
	let ui = mDiv100(parent);
	let color = randomColor();mColor(ui, color);

	let oSpec = { type: 'panel', id: areaName, color: color, ui: ui };
	let id = setId(ggg, ui, oSpec, oid);
	ggg.areas[areaName].panels.push(oSpec);

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









