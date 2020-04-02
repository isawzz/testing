window.onload = () => _start();
var colors, iColor, timit;
const SPEC_PATH = '/work2/static2.yaml';
const SERVERDATA_PATH = '/work2/sDataFull.yaml';
//#region control flow
async function _start() {
	timit = new TimeIt('*timer', TIMIT_SHOW);
	await loadAssetsfe();
	await loadSpecfe();
	//await loadCode();
	await loadInitialServerDatafe();
	//consExpand(serverData,['players','Player1','table']);
	initUI();
	d3.select('button').text('NEXT MOVE').on('click', interaction);
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

	testLayout01();
	return;














	hide('test1');hide('test2');hide('test3');

	//console.log(sData);
	let G0 = createRoot('table',SPEC);
	parseStaticSpec(G0);
	parseDynamicSpec(G0);

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

function testLayout01(){
	let d=mBy('table');
	setTableSize('table',500,300)
	mColor(d,'blue');
}




//#region rest
async function restartGame() {
	await sendRestart();
	d3.select('button').text('NEXT MOVE').on('click', interaction);
	gameStep();
}
async function interaction() {
	await sendAction();
	gameStep();
}
function initUI() {
	document.title = 'HA!';
	colors = ['blue', 'red', 'green', 'purple', 'black', 'white'];
	iColor = 0;
}
async function loadAssetsfe() {
	vidCache = new LazyCache(!USE_LOCAL_STORAGE);

	// console.log('haaaaaaaaaaaaaaaaaaaaaaa')
	testCardsC = await vidCache.load('testCards', async () => await route_rsg_asset('testCards', 'yaml'));
	testCards = vidCache.asDict('testCards');

	// console.log(testCards)

	iconCharsC = await vidCache.load('iconChars', route_iconChars);
	iconChars = vidCache.asDict('iconChars');
	c52C = await vidCache.load('c52', route_c52);
	c52 = vidCache.asDict('c52');

	allGames = {
		ttt: {
			name: 'TicTacToe',
			long_name: 'Tic-Tac-Toe',
			short_name: 'ttt',
			num_players: [2],
			player_names: ['Player1', 'Player2'],
		},
		s1: {
			name: 's1',
			long_name: 's1',
			short_name: 's1',
			num_players: [2, 3, 4, 5],
			player_names: ['Player1', 'Player2', 'Player3', 'Player4', 'Player5'],
		},
		starter: {
			name: 'Starter',
			long_name: 'Starter',
			short_name: 'starter',
			num_players: [2],
			player_names: ['Player1', 'Player2'],
		},
		catan: {
			name: 'Catan',
			long_name: 'The Settlers of Catan',
			short_name: 'catan',
			num_players: [3, 4],
			player_names: ['White', 'Red', 'Blue', 'Orange'],
		},
		aristocracy: {
			name: 'Aristocracy',
			long_name: 'Aristocracy',
			short_name: 'aristocracy',
			num_players: [2, 3, 4, 5],
			player_names: ['Player1', 'Player2', 'Player3', 'Player4', 'Player5'],
		}
	
	};
	
	// allGamesC = await vidCache.load('allGames', route_allGames);
	// allGames = vidCache.asDict('allGames');
	playerConfig = stubPlayerConfig(allGames); //stub to get player info
}

async function loadSpecfe() {

	let url = DSPEC_PATH + DSPEC_VERSION + '.yaml';
	defaultSpecC = await vidCache.load('defaultSpec', async () => await route_path_yaml_dict(url), true, false);// last 2 params: reload, useLocal

	url = SPEC_PATH;
	let staticSpecC = await vidCache.load('staticSpec', async () => await route_test_userSpec(url), true, false);// last 2 params: reload, useLocal

	// url = '/work2/dynamic.yaml';
	// dynSpecC = await vidCache.load('dynSpec', async () => await route_test_userSpec(url), true, false);// last 2 params: reload, useLocal

	defaultSpec = vidCache.asDict('defaultSpec');
	staticSpec = vidCache.asDict('staticSpec');
	// dynSpec = vidCache.asDict('dynSpec');

	//merge default and userSpec
	SPEC = deepmerge(defaultSpec, staticSpec, { arrayMerge: overwriteMerge });
	// SPEC = deepmerge(SPEC, dynSpec, { arrayMerge: overwriteMerge });

	//need to correct areas because it should NOT be merged!!!
	delete SPEC.asText;

	let d = mBy('SPEC');
	if (d && SHOW_SPEC) { d.innerHTML = '<pre>' + jsonToYaml(SPEC) + '</pre>'; }
	//else consOutput('SPEC',SPEC);

}
async function loadInitialServerDatafe(unameStarts) {
	_syncUsernameOfSender(unameStarts);

	let url = SERVERDATA_PATH;
	serverDataC = initialDataC[GAME] = await vidCache.load('serverData', async () => await route_path_yaml_dict(url), true, false); // last 2 params: reload, useLocal

	serverData = vidCache.asDict('serverData');
	return serverData;
}





