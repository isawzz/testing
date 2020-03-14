function initUserSpec() {
	initPlayers();
	initTable();
	initStructures();
	initSpecBehaviors();
	gameloop();
}
function initPlayers() {
	let n = Object.keys(G.serverData.players).length;
	setSG('NumPlayers', n);
	setSG('NumOpponents', n - 1);
	G.players = {};
	let colors = ['red', 'blue', 'yellow', 'green', 'violet', 'pink', 'orange', 'beige', 'skyblue', 'sienna'];
	let i = 0;
	for (const id in G.serverData.players) {
		G.players[id] = {id: id, color: colors[i]};
		i += 1;
	}
	S.players = G.players;
}
function initTable(areaName = 'area_game') {
	let spec = S.userSpec;
	let table = getArea(areaName);

	let dims = allNumbers(spec.TABLEDIM);
	let wGame = dims[0];
	let hGame = dims[1];
	resizeArea(table, wGame, hGame);

	//let container = addDiv(table.div, {position: 'relative'});
	layoutRec(table, spec.LAYOUT, getSYS('pals')[1], 2, 0, 0, wGame, hGame);
}
function initStructures() {
	unitTestSpec('___________ initStructures ___________');
	let structures = S.userSpec.STRUCTURE;
	for (const areaName in structures) {
		let lst = jsCopy(structures[areaName]);
		let func = lst.shift();
		let params = lst;

		//the following creates the structure from line in STRUCTURE
		//eg. Board: [createPolyGrid, [obj_type, Board], quad]
		console.log(areaName);
		let structObject = window[func](G.serverData, areaName, ...params);
		addStructure(structObject.id, structObject);
	}
}
function initSpecBehaviors() {}
