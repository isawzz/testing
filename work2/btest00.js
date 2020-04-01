window.onload = () => _start();
var divMain, divPlayer, divOpps, colors, iColor, timit;
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

	//console.log(sData);
	root('table');
	parseStaticSpec();

	mBy('all_opps').innerHTML='wwwwwwwwwwwwwwwwwwwwwwwwwwwwwww'

	//showTree(UIROOT);
	//console.log('__________________')
	
	
	//parseDynamicSpec();
	
	//console.log('__________________')
	//showTree(UIROOT,['panels', 'elm'], ['params']);
	//console.log('__________________')
}

function parseDynamicSpec1() {
	let sp = jsCopy(SPEC.dynamicSpec);

	POOLS.augData = makeDefaultPool(sData);// jsCopy(serverData);

	//annotate does NOT create anything!
	annotate(sp); //connects nodes to spec and dyn spec nodes to each object

	//instantiate sp nodes
	dynSpec = sp;
	let pool = POOLS.augData;

	//erst brauch ich einen pass der ueberall die number info setzt
	//und fuer jedes object das in node.pool ist ein eigenes base panel macht
	//fuer diese loc!
	for (const k in sp) {
		let node = sp[k];
		if (node.loc) {
			let group = node.pool;
			if (isEmpty(group)) continue;
			//console.log('group', group);
			let loc = node.loc;
			let uiNode = AREAS[loc];
			//console.log('loc', loc, 'uiNode', uiNode);
			prepParentForChildren(loc, group.length);
			for (const oid of group) {
				//TODO!!! simplification: mach einfach panels!
				//TODO!!! simpl: keine params... werden verwendet!
				addPanel(loc, oid);

			}
		}
	}

	//return;
	// 2. pass: add dynamic areas
	for (const oid in pool) {

		let o = pool[oid];

		if (nundef(o.RSG)) continue;

		let merged = mergeDynSetNodes(o);

		if (oid == 'Player2') {
			//console.log('merged', merged);
		}
		// according to merge muss ich in parent loc ein p_elm
		//machen und mit info von o fuellen! das wird 1 panel von parent AREA

		//wie macht man ein panel in einer loc?
		if (!merged.type || !PROTO[merged.type]) continue;
		let info = jsCopy(PROTO[merged.type]);
		if (oid == 'Player2') {
			//console.log('info',merged.type,info);
		}

		let areaName = getDynId(merged.loc, oid);

		dynamicArea(areaName, info, oid, o);

		//console.log('>>>>>>>',info.type);
		let propName = info.type == 'panel' ? 'panels'
			: info.type == 'list' ? 'elm' : 'data';
		let oEinhaengen = AREAS[areaName];
		if (nundef(oEinhaengen[propName])) oEinhaengen[propName] = [];
		oEinhaengen[propName].push(info);

	}
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
	divMain = d3.select('#MAIN');
	divPlayer = d3.select('#PLAYER');
	divOpps = {};
	let dOpps = d3.select('#OPPS');
	for (const plid in playerConfig[GAME].players) {
		let dPlid = dOpps.append('div').attr('id', plid);
		divOpps[plid] = dPlid;
	}

	colors = ['blue', 'red', 'green', 'purple', 'black', 'white'];
	iColor = 0;
}
async function loadAssetsfe() {
	vidCache = new LazyCache(!USE_LOCAL_STORAGE);

	testCardsC = await vidCache.load('testCards', async () => await route_rsg_asset('testCards', 'yaml'));
	testCards = vidCache.asDict('testCards');
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





