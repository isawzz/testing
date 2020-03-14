function processEnd() {
	if (nundef(G.serverData.end)) return false;

	//console.log('game over!');
	let winner = G.serverData.end.winner;
	let msg = winner == null ? 'Both players win!' : 'Winner is ' + winner;
	setStatus('GAME OVER! ' + msg);
	areaBlink('area_status');
	decider.clearActionList();
	return true;
}
function processPlayerChange() {
	if (isdef(G.serverData.end)) return;
	let players = G.serverData.players;
	let player = null;
	for (const plid in players) {
		let pl = players[plid];
		if (pl.obj_type == 'GamePlayer') {
			player = plid;
			break;
		}
	}
	if (!player) {
		error('NO GamePlayer obj_type in G.serverData.players!!!!!!!!!!!!!');
	}
	//set player
	if (player != G.player) {
		G.player = player;
		G.playerChanged = true;
		setBackgroundToPlayerColor(); //default handling! >> TODO: user triggers
	} else {
		delete G.playerChanged;
	}
}
function processStatus() {
	if (isdef(G.serverData.status)) {
		setStatus(G.serverData.status.toString()); //default handling! >> TODO: user triggers
	}
}
function processActions() {
	if (nundef(G.serverData.options)) return false;
	presentChoices();
	return true;
}
function presentChoices() {
	G.tupleGroups = getTupleGroups();
	decider.genMove(
		G,
		(t, idx) => {
			freezeUI();
			send_action(t, idx);
		},
		false
	);
	//console.log('tuples', G.tupleGroups);
}
function processWaitingFor() {
	if (nundef(G.serverData.waiting_for)) {
		error('No options AND No waiting_for data!!!!!!!!!!');
		return;
	}

	error('Missed player change!'); //TODO: geht nur 1 action + fixed player order
}
