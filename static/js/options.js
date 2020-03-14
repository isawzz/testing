//wie sollen options impl werden?
//distinguish front end options and back end options (fe)
//
var OPTIONS = {};

var dummerCounter = 0;
function initOptions() {
	// console.log('MACHT INITOPTIONS!!!!', dummerCounter);
	dummerCounter += 1;
	OPTIONS.clickToSelect = true;
	OPTIONS.tooltips = document.getElementById('bTTip').textContent.includes('ON');

	//the following options influence the way table objects are presented:
	//summarizes a default set of table features that can be mod
	OPTIONS.tableMode = document.getElementById('bTableMode').textContent; // 'dev'
	initTableOptions(OPTIONS.tableMode);
}
function initTableOptions(tableMode) {
	if (tableMode == 'play') {
		OPTIONS.table = {
			//affect: how to handle new objects coming up in object table
			createDummy: false, //unspecified objects are created as dummy objects in 'objects' tab (under game area)
			detectBoardLocation: true, //try detecting if this object has a field, edge or corner prop that hints at a board location

			//affect: presentation of existing object's properties
			showComplexVals: false, // true, false (show lists and objects)
			optIn: null,
			optOut: {visible: -1, player: -1, obj_type: -1, row: -1, col: -1, id: -1}, //any type names likely not to be relevant for user
			updateIf: 'changed', // always, changed, new
			showProps: false,
			usePlayerColor: true,
			fontSize: 60
		};
	} else {
		//dev mode
		OPTIONS.table = {
			createDummy: true, //unspecified objects are created as dummy objects in 'objects' tab (under game area)
			detectBoardLocation: false, //try detecting if this object has a field, edge or corner prop that hints at a board location

			showComplexVals: true, // true, false (show lists and objects)
			optin: null,
			optOut: {visible: -1}, //any type names likely not to be relevant for user
			updateIf: 'always', // always, changed, new
			showProps: true,
			usePlayerColor: false,
			fontSize: 12
		};
	}
	OPTIONS.table.sysprop = {visible: presentVisible, id: presentId, obj_type: presentObj_Type, name: presentName};
}

function toggleSettings(b, keyList, toggleList) {
	//console.log(keyList);
	let val = lookup(OPTIONS, keyList);
	//console.log(val);
	let i = toggleList.indexOf(val);
	let newVal = toggleList[(i + 1) % toggleList.length];
	setKeys(OPTIONS, keyList, newVal);
	b.textContent = newVal;

	if (keyList.includes('tableMode')) initTableOptions(OPTIONS.tableMode);
}
function toggleTooltips(b) {
	if (OPTIONS.tooltips) {
		deactivateTooltips();
		b.textContent = 'tooltips: OFF';
		OPTIONS.tooltips = false;
	} else {
		activateTooltips();
		b.textContent = 'tooltips: ON';
		OPTIONS.tooltips = true;
	}
}
