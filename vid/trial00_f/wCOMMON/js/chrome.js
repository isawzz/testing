//#region pageHeader
function pageHeaderInit() { pageHeaderSetGame(); pageHeaderSetPlayers(); }
function pageHeaderUpdatePlayer(plid) {
	let mk;
	for (const pl in playerConfig[GAME].players) {
		mk = getPageHeaderDivForPlayer(pl);
		mk.classList.remove('gamePlayer');
	}
	mk = getPageHeaderDivForPlayer(plid);
	mk.classList.add('gamePlayer');
}
function pageHeaderClearAll() { pageHeaderClearPlayers(); pageHeaderClearGame(); }

function getPageHeaderDivForPlayer(oid) { return document.getElementById('c_c_' + playerConfig[GAME].players[oid].username); }
function pageHeaderClearGame() { clearElement(mById('divGameName')); }
function pageHeaderClearPlayers() { mById('divPlayerNames').innerHTML = '<div style="float:left">Players:&nbsp;</div>'; }
function pageHeaderSetGame() { mById('divGameName').innerHTML = `<div style='float:right;margin:14px'><b>${allGames[GAME].name}</b><br>(${PLAYMODE})</div>`; }
function pageHeaderSetPlayers() {
	let divPlayerNames = mById('divPlayerNames');

	let s = '<div style="float:left">Players:&nbsp;</div>';//&nbsp;';
	let pc = playerConfig[GAME].players;
	for (const pid in pc) {
		let pl = pc[pid];
		spl = pageHeaderGetPlayerHtml(pl.username, pid, pl.color);
		s += spl;
	}
	divPlayerNames.innerHTML = s;
}
function pageHeaderAddPlayer(username, playerId, color, asMe = false) {
	mById('divPlayerNames').insertAdjacentHTML('beforeend', pageHeaderGetPlayerHtml(username, playerId, color, asMe));

}
function pageHeaderGetPlayerHtml(username, playerId, color) {
	let spl = `<div id='c_c_${username}' class='playerHeader'><div>${username}</div><div style='color:${color}'>${playerId}</div></div>`
	return spl;
}

//#endregion

