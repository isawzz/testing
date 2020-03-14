class simttt {
	constructor() {
		this.state = new Array(9).fill(null);
		this.players = {p1: {sym: 'x'}, p2: {sym: 'o'}};
		this.turn = 'p1';
		this.actions = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
		this.table = {};
	}
	checkEnd() {
		for (const indices of [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]) {
			let cand = this.state[indices[0]];
			if (!cand) {
				continue;
			}
			if (this.state[indices[1]] == cand && this.state[indices[2]] == cand) {
				return cand;
			}
		}
		return null;
	}
	sendInit(pl) {
		if (pl == this.turn) {
			return {table: {}, actions: this.actions};
		} else {
			return {table: {}, waiting_for: [this.turn == 'p1'?'p2':'p1']};
		}
	}
	sendAction(pl, action = null) {
		//sending null action is like sending status!
		// C.create_object('tick', row=row, col=col,	symbol=player.symbol, player=player.name)
		// C.log.write(player, 'places at: {}, {}'.format(*action))
		//action is of the form (r,c)
		if (action) {
			let [r, c] = action; //geht das in js?
			let i = r * 3 + c;
			this.state[i] = pl;
			removeInPlace(this.actions, action);
			let o = {id: getNamedUID('t'), obj_type: 'tick', row: r, col: c, symbol: this.players[pl].sym, player: pl};
			this.table[o.id] = o;
			this.turn = pl == 'p1' ? 'p2' : 'p1';

			let cand = this.checkEnd();
			if (cand) {
				this.gameOver = true;
				this.winner = cand;
				return {table: this.table, end: {winner: cand}, waiting_for: [this.turn]};
			} else {
				return {table: this.table, waiting_for: [this.turn]};
			}
		} else if (pl == this.turn) {
			return {table: this.table, actions: this.actions};
		} else {
			return {table: this.table, waiting_for: [this.turn]};
		}
	}
}
