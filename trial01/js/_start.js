window.onload = () => _start();
var timit,G;

async function _start() {
	timit = new TimeIt('*timer', TIMIT_SHOW);
	await loadAssets();
	await loadGameInfo();
	await loadSpec();
	//await loadCode();
	await loadInitialServerData();

	d3.select('#bNextMove').text('NEXT MOVE').on('click', interaction);
	gameStep();
	//interaction(); //to test 2nd step
}
async function gameStep() {
	//#region prelims
	if (serverData.waiting_for) { await sendStatus(getUsernameForPlid(serverData.waiting_for[0])); }
	if (serverData.end) { d3.select('button').text('RESTART').on('click', restartGame); }
	timit.showTime('* vor package: *')

	//worldMap('OPPS'); 

	preProcessData();
	//have d14, u14 ==> serverData (processed), tupleGroups, boats, SPEC, CODE

	// TODO: here I could insert computing diffed serverData

	sData = serverData; //these are the data that I actually want to present!

	//#endregion

	isTraceOn=true;
	let g1=G= parseSpecBranch('table',SPEC,['staticSpec','root00']);
	console.log(G)

	//testLayout01();
	//return;

	//hide('test1'); hide('test2'); hide('test3');

	//console.log(sData);
	//let G0 = createRoot('table', SPEC);
	//parseStaticSpec(G0);
	//parseDynamicSpec(G0);

	// let G2 = createRoot('table2',jsCopy(SPEC));
	// parseStaticSpec(G2);
	// parseDynamicSpec(G2);

	// let G3 = createRoot('table3',jsCopy(SPEC));
	// parseStaticSpec(G3);
	// parseDynamicSpec(G3);

	// let G2 = createRoot('table3',SPEC);
	// parseStaticSpec(G2);
	// parseDynamicSpec(G2);

	//mBy('all_opps').innerHTML='wwwwwwwwwwwwwwwwwwwwwwwwwwwwwww'

	//showTree(G1.root);
	//console.log('__________________')



	//console.log('__________________')
	//showTree(G1.root,['panels', 'elm'], ['params']);
	//console.log('__________________')
}

function testLayout01() { let d = mBy('table'); mColor(d, 'blue'); }




//#region rest
function onClickSizeBig() { let d = mBy('table'); mSize(d, 700, 500); mColor(d, 'blue'); }
function onClickSizeSmall() { let d = mBy('table'); mSize(d, 400, 300); mColor(d, 'blue'); }
async function restartGame() {
	await sendRestart();
	d3.select('button').text('NEXT MOVE').on('click', interaction);
	gameStep();
}
async function interaction() {
	await sendAction();
	gameStep();
}

