//#region work!
function parsePath(path, prop, info) {
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
			}
		}
		if (!info.settings) info.settings = {};
		let k = path.join('_');
		info.settings[k] = [oInfo];
		info.settings[k].push(last1);
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









