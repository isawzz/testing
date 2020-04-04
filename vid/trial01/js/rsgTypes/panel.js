
function staticArea(ggg, areaName, oSpec) {
	trace(areaName, oSpec)
	let func = oSpec.type = correctFuncName(oSpec.type);
	oSpec.ui = window[func](ggg, areaName, oSpec);
}
function dynamicArea(ggg, areaName, oSpec, oid, o) {
	func = oSpec.type = correctFuncName(oSpec.type);
	//trace(areaName, oid, 'func', func)
	oSpec.ui = window[func](ggg, areaName, oSpec, oid, o);
}
function panel(ggg, areaName, oSpec, oid, o) {

	let [params, panels, parent] = setParentProps(ggg, areaName, oSpec, oid);
	let num = panels.length;

	//trace('num:' + num, 'size:' + size, 'id:' + id, 'parent.id:' + parent.id, isdef(oid) ? 'oid:' + oid : '(static)');
	//if (!num) { console.log('.return for num=0'); console.log(' '); }
	if (num == 0) return parent;

	clearElement(parent);

	let or = params.orientation ? params.orientation : DEF_ORIENTATION;

	let reverseSplit = false;
	let split = params.split ? params.split : DEF_SPLIT;
	if (split == 'equal') split = (1 / num);
	else if (isNumber(split)) reverseSplit = true;

	//trace('...or:' + or, 'split:' + split, 'reverse:' + reverseSplit);

	mFlex(parent, or);

	//console.log('parent', parent);

	for (let i = 0; i < num; i++) {
		let d = mDiv(parent);
		d.id = getUID();
		mFlexChildSplit(d, split);

		//console.log('child', d);

		if (reverseSplit) { split = 1 - split; }

		// recurse if the child has explicit params
		if (panels.length > i) {
			if (oid) dynamicArea(ggg, d.id, panels[i], oid, o); else staticArea(ggg, d.id, panels[i]);
		}
	}
	return parent;
}
function liste(ggg, areaName, oSpec, oid, o) {
	let [params, panels, parent] = setParentProps(ggg, areaName, oSpec, oid);

	return parent;
}
function dicti(ggg, areaName, oSpec, oid, o) {
	let [params, panels, parent] = setParentProps(ggg, areaName, oSpec, oid);

	return parent;
}

function setId(ggg, parent, oSpec, oid) {
	if (oSpec.id) {
		let id = oid ? getDynId(oSpec.id, oid) : oSpec.id;
		trace('setId: von', parent.id, 'zu', qualId(ggg, id));
		parent.id = qualId(ggg, id);
		addIdToAreaDict(ggg, id, oSpec);
		if (SHOW_AREA_IDS) parent.innerHTML = stringBefore(id,'@');  //title for test reasons!
		return id;
	}
	return null;

}
function setBg(d, bg) {
	if (nundef(bg)) bg = SET_RANDOM_COLORS ? randomColor() : null;
	if (bg) { mColor(d, bg, colorIdealText(bg)); }
	return bg;
}
function setSize(d, { w, h, unit = 'px' } = {}) {
	////trace(w, h, unit);
	if (nundef(w) && SET_STANDARD_SIZE) [w, h, unit] = STANDARD_SIZE;

	if (isdef(w)) { mMinSize(d, w, h, unit); }
	return [w, h];
}
function setParentProps(ggg, areaName, oSpec, oid) {
	trace(areaName,oid,oSpec)
	let params = oSpec.params ? oSpec.params : {}; //all defaults here!!!!!
	let panels = oSpec.panels ? oSpec.panels : [];

	let parent = halloFindDiv(ggg, areaName);

	let id = setId(ggg, parent, oSpec, oid);

	let bg = setBg(parent, params.color);
	let size = setSize(parent, params.size);
	return [params, panels, parent];
}
