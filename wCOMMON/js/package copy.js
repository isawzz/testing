var MD = null;
var DM = null;

function recCollect(md, lst) {
	if (md.oid) lst.push(md);
	else {
		for (const k in md) {
			recCollect(md[k], lst);
		}
	}
}

function addToMappingDic(m) {
	//SUPER HEIKLE OP!!!!!!!!!!!!!!
	if (MD == null) { MD = {}; DM = {}; }

	let oid = m.oid;

	if (m.u) { MD[m.u] = m; if (nundef(DM[m.t])) DM[m.t] = []; DM[m.t].push(m.u); return m.u; }
	if (!oid) {
		//das ist wenn es nur ein 'pseudo' object ist sowie {wood:4} als omap hat!
		//omap ist in dem fall ein kvpair
		//owner ist das _obj dem diese prop gehoert
		//path: obj_type(owner).prop1.prop2...
		//eintrag in MD soll sein: owner.path
		let childKeys = [m.owner].concat(m.props)
		lookupSet(MD, childKeys, m);
		return childKeys;

	} else if (m.parent) {
		let childKeys = [oid].concat(m.parent.keys);
		lookupSet(MD, childKeys, m);
		return childKeys;
	} else {
		let otype = m.otype;
		let props = m.props;
		//let keys = m.props; //Player.buildings
		let parent = m.parent; //this should be a mapping! or null
		let area = m.area; //this should be an AREA name (all capitalized) or null
		let loc = m.loc; // this can be

		let keys = [oid, otype].concat(props);
		if (area) keys.push(area);
		lookupSet(MD, keys, m);
		return keys;
	}
}

function findPlacements(dPlacements, data) {

	let placements = [];
	////console.log(SPEC.placement);

	for (const placement of SPEC.placement) {
		let path = Object.keys(placement)[0]; // [otype].prop1.prop2...propN
		let place = placement[path]; // MAIN ... | self.prop ...
		let unique = path + '.' + place;

		let loc, area, locProp;
		if (startsWith(place, 'self.')) { loc = place; area = null; locProp = stringAfter(place, '.'); }
		else { loc = null; area = place; locProp = null; }

		let matchingOids = []; //collect matching mappings

		let parts = path.split('.');
		////console.log('parts',parts)
		let otype = path[0] != '.' ? parts[0] : null;
		let props = parts.slice(1); // : parts; // indexing: farms.0 (index is prop)
		// //console.log('isTyped', otype != null, 'props', props)

		for (const kPool of ['table', 'players']) {
			let pool = serverData[kPool];
			let isTable = kPool == 'table';
			for (const oid in pool) {

				let o = pool[oid];
				////console.log('oid',oid,'otype',otype,'o',o);
				if (otype && o.obj_type != otype) {
					////console.log('continuing...')
					continue;
				}

				//omap is always just 1 element!!!
				let omap = lookup(o, props); //TODO!!!! handle indices! Player.buildings.farms.0 should be possible
				////console.log('props',props)
				////console.log('omap',omap)
				if (!omap) continue;

				// no parents yet!

				// set u t
				let u = oid + (otype ? '.' : '') + unique;
				let postfix = stringAfter(path, '.');
				let t = oid;
				if (!isEmpty(postfix)) t += '.' + postfix;

				let match = { u: u, t: t, omap: omap, place:place, otype: otype, area: area, loc: loc, locProp: locProp, path: path, oid: oid, props: props };
				match.keys = addToMappingDic(match);

				matchingOids.push(match);
			}
		}
		placements.push(matchingOids);
	}
	// //console.log('placements',placements);
	return placements;
}

function detectLists(placements) {
	let flattened = [];
	for (const plc of placements) {
		for (const match of plc) {
			let result = [];
			recDetectLists(match, result);
			flattened = flattened.concat(result);
		}
	}
	////console.log(flattened);
	//for (const c of flattened) { consOutput(c.path, c.olist, c.loc); }
	return flattened;

}
function recDetectLists(m, matches) {
	// returns list of matches made of this single match 
	////console.log(m);
	//example: Board 
	//nix neues!
	if (SPEC.visualize && SPEC.visualize[m.path]) {
		//whatever the rsgType, if it is specified, defer olist spawning to later
		let vis = SPEC.visualize[m.path];
		if (!vis.listType) { //this is a leaf object!!!
			matches.push(m);
			return;
		} else {
			//this matching has a listType, meaning: it is a container of other objects 
			//what if this listType is recursive? muss sowieso fuer alle spawns recDetectLists aufrufen!
			// let mNew = { omap: el, loc: m.loc, path: m.path + '.' + i, oid: m.oid, props: m.props };
			// recDetectLists(mNew, matches);
			let func = vis.listType;
			let { olist, layoutInfo } = window[func](m.omap, serverData.table);
			m.olist = olist;
			m.layoutInfo = layoutInfo;
			////console.log('structure',olist,layoutInfo);
			matches.push(m);
			return;
		}

	}
	//example: GamePlayer.items
	//if it is a set of objects, look what type objects are
	//if objects are sets also, need to go deeper! otherwise just return item list
	//NESTED LISTS OF OBJECTS WERDEN HIER IN MEHRERE mappings mit einfachen olists aufgeteilt!
	let els = getElements(m.omap);
	//console.log('------------------------', els)
	if (!isEmpty(els)) {
		//check if els[0] is a literal if yes, return m
		//===> GamePlayer.items {_set:[{_obj:"3"},{_obj:"4"}]} 
		//===> nix aendert sich, nur eintrag von "3","4" in olist
		if (isLiteral(els[0])) {
			////console.log('literal:', els[0])
			m.olist = els;
			matches.push(m);
			return;

		} else if (isList(els[0]) || els[0]._set) {
			// NESTED LIST!!!!
			//===> GamePlayer.sets {_set:[{_set:[{_obj:"1"},{_obj:"2"}]},{_set:[{_obj:"3"},{_obj:"4"}]}]} 
			//===> foreach sublist, make new mapping, remove nested mapping!, nur eintrag von "3","4" in olist
			////console.log('muss ich jetzt einen neuen match machen?', els[0], m);
			let i = 0;
			for (const el of els) {
				//TODO: soll ich da einen index dazugeben??? glaub schon!!!
				//index gehort zu props, nicht zu path!!!
				// ============>> NEW MAPPINGS ARE CREATED!!!!!
				//console.log('=====>',m)

				let newPath = m.path + '.' + i;

				let newProps = jsCopy(m.props);
				newProps.push(i);

				//console.log(newPath,newProps);

				let unique=newPath+'.'+m.place;

				//im moment aendert sich oid nicht, elemente sind ja lists!!!

				// // set u t
				let u=m.oid+(m.otype?'.':'')+unique;
				let postfix=stringAfter(newPath,'.');
				let t=m.oid;
				if (!isEmpty(postfix)) t+='.'+postfix;

				let mNew = {u:u,t:t, omap: el, otype: m.otype, area: m.area, loc: m.loc, locProp: m.locProp, path: newPath, oid: m.oid, props: newProps, place:m.place };
				mNew.keys = addToMappingDic(mNew);

				recDetectLists(mNew, matches);
				i += 1;
				// //els[0] is dict or array
				// //only support sets of similar element types!!!
				// let els1 = getElements(els[0]);
				// //console.log('recursion deeper:', els1);
			}
		} else {
			consOutput('WEISS NICHT WAS TUN MIT', m.omap);
		}

	} else if (isEmpty(m.props)) {
		if (!m.omap.obj_type) {
			//console.log('DAS GIBT ES NICHT!!!!! oid omap does NOT have obj_type', m.omap);
		} else {
			////console.log('omap is an object w/o visualize directive', m.omap);
			matches.push(m); return;
			//should be using detection and default itemType

		}
	} else {
		// 'pseudo' object handling! => object but does NOT have its own oid
		//it is some kind of property that happens to be an object, but not an object w/ oid
		//eg., player.resources in catan

		//just determine itemType 
		let itemType = null;
		for (const key in m.omap) {
			let val = m.omap[key];
			if (isLiteral(val) && itemType && itemType != 'literal'
				|| isList(val) && itemType && itemType != 'list'
				|| val._set && itemType && itemType != 'list'
				|| isDict(val) && itemType && itemType != 'obj') {
				//console.log('omap is a mixed object and unknown: DONT KNOW WHAT TO DO!!!!!');
				//console.log('...ignoring this match', m.path, m.omap);
				//alternatively, could allow such objects and treat them as uniform key-val lists
				// olist = olist.filter(x => isLiteral(x.value)); // could still do the simplification step!
				return;
			} else if (!itemType) {
				if (isLiteral(val)) itemType = 'literal';
				else if (isList(val) || val._set) itemType = 'list';
				else itemType = 'obj';
			}
		}
		//2 cases: either the object has only literal values (resources: {wood:2, brick:3})
		if (itemType == 'literal') {
			//da jedes object eine key-value list ist, nimm default rep fuer key-value lists!
			let olist = dict2olist(m.omap, 'key');
			m.olist = olist;
			matches.push(m);
			return;
		} else if (itemType == 'list') {
			//or the object has all sets/lists as values: {farms:[blablabl]}
			//effectively throws away the keys! but adds olists!
			//============>> NEW MAPPINGS CREATED!!!!
			//object wird aber list! GamePlayer.resources beispiel!
			for (const key in m.omap) {

				let newPath = m.path + '.' + key;

				let newProps = jsCopy(m.props);
				newProps.push(key);

				//console.log(newPath,newProps);

				let unique=newPath+'.'+m.place;

				//im moment aendert sich oid nicht, elemente sind ja lists!!!

				// // set u t
				let u=m.oid+(m.otype?'.':'')+unique;
				let postfix=stringAfter(newPath,'.');
				let t=m.oid;
				if (!isEmpty(postfix)) t+='.'+postfix;

				let mNew = {u:u,t:t, omap: m.omap[key], otype: m.otype, area: m.area, loc: m.loc, locProp: m.locProp, path: newPath, oid: m.oid, props: newProps, place:m.place };
				mNew.keys = addToMappingDic(mNew);
				matches.push(mNew);

				recDetectLists(mNew, matches);

			}
		}
	}
}

function childMappings(mappings) {
	let additionalMappings = [];
	for (const m of mappings) {
		if (nundef(m.olist)) continue;
		let oidParent = m.oid;
		let pathParent = m.path;
		let propsParent = m.props;
		for (const oid of m.olist) {

			//problem wenn olist nicht oids sondern key-value pairs enthaelt!!!
			if (isDict(oid)) {
				//key-val pairs
				let kvpair = oid;
				let newProps = jsCopy(m.props);
				newProps.push(kvpair.key);

				let mNew = { omap: kvpair, parent: m, owner: m.oid, oid: null, path: m.path + '.' + kvpair.key, loc: null, props: newProps }
				mNew.keys = addToMappingDic(mNew);

				additionalMappings.push(mNew);

			} else {
				let oChild = getServerObject(oid);

				let mNew = { omap: oChild, parent: m, oid: oid, path: m.path, loc: null, props: m.props }
				mNew.keys = addToMappingDic(mNew);

				additionalMappings.push(mNew);
				//parent finds its children by: [olist-entry]@[own addr] (getMappingKey(olist[i],addr))
			}


		}
	}
	return additionalMappings;
}


function evalSelfLoc(mappings) {
	let additionalMappings = [];
	for (const m of mappings) {
		//console.log(m);
		if (m.loc) {
			let locProp = m.locProp;
			let val = m.omap[locProp];
			if (nundef(val)) { m.owner = getServerObject(m.oid); val = m.owner[locProp]; }
			////console.log('val',val)
			if (val._obj || isNumber(val)) {
				if (val._obj) val = val._obj;
				let oLoc = sData.table[val]; //TODO: simplified!
				////console.log('brauch jetzt die mappings von ', val, oLoc);
				let allLocations = [];
				recCollect(MD[val], allLocations);
				////console.log(allLocations);

				//for first location, just use original
				//all other locations: replicate and set different parent
				let firstLoc = allLocations[0];
				m.parent = firstLoc; //TODO!!! muss bei parent in olist eintragen!!!
				//trage bei parent ein!
				if (nundef(firstLoc.olist)) firstLoc.olist = [];
				firstLoc.olist.push(m.oid);
				//remove m from MD!!!! because loc changes!
				delete MD[m.oid];
				m.keys = addToMappingDic(m);

				//rest of locations if any
				allLocations = allLocations.slice(1);
				for (const mParent of allLocations) {
					//TODO!!! muss bei parent in olist eintragen!!!
					//trage bei parent ein!
					if (nundef(mParent.olist)) firstLoc.olist = [];
					mParent.olist.push(m.oid);

					let m1 = { omap: m.omap, oid: m.oid, path: m.path, loc: m.loc, locProp: m.locProp, area: m.area, props: m.props, parent: mParent };
					m1.keys = addToMappingDic(m1);
					additionalMappings.push(m1);
				}

			} else if (isString(val)) {
				val = val.toUpperCase();

				//hopefully this area exists!
				m.area = val;
				delete MD[m.oid];
				addToMappingDic(m);

				//TODO!!!!! keys abaendern! accordingly...
			}
			//oLoc is now converted into container if it is not one already!!!
			//brauch jetzt das mapping von oLoc
			//bloedsinn das geht immer noch nicht mit dem robber!
		}
	}

	////console.log(additionalMappings);
	return additionalMappings;

}

function addRsgTypes(mappings) {
	for (const m of mappings) {
		let vis = SPEC.visualize;
		if (vis && vis[m.path]) {
			//for now only consider exact path!
			let visPath = vis[m.path];
			m.listType = visPath.listType;
			m.itemType = visPath.itemType;
			m.params = visPath;
		} else {
			m.listType = DEF_LIST_TYPE;
			m.itemType = DEF_ITEM_TYPE;
		}
	}

}








