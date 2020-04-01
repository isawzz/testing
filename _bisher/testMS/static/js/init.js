//#region globals
var sender = null;
var decider = null;
var execOptions = {
	skipCond: () => false, //!execOptions.manualPlay.includes(player), // predicate func evaluating to cond for autoplay
	activatedTests: [], // unitTest flags to control output
	commandChain: [] // flags fuer startup commands (eg., onClickScenario)
};

var G = {}; //new each restartGame
var S = {}; //new each loadGame,newGame (mainmenu,even if change options)
var M = {}; //new each move
var SYS = {}; //session objects (never destroyed)
//#endregion

//#region init
//at session start only!
function initSYS() {
	// console.log('MACHT INITSYS!!!!!');
	SYS = {vars: {}, uis: {}, areas: {}, options: {}};
	initBaseAreas();
	initOptions();
	initDefaultBehaviors();
}
function initBaseAreas() {
	let ba = document.getElementsByClassName('area');
	let baseAreaNames = ['area_actions', 'area_buttonsLeft', 'area_log', 'area_buttonsRight', 'area_status', 'area_game', 'area_testing'];
	addBaseArea('area_actions', 0, {row: 2, col: 1});
	addBaseArea('area_buttonsLeft', 1, {row: 3, col: 1});
	addBaseArea('area_buttonsRight', 1, {row: 3, col: 3});
	addBaseArea('area_game', 1, {row: 2, col: 2, isClearable: true});
	addBaseArea('area_log', 0, {row: 2, col: 3});
	addBaseArea('area_status', 0, {row: 1});
	addBaseArea('area_testing', 0, {row: 3, col: 2});
	setSYS('baseAreaNames', baseAreaNames);
	colorAreas(true);

	//gibt noch ein paar dazu die NICHT in baseAreaNames sind, also nicht eigens colored werden
	//aber fix existieren (natuerlich nur in NON-clearable parent!)
	addBaseArea('divSelect', 0, {row: 1, col: 1, isClearable: true});
	addBaseArea('area_temp', 0, {row: 3, col: 2});
	addBaseArea('dummy_objects', 0, {row: 3, col: 2, isClearable: true});
	addBaseArea('London', 0, {row: 3, col: 2, isClearable: true});
	addBaseArea('Paris', 0, {row: 3, col: 2, isClearable: true});
	addBaseArea('Tokyo', 0, {row: 3, col: 2, isClearable: true});
}
//at newGame, when layout/structures should be initialized, or button INIT  (VL: coming from main menu)
function initS() {
	S = {vars: {}, structures: {}, uis: {}};
	for (const id in G.uis) {
		destroyVisual(G.uis[id]);
	}
	G = {vars: {}, uis: {}};
}
//at restartGame, layout and structs remain same, or button RESTART  (VL: restarting game)
function initG() {
	//at this point have G.serverData!!!!!
	G.vars = {};
	for (const id in G.uis) {
		destroyVisual(G.uis[id]);
	}
	G.uis = {};
	//TODO!!!! all game data (players,boards,...), if exist, need a clear/reset function!
	//G.players,G.boards
	initM(); //probably no need
}
//at begin of each move, when receiving new data from server, or button MOVE
//probably dont need M using G instead
function initM() {
	M = {vars: {}, uis: {}};
}
//#endregion

//#region getters and setters
function getM(vname) {
	return M.vars[vname];
}
function getMdef(vname, defval) {
	let res = getM(vname);
	if (res) return res;
	else {
		setM(vname, defval);
		return defval;
	}
}
function getuiM(oid, key) {
	return lookup(M.uis, [oid, key]);
}
function getG(vname) {
	return G.vars[vname];
}
function getGdef(vname, defval) {
	let res = getG(vname);
	if (res) return res;
	else {
		setG(vname, defval);
		return defval;
	}
}
function getuiG(oid, key) {
	return lookup(G.uis, [oid, key]);
}
function getS(vname) {
	return S.vars[vname];
}
function getSdef(vname, defval) {
	let res = getS(vname);
	if (res) return res;
	else {
		setS(vname, defval);
		return defval;
	}
}
function getuiS(oid, key) {
	return lookup(S.uis, [oid, key]);
}
function getSYS(vname) {
	return SYS.vars[vname];
}
function getSYSdef(vname, defval) {
	let res = getSYS(vname);
	if (res) return res;
	else {
		setSYS(vname, defval);
		return defval;
	}
}
function getuiSYS(oid, key) {
	return lookup(SYS.uis, [oid, key]);
}
//setters
function setM(vname, o) {
	M.vars[vname] = o;
	unitTestSys('added move var', vname, '=', o);
	return o;
}
function setuiM(oid, ms, key = null) {
	let entry = getIfDict(M.uis, oid, {});
	if (key) {
		entry[key] = ms;
	} else {
		let secs = getIfDict(entry, 'secs', []);
		secs.push(ms);
	}
	return entry;
}
function setG(vname, o) {
	G.vars[vname] = o;
	unitTestSys('added game var', vname, '=', o);
	return o;
}
function setuiG(oid, ms, key = null) {
	let entry = getIfDict(G.uis, oid, {});
	if (key) {
		entry[key] = ms;
	} else {
		let secs = getIfDict(entry, 'secs', []);
		secs.push(ms);
	}
	return entry;
}
function setSG(vname, o) {
	G.vars[vname] = o;
	S.vars[vname] = o;
	return o;
}
function setS(vname, o) {
	S.vars[vname] = o;
	unitTestSys('added struct var', vname, '=', o);
	return o;
}
function setuiS(oid, ms, key = null) {
	let entry = getIfDict(S.uis, oid, {});
	if (key) {
		entry[key] = ms;
	} else {
		let secs = getIfDict(entry, 'secs', []);
		secs.push(ms);
	}
	return entry;
}
function setSYS(vname, o) {
	SYS.vars[vname] = o;
	unitTestSys('added struct var', vname, '=', o);
	return o;
}
function setuiSYS(oid, ms, key = null) {
	let entry = getIfDict(SYS.uis, oid, {});
	if (key) {
		entry[key] = ms;
	} else {
		let secs = getIfDict(entry, 'secs', []);
		secs.push(ms);
	}
	return entry;
}
//#endregion
