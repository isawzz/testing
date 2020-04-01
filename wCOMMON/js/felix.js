//var panels=null; //tree structure for static panels
var UIROOT; //augmented SPEC.root
var AREAS; //areas by name, pointing into UIROOT nodes!
//var DYNAMIC_NAMES;
var PROTO;
var POOLS = {};
var dynSpec;
var INFO={};

function root(areaName) {
	//console.log('___ root');
	setTableSize(areaName, 400, 300);
	//panels={};
	// panels.data=areaName;
	// panels.children=[];
	UIROOT = jsCopy(SPEC.staticSpec.root);
	//UIROOT.id='root'
	AREAS = {};
	PROTO = {};
	INFO = {};
	// DYNAMIC_NAMES = {}; //vielleicht erst in parseDynamicSpec???
	staticArea(areaName, UIROOT);
	addAREA('root', UIROOT);
	//UIROOT=SPEC.staticSpec.root;
}
function parseStaticSpec() {
	for (const k in SPEC.staticSpec) {
		if (k == 'root') continue;
		let oSpec = jsCopy(SPEC.staticSpec[k]);

		if (oSpec.loc) {
			let loc = oSpec.loc;
			if (!oSpec.id) oSpec.id = k;
			staticArea(loc, oSpec);
			let oEinhaengen = AREAS[loc];
			//console.log('oEinhaengen',oEinhaengen)
			if (nundef(oEinhaengen.panels)) oEinhaengen.panels = [];
			oEinhaengen.panels.push(oSpec);
		} else {
			PROTO[k] = oSpec;
		}
	}
}
function geht(sp){

	POOLS.augData = makeDefaultPool(sData);// jsCopy(serverData);

	//annotate does NOT create anything!
	annotate(sp); //connects nodes to spec and dyn spec nodes to each object

	//instantiate sp nodes
	dynSpec = sp;
	let pool = POOLS.augData;
	//console.log(pool)

	// 2. pass: add dynamic areas
	for (const oid in pool) {

		let o = pool[oid];

		if (nundef(o.RSG)) continue;

		let info = mergeIncludingPrototype(oid, o);
		//console.log(info);
		INFO[oid]=info;
	}


}
function parseDynamicSpec() {
	let sp = jsCopy(SPEC.dynamicSpec);
	geht(sp);
	dynSpec = sp;
	let pool = POOLS.augData;

	// console.log('halooooooooooooo',pool)

	// 2. pass: add dynamic areas
	for (const oid in pool) {

		let o = pool[oid];
		let info = INFO[oid];
		
		//continue;
		if (nundef(info) || nundef(info.loc)) {
			//console.log('no loc found for', oid)
			continue;
		}
		//console.log(o,info);

		//each object gets a base panel for info content
		//let areaName = getDynamicBaseArea(info, oid);
		let loc = info.loc;
		let areaName = getDynId(info.loc, oid);

		// console.log('------- areaName',areaName)
		if (!AREAS[areaName]) {
	
			let uiNode = AREAS[loc];
			// console.log('..........loc', loc, 'uiNode', uiNode);
			let group = info.pool;
			prepParentForChildren(loc, group.length);
			for (const oid of group) {
				//TODO!!! simplification: mach einfach panels!
				//TODO!!! simpl: keine params... werden verwendet!
				addPanel(loc, oid);
				//console.log('added panel for',loc,oid)
	
			}
		}
	}

	for(const oid in pool){
		let o = pool[oid];
		let info = INFO[oid];
		if (nundef(info) || nundef(info.loc)) continue;
		let loc = info.loc;
		let areaName = getDynId(info.loc, oid);
		console.log(areaName)

		dynamicArea(areaName, info, oid, o);
		let propName = info.type == 'panel' ? 'panels'
			: info.type == 'list' ? 'elm' : 'data';
		let oEinhaengen = AREAS[areaName];
		if (nundef(oEinhaengen[propName])) oEinhaengen[propName] = [];
		oEinhaengen[propName].push(info);

		console.log(oid,info);

		//populate:
		for(const k in info){
			let parts=k.split('.');
			let s=parts[0];
			let n=parts.length;
			//console.log(k,n);
			if (n==1 && k!='elm' && k!='data') continue;
			//console.log('this is a path:',k);
			let leaf=parsePath(parts,info[k],info);
			//if (isPath(k))
		}
		console.log(info)

		continue;

		//habe jetzt: info das ist der UIROOT node
		// oid, o
		//muss alle path objects parsen und 
		//ich muss jetzt von dem info node alle branches 
		//in 

		//fill in data how to?!?!?!?!?!?!?!?!?
		//console.log('merged', oid, merged);
		//console.log('info',info)

		//info ist das ergebnis von merged
		//info soll doch jetzt irgendwo in UIROOT sein???

	}

	return;
	//fuer die wo ich loc hab, haeng ich schon in UIROOT ein
	//default panel
	for (const k in sp) {
		let node = sp[k];
		let loc = node.loc;
		if (loc && AREAS[loc]) {
			if (k == 'all_opps') {
				console.log('habe area fuer', k);
			}
			//merge nodes

			let nParent = AREAS[loc];
			let nChild = node;

			if (nChild.panels) {
				//construct hybrid thing params
				let hybrid = {};
				let num = nChild.pool.length;
				let params = nParent.params;
				params.num = num;
				nParent.panels = nChild.panels;
				hybrid.params = params;
				let panels = nChild.panels;
				if (k == 'opp_info') {
					//console.log(hybrid);
					//console.log(nParent)
				}
				for (const oid of nChild.pool) {
					//let p=
					let o = pool[oid];
					let otherKeys = o.RSG;
					if (k == 'opp_info') {
						//console.log('o', o);
						//console.log('otherKeys', otherKeys);

					}
					for (const k2 of otherKeys) {
						panel
					}

				}
				// let type = nParent.panel_type;
				// hybrid.type = type;


				//split parent into 
			}
		}
	}

}








