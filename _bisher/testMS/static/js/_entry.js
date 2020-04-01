//entry point after initial loading
function _sessionStart() {
	//csv: grid layout palette q server spec structure sys
	setTestOutputOptions('');

	initSYS();
	if (FLASK) newGame();
	else testFront();
}

function newGame(game = 'tictactoe', options) {
	clearScreen();

	initS();

	sender = new ASender(FLASK && NGROK ? NGROK : LOCALHOST);
	decider = new ActionEngine(sender, 'divSelect', getSYS('pals'));
	//TODO: add triggers!

	send_GetUISpec(game, _ => send_Init(game, initUserSpec));
}

//TODO
function restartGame() {}

function send_GetUISpec(game = 'tictactoe', callback) {
	sender.send('get_UI_spec/' + game, data => {
		S.userSpec = data;
		if (callback) {
			callback(data);
		}
	});
}
function send_Init(game = 'tictactoe', callback) {
	sender.send('init/' + game, data => {
		// console.log(data);
		// console.log('*** THE END ***');
		G.history = null;
		G.serverData = data;
		initG(data);
		if (callback) {
			callback(data);
		}
	});
}
function send_action(t, idx, callback = gameloop) {
	sender.send('action/' + G.player + '/' + idx, data => {
		//console.log(data);
		G.history = G.serverData;
		G.serverData = data;
		if (callback) {
			callback(data);
		}
	});
}
