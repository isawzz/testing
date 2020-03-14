//#region file, folder helpers
function getExamplesFolder() {
	return (FLASK ? '/' : '/') + 'examples_front/';
}
function getSpecPath(gameName) {
	return getExamplesFolder() + gameName + '/' + gameName + '.yml';
}
function getJsPath(gameName) {
	return getExamplesFolder() + gameName + '/' + gameName + '.js';
}

//#endregion
function bestFitScaleFactors(board, f2nRatio = 4, edgeWidth = 10, {gName, w, h, margin = 4} = {}) {
	//will return fw,fh,nw,nh,ew (=scale factors for fields,nodes,edges)
	//angepasst to container gName (an svg g element centered in middle ie., translated by w/2,h/2)
	//or to some fixed w,h if given
	//base for calculations are board margin,wdef,hdef as well as wBoard,hBoard (all taken from board param)
	if (w == undefined) {
		let g = document.getElementById(gName);
		let transinfo = getTransformInfo(g);
		w = transinfo.translateX * 2;
		h = transinfo.translateY * 2;
	}
	let fw = Math.floor((w - margin) / (board.wBoard + board.wdef / 2));
	let fh = Math.floor((h - margin) / (board.hBoard + board.hdef / 2));

	return [fw, fh, Math.floor(fw / f2nRatio), Math.floor(fh / f2nRatio), edgeWidth];
}
function clearNicePalette() {
	localStorage.removeItem('nicePalette');
	unitTestPalette('nicePalette removed');
}
function findFirstSimplePropChange(oold, onew) {
	//returns first simple prop val that has changed
	//TODO: do NOT check obj_type,visible,col,row,player,neighbors
	let val;
	console.log(oold, onew);
	for (const k in onew) {
		val = onew[k];
		if (isSimple(val) && val != oold[k]) {
			return val;
		}
	}
	for (const k in oold) {
		if (nundef(onew[k])) return '';
	}
	return null; //nothing has changed
}
function findFirstSimplePropChangeMore(oold, onew) {
	//returns first simple prop val that has changed
	//{p:propName,add|rem|mod:true}

	let val;
	for (const k in onew) {
		val = onew[k];
		if (isSimple(val)) {
			//should be shown if simple (literal)
			if (nundef(oold[k])) {
				//a new prop has been added
				return {p: k, add: true};
			} else if (val != oold[k]) {
				return {p: k, mod: true};
			}
		} //do not consider complex prop vals per default!
	}
	for (const k in oold) {
		val = onew[k];
		if (nundef(val)) return {p: k, rem: true};
	}
	return null; //nothing has changed
}
function getTupleGroups() {
	let tgServer = G.serverData.tupleGroups;
	let tupleGroups = [];
	for (const tg of tgServer) {
		let desc = tg.desc.toString();
		let choices = tg.tuples._set; //an array of objects w/ key= '_tuple'
		let tuples = choices.map(x => x._tuple);
		//console.log(choices);
		tupleGroups.push({desc: desc, tuples: tuples});
	}
	return tupleGroups;
}
function initTriggers() {
	H.serverDataTriggers = {}; // triggers on properties of serverData
	H.serverDataTriggers.status = v => setStatus(v.toString());

	H.serverObjectTriggers = {}; //triggers on properties serverData.table objects

	H.uiObjectTriggers = {}; //triggers on properties ui objects

	H.tupleElementTypeTriggers = {}; //triggers on tuples in actions (serverData.options[0].actions)
	H.tupleElementTypeTriggers.obj = o => {};
}
function setTestOutputOptions(csv) {
	addIfComma(csv, execOptions.activatedTests);
}
function saveNicePalette() {
	//TODO: save at server!
	let p = sysvarGet('palDescription');
	unitTestPalette('palDescription', p);
	if (!p) {
		error('cannot savePalette!!!');
		return;
	}
	let slst = localStorage.getItem('nicePalette');
	unitTestPalette(slst);
	let lst = slst ? slst.split('!') : [];
	unitTestPalette(lst, typeof lst);
	lst.push(comp_(p.hue0, p.nHues, p.mode)); //{hue0:p.hue0,nHues:p.nHues,mode:p.mode});
	localStorage.setItem('nicePalette', lst.join('!'));
	localStorage.setItem('palette', comp_(p.hue0, p.nHues)); //temporary!!!
	console.log('saving palette: hue0', p.hue0, 'nHues', p.nHues);
	unitTestPalette('nicePalette saved', lst);
}
function setBackgroundToPlayerColor() {
	//console.log(G.players, G.player);
	setCSSVariable('--bgBody', G.players[G.player].color);
}
function setStatus(s) {
	d = document.getElementById('statusText');
	d.innerHTML = s;
}
function tableHandling0() {
	console.log('table', G.serverData.table); //p0: just show table in console!
}

//#region UI handlers
//TODO!!
function freezeUI() {
	//console.log('UI frozen!!!');
}
function onClickTab(evt, cityName) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName('tabcontent');
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = 'none';
	}
	tablinks = document.getElementsByClassName('tablinks');
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(' active', '');
	}
	document.getElementById(cityName).style.display = 'block';
	evt.currentTarget.className += ' active';
}
//#endregion
