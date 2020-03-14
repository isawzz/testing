function presentObject(id, o_new, o_old, options) {
	let ms = getuiG(id, 'main');
	if (!ms) return;
	let akku = [];
	//console.log(options.sysprop);
	for (const prop in o_new) {
		if (isdef(options.sysprop[prop])) {
			options.sysprop[prop](id, ms, o_new, o_old, options);
			continue;
		}
		if (isdef(options.optOut) && isdef(options.optOut[prop])) continue;
		let nval = o_new[prop];
		if (isSimple(nval)) {
			let noChange = (nundef(o_old) ? null : o_old[prop]) == nval;
			if (options.updateIf != 'always' && noChange) continue;

			let sval = nval.toString();
			akku.push((options.showProps ? prop + ':' : '') + sval);
		}
	}
	if (empty(akku)) return;
	ms.multiText({txt: akku, fz: options.fontSize, fill: options.usePlayerColor ? G.players[G.player].color : null});
}

function dots(ms, n, {UL = false, UR = true, sz = 10, pos, dir, colors} = {}) {
	//ms.removeFromChildIndex(5);
	let dim = ms.bounds;
	let x, y, dx, dy;
	if (UR) {
		if (nundef(sz)) sz = dim.h / (2 * n);
		x = dim.w / 2 + -2 * sz;
		y = -dim.h / 2 + 2 * sz;
		dx = 0;
		dy = 2 * sz;
	} else if (UL) {
		return;
	}
	console.log(dim, x, y, dx, dy);
	for (let i = 0; i < n; i++) {
		let color = isdef(colors) ? colors[i] : ms.fg;
		ms.circle({sz: sz, x: x, y: y, fill: color});
		x += dx;
		y += dy;
	}
}

function presentVisible(id, ms, o_new, o_old, options) {
	console.log(id, ms);
	//auf dem ms wird oben rechts eine reihe von meeples (circles jetzt) gezeichnet die
	//players zeigt die dieses object sehen
	//similar to tnt cv pres!

	let visPlayers = getVisibleList(o_new);
	let visColors = visPlayers.map(x => G.players[x].color);
	//console.log(visPlayers, visColors);
	dots(ms, visColors.length, {UL: false, UR: true, colors: visColors});

	//for each color make dot in MS starting from upper left corner hinunter
	//tnt
}
function presentId() {}
function presentObj_Type() {}
function presentName() {}
