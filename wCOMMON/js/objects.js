var UIS, IdOwner, id2oids, oid2ids, id2uids, path2mainIds;

class MK { }

function registerObject(m){
	//kann vereinfacht werden!!!!
	//keys in MD sind jetzt unique identifier!
	//koennte sie als id nehmen!!! =>das ist dann nur fuer MAIN object!!!! (fuer andere brauche anderes register!)
	//let id = 
}


function registerObject(what, props, mapping, mParentId) {
	//what can be oid | {key: "wood", value: 3} (for literal objects)
	//props [] means toplevel object
	//mapping is either own or parent mapping (for container child)

	//for a child that is proper object, mk.oid has to be its own oid!
	//mapping can still be parent mapping 
	//or
	//can transform into child mapping: schau ma mal!

	ensureUIS();
	//console.log('registering', ...arguments);

	//if what is an object (isDict), it is a literal and this is a leaf object
	let mk = new MK();
	let id = mk.id = getUID();
	if (mParentId) mk.mParentId=mParentId;

	let oid = mk.oid = isDict(what) ? mapping.oid : what;

	//TODO da muss ich noch den index reinbringen: zB fuer farms beispiel!!!
	let o = mk.o =  isDict(what) ? what : isEmpty(props)? getServerObject(oid): mapping.omap;
	let myPath = mk.myPath = isDict(what)?mapping.path + o.key:oid==mapping.oid?oid+mapping.props.join('.'):what;

	mk.isLeaf = isDict(what) || oid != mapping.oid;

	//if this thing has an oid and no props: its object is serverData.table[oid]
	//console.log(isDict(what),isEmpty(props),oid,mapping.omap)

	let idType = mk.idType = 'm'; // mapped object
	listKey(path2mainIds,myPath,id);
	mk.mapping = mapping;

	linkObjects(id, oid);
	listKey(IdOwner, idType, id);
	//console.log(idType)
	UIS[id] = mk;

	return mk;
}

function getServerObject(oid) { return serverData.table[oid] ? serverData.table[oid] : serverData.players[oid]; }
function getUIObject(id) { return UIS[id]; }
function getFirstId(path){let ids=path2mainIds[path];return ids && ids.length>0?ids[0]:null;}
function getFirstVisual(path){
	let ids = path2mainIds[path];
	for(const id of ids) if (UIS[id]) return UIS[id];
}
function ensureUIS() { if (nundef(UIS)) { UIS = {}; IdOwner = {}; id2oids = {}; oid2ids = {}; id2uids = {}; path2mainIds = {}; } }
function resetUIS() {
	UIS = {};
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of mk ids (called ids or uids) }
	id2uids = {}; // { uid : list of mk ids related to same oid }
}

//#region helpers: linking UIS ...
function _addRelatives(id, oid) {
	// if (isdef(oid2ids[oid])) oid2ids[oid].map(x => listKey(id2uids, id, x)); //all other already existing uis are linked to newly created element!
	if (isdef(oid2ids[oid])) {
		for (const idOther of oid2ids[oid]) {
			if (idOther == id) {
				//console.log('object', id, 'already exists in oid2ids[', oid, ']');
				continue;
			}
			listKey(id2uids, id, idOther);
			listKey(id2uids, idOther, id);
		}
	}
}
function linkObjects(id, oid) {
	// if (HALLO) //console.log('linkObjects',id,oid)
	_addRelatives(id, oid);
	listKey(id2oids, id, oid);
	listKey(oid2ids, oid, id);
}
function unlink(id) {
	let oids = id2oids[id];
	let uids = id2uids[id];
	//console.log('unlink', 'oids', oids)
	//console.log('unlink', 'uids', uids)
	if (isdef(uids)) for (const uid of uids) removeInPlace(id2uids[uid], id);
	if (isdef(oids)) for (const oid of oids) removeInPlace(oid2ids[oid], id);
	delete id2uids[id];
	delete id2oids[id];
}
//#endregion






















function registerObject_dep(o, idType, loc, rsgType) {
	// o must have oid (in path notation) and o
	// o.ui (if exists) => mk.elem
	// idType 'm','x','d','a','l' different kinds of interaction!
	// rsgType => mk.rsg 
	// loc is id of parent ui/mk (can be area or mk)
	let id = getUID();
	let mk = new MK();
	mk.o = o.o;
	mk.info = o.info;
	let oid = stringBefore(o.oid, '.');
	mk.oid = oid;
	mk.path = o.oid;

	//if (idType=='i') //console.log('dadada')///////////////////////////

	//	mk.cat = cat;
	mk.rsg = rsgType;
	mk.id = id;
	mk.idType = idType;
	mk.loc = loc; //id of containing ui (can be in UIS or just a div)
	if (o.ui) registerUiFor(mk, o.ui); // { mk.elem = mk.parts.elem = o.ui; mk.elem.id = id; }

	//if (idType=='i') //console.log('mk.elem',mk.elem);///////////////////////////

	linkObjects(id, oid);
	listKey(IdOwner, idType, id);
	//console.log(idType)
	UIS[id] = mk;
	return mk;
}
function registerUiFor(mk, ui) { mk.elem = ui; mk.elem.id = mk.id; mk.parts.elem = ui; mk.domType = getTypeOf(ui); mk.cat = DOMCATS[mk.domType]; }


//#region delete MSOB 
function _deleteFromOwnerList(id) { let owner = IdOwner[id[2]]; if (isdef(owner)) removeInPlace(owner, id); }
function deleteRSG(id) {
	//console.log('deleting', id)
	let mk = UIS[id];
	if (nundef(mk)) {
		error('object that should be deleted does NOT exist!!!! ' + id);
		//return;
	}
	unhighlightMsAndRelatives(null, mk)
	unlink(id);
	_deleteFromOwnerList(id);
	mk.destroy();
	delete UIS[id];
}
function deleteAll(rsgType, idoType) {
	let ids = IdOwner[idoType];
	//console.log(ids);
	ids = isdef(IdOwner[idoType]) ? IdOwner[idoType].filter(x => x[0] == rsgType) : []; for (const id of ids) deleteRSG(id);
}
function deleteDefaultObjects() { deleteAll('d', 't'); }
function deleteDefaultPlayers() { deleteAll('d', 'p'); }
function deleteActions() { deleteAll('d', 'a'); }
function deleteOid(oid) {
	let uids = jsCopy(oid2ids[oid]);

	//console.log('related to', oid, 'are', uids)
	//of these only have to delete main object and default object
	//no need to delete auxes?
	//no need to delete because these will be updated in all objects that have changed via table update!
	for (const uid of uids) {
		if (uid[2] == 'r' || uid[2] == 'l') continue;
		//console.log('deleting', uid);
		if (UIS[uid]) deleteRSG(uid);
	}
}
//#endregion


















