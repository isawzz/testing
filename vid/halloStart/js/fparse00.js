//static
function createRoot(areaName, spec) {
	trace(areaName);
	let d = mBy(areaName); mMinSize(d, 400, 300); mColor(d, 'tomato');
	let ggg = parseSpecRoot(areaName, spec, ['staticSpec', 'root']);
	return ggg;
}
function parseStaticSpec(ggg) {
	for (const k in ggg.spec.staticSpec) {
		if (startsWith(k, 'root')) continue;
		let oSpec = jsCopy(SPEC.staticSpec[k]);

		if (oSpec.loc) {
			let loc = oSpec.loc;
			//if (!oSpec.id) oSpec.id = loc;
			let x = staticArea(ggg, loc, oSpec);
			console.log(x);
			//let oEinhaengen = ggg.areas[loc];
			// console.log('oEinhaengen',oEinhaengen);
			// console.log('node', oSpec);
			//if (nundef(oEinhaengen.panels)) oEinhaengen.panels = [];
			//oEinhaengen.panels.push(oSpec);
			//return;
		} else {
			PROTO[k] = oSpec;
		}
	}
}

//dynamic
function parseDynamicSpec(ggg) {
	let sp = jsCopy(ggg.spec.dynamicSpec);

	let pool = sData;

	//pass 1: annotate evals cond does NOT create anything!
	pass1_evalCond(sp); //connects nodes to spec and dyn spec nodes to each object
	//result of this pass is:
	//1. sp.market_info hat jetzt .pool=[market1]
	//2. POOLS.augData.market1 hat jetzt RSG: {market_info: true}

	// 2. pass: merge nodes for each object => ggg.info[oid]
	pass2_merge(ggg, pool, sp);
	//result of this pass is:
	//3. ggg.info[market1] has been added (=merged nodes for market1)

	// console.log('halooooooooooooo')
	console.log(sp.market_info);
	console.log(POOLS.augData.market1);
	console.log(ggg.info.market1);
	console.log(ggg)
	let skipPass3 = false;

	// 3. pass: add dynamic areas if loc, otherwise add dyn prototypes
	if (!skipPass3) {
		for (const oid in pool) {

			let o = pool[oid];
			let info = ggg.info[oid];

			//continue;
			if (nundef(info)) continue;
			if (nundef(info.loc)) {
				//console.log('no loc but info:', oid,info)
				//hab eh die info schon!
				continue;
			}
			//console.log(o,info);

			//each object gets a base panel for info content
			let loc = info.loc;
			let areaName = getDynId(info.loc, oid);
			console.log('areaName', areaName)

			// console.log('------- ',oid, areaName);
			// console.log('info', ggg.info[oid])
			if (!ggg.areas[areaName]) {

				//implicit: panels for each oid in thie set are created!
				let uiNode = ggg.areas[loc];
				// console.log('..........loc', loc, 'uiNode', uiNode);
				let group = info.pool;
				prepParentForChildren(ggg, loc, group.length);
				//return;
				for (const oid of group) {
					//TODO!!! simplification: mach einfach panels!
					//TODO!!! simpl: keine params... werden verwendet!
					addPanelForOid(ggg, loc, oid);
					//console.log('added panel for',loc,oid)

				}
			}
		}
	}

	// build tree and populate
	for (const oid in pool) {
		let o = pool[oid];
		let info = ggg.info[oid];
		if (nundef(info) || nundef(info.loc)) continue;
		//let loc = info.loc;
		let areaName = getDynId(info.loc, oid); //das ist zB all_opps@Player2
		//just created this in vorigem pass
		//koennt ich aber omitten, wenn ich einfach ein elm mit sizing equal 
		//postpone optimierung bis buildings work!!!
		if (skipPass3) dynamicArea(ggg, info.loc, info, oid, o);
		else {
			//works mit vorher pass 3!
			dynamicArea(ggg, areaName, info, oid, o);
		}


		let propName = info.type == 'panel' ? 'panels'
			: info.type == 'list' ? 'elm' : 'data';
		let oEinhaengen = ggg.areas[areaName];
		if (nundef(oEinhaengen[propName])) oEinhaengen[propName] = [];
		oEinhaengen[propName].push(info);

		// console.log(oid,info);
		//continue;
		//populate: TODO: just first one for now!!!
		for (const k in info) {
			let container = parseIfContainer(k, info);
			if (!container) continue;

			let content = getContent(info[k], o);
			if (!content) continue;//TODO: make this continue and remove break unten!!!

			console.log('_________________');
			console.log('k', k); // key in merged node that is a path eg. 'panels.0.elm'
			console.log('info', info); // merged node for oid
			console.log('oid', oid); // oid eg. Player1
			console.log('container', container); // {key:elm, oInfo:node for stand_loc@Player1 MIT UI!!!)
			console.log('content', content); // _set:[{_obj:id1},...] (value of Player1.market where '.market' is value of k in info, ie., info[k])

			//ex 1: muss in 
			//populate(ggg, container, content)
			let cards = getElements(content);
			//for each card do following:
			let c1 = cards[0];
			let oc1 = getObject(c1);
			console.log(oc1);
			//get info for oid: ggg.info[oid]
			let oc1_info = ggg.info[c1];
			console.log(oc1_info);
			//return;
			//break;//only first one!
		}
	}

}

//#region pass 1-4 in parseDynamicSpec:
function pass1_evalCond(sp) {
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
function pass2_merge(ggg,pool,sp){
	for (const oid in pool) {

		let o = pool[oid];

		if (nundef(o.RSG)) continue;

		let info = mergeIncludingPrototype(sp, oid, o);
		if (oid == 'farm1') console.log(info,'o.RSG',o.RSG);

		ggg.info[oid] = info;
	}

}
