// var FE = (function () {
//var panels=null; //tree structure for static panels
var PROTO = {};
var POOLS = {};
var UI = {}; //dict of rsg uis

function createRoot(areaName, spec) {

	let ggg = {};
	UI[areaName] = ggg;
	ggg.spec = spec;
	ggg.id = areaName;

	//console.log('___ root');
	setTableSize(ggg, areaName, 400, 300);
	//panels={};
	// panels.data=areaName;
	// panels.children=[];
	ggg.root = jsCopy(ggg.spec.staticSpec.root);
	//ggg.root.id='root'
	ggg.areas = {};
	staticArea(ggg, areaName, ggg.root);
	//console.log('halooooooooooo')
	addAREA(ggg, 'root', ggg.root);

	return ggg;
}
function parseStaticSpec(ggg) {
	for (const k in ggg.spec.staticSpec) {
		if (k == 'root') continue;
		let oSpec = jsCopy(SPEC.staticSpec[k]);

		if (oSpec.loc) {
			let loc = oSpec.loc;
			if (!oSpec.id) oSpec.id = k;
			staticArea(ggg, loc, oSpec);
			let oEinhaengen = ggg.areas[loc];
			//console.log('oEinhaengen',oEinhaengen)
			if (nundef(oEinhaengen.panels)) oEinhaengen.panels = [];
			oEinhaengen.panels.push(oSpec);
		} else {
			PROTO[k] = oSpec;
		}
	}
}
function geht(sp) {

	POOLS.augData = makeDefaultPool(sData);// jsCopy(serverData);

	//annotate does NOT create anything!
	annotate(sp); //connects nodes to spec and dyn spec nodes to each object

	//instantiate sp nodes
	let pool = POOLS.augData;
	//console.log(pool)

	// 2. pass: add dynamic areas
	for (const oid in pool) {

		let o = pool[oid];

		if (nundef(o.RSG)) continue;

		let info = mergeIncludingPrototype(sp, oid, o);
		//console.log(info);
		o.__info = info;
	}


}
function parseDynamicSpec(ggg) {
	let sp = jsCopy(ggg.spec.dynamicSpec);
	geht(sp);
	let pool = POOLS.augData;

	// console.log('halooooooooooooo',pool)

	// 2. pass: add dynamic areas
	for (const oid in pool) {

		let o = pool[oid];
		let info = o.__info;

		//continue;
		if (nundef(info) || nundef(info.loc)) {
			//console.log('no loc found for', oid)
			continue;
		}
		//console.log(o,info);

		//each object gets a base panel for info content
		let loc = info.loc;
		let areaName = getDynId(info.loc, oid);

		// console.log('------- areaName',areaName)
		if (!ggg.areas[areaName]) {

			let uiNode = ggg.areas[loc];
			// console.log('..........loc', loc, 'uiNode', uiNode);
			let group = info.pool;
			prepParentForChildren(ggg, loc, group.length);
			for (const oid of group) {
				//TODO!!! simplification: mach einfach panels!
				//TODO!!! simpl: keine params... werden verwendet!
				addPanel(ggg, loc, oid);
				//console.log('added panel for',loc,oid)

			}
		}
	}

	for (const oid in pool) {
		let o = pool[oid];
		let info = o.__info;
		if (nundef(info) || nundef(info.loc)) continue;
		let loc = info.loc;
		let areaName = getDynId(info.loc, oid);
		// console.log(areaName)

		dynamicArea(ggg, areaName, info, oid, o);
		let propName = info.type == 'panel' ? 'panels'
			: info.type == 'list' ? 'elm' : 'data';
		let oEinhaengen = ggg.areas[areaName];
		if (nundef(oEinhaengen[propName])) oEinhaengen[propName] = [];
		oEinhaengen[propName].push(info);

		// console.log(oid,info);

		//populate:
		for (const k in info) {
			let parts = k.split('.');
			let s = parts[0];
			let n = parts.length;
			//console.log(k,n);
			if (n == 1 && k != 'elm' && k != 'data') continue;
			//console.log('this is a path:',k);
			let leaf = parsePath(parts, info[k], info);
			//if (isPath(k))
		}
		//console.log(oid, info);

		continue;

	}

}


//#region helpers
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
function getObject(oid) { return POOLS.augData[oid]; }

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
function getDynId(loc, oid) { return loc + '@' + oid; }
function prepParentForChildren(ggg, loc, numChildren) {

	let parent = halloFindParent(ggg, loc);//areaName);
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
	let parent = halloFindParent(ggg,areaName); // mBy(areaName);
	//console.log('addP - - - ',areaName,parent.id)

	let ui = mDiv100(parent); 
	ui.id = qualId(ggg,id); 
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


	// return {
	// 	root: root,
	// 	parseStaticSpec: parseStaticSpec,
	// 	parseDynamicSpec: parseDynamicSpec
	// };
// })();






