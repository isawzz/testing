var PROTO = {};
var POOLS = {};
var UI = {}; //dict of rsg uis

function createRoot(areaName, spec) {

	let ggg = {};
	UI[areaName] = ggg;
	ggg.spec = spec;
	ggg.id = areaName;
	ggg.info ={};

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
function parseDynamicSpec(ggg) {
	let sp = jsCopy(ggg.spec.dynamicSpec);

	POOLS.augData = makeDefaultPool(sData);// jsCopy(serverData);

	//annotate does NOT create anything!
	annotate(sp); //connects nodes to spec and dyn spec nodes to each object

	let pool = POOLS.augData;



	// 2. pass: add dynamic areas
	for (const oid in pool) {

		let o = pool[oid];

		if (nundef(o.RSG)) continue;

		let info = mergeIncludingPrototype(sp, oid, o);
		//console.log(info);

		ggg.info[oid] = info;
	}

	// console.log('halooooooooooooo',pool)

	// 2. pass: add dynamic areas
	for (const oid in pool) {

		let o = pool[oid];
		let info = ggg.info[oid];

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

	// build tree and populate
	for (const oid in pool) {
		let o = pool[oid];
		let info = ggg.info[oid];
		if (nundef(info) || nundef(info.loc)) continue;
		//let loc = info.loc;
		let areaName = getDynId(info.loc, oid);
		// console.log(areaName)

		dynamicArea(ggg, areaName, info, oid, o);
		let propName = info.type == 'panel' ? 'panels'
			: info.type == 'list' ? 'elm' : 'data';
		let oEinhaengen = ggg.areas[areaName];
		if (nundef(oEinhaengen[propName])) oEinhaengen[propName] = [];
		oEinhaengen[propName].push(info);

		// console.log(oid,info);

		//populate: TODO: just first one for now!!!
		for (const k in info) {

			let container = parseIfContainer(k,info);
			if (!container) continue;

			let content = getContent(info[k], o);
			if (!content) break;//TODO: make this continue and remove break unten!!!

			console.log('_________________')
			console.log('container',k,container);
			console.log('content',oid+info[k],content);

			//ex 1: muss in 
			populate(ggg,container,content)
			break;//only first one!
		}
	}

}








