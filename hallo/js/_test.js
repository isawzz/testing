//#region parse spec tests
function test00() {
	let gg = parseSpecRoot('table', SPEC, ['staticSpec', 'root00']);
	console.log(gg);

	let g1 = parseSpecRoot('market_loc_table', SPEC, ['staticSpec', 'rootloc']);
	console.log(g1);

}

function testLayout01() { let d = mBy('table'); mColor(d, 'blue'); }
