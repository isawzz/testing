function tableHandling() {
	let tnew = G.serverData.table;
	let told = nundef(G.history) ? {} : G.history.table;

	for (const id in tnew) {
		presentObject(id, tnew[id], told[id], OPTIONS.table);
	}
}

//#region table object creation / destruction (board ms are created in PolyGrid!)
function registerVisualForTableObject(oid, ms, syskey) {
	//immer statt new ms aufrufen!!!!!!!
	if (nundef(G.serverData.table[oid])) {
		error('CREATING VISUAL FOR NON_EXISTING TABLE OBJECT!!!!!!!', oid);
	}

	setuiG(oid, ms, syskey);

	//muss handler updaten wenn OPTION.tooltips eg.,
	//console.log(OPTIONS.tooltips);
	if (OPTIONS.tooltips) setTimeout(() => createTooltip(oid), 100); //allow jQuery to update!
}
function destroyVisual(ms) {
	//console.log('destroying', ms.id, '...');
	//muss jedesmal gemacht werden wenn Guis reset or delete drin mache!
	//muss alle handlers destroyen!!!!!!!
	let oid = ms.id;
	$('#' + oid).unbind('mouseover mouseout click mouseenter mouseleave');
	ms.clickHandler = null;
	ms.mouseEnterHandler = null;
	ms.mouseLeaveHandler = null;
	//ms.removeFromUI();
	delete G.uis[oid];
}
//#endregion

//#region tooltips
function activateTooltips() {
	for (const oid in G.uis) {
		createTooltip(oid);
	}
}
function createTooltip(oid) {
	//let o = G.serverData.table[oid];
	$('#' + oid).mouseover(function(e) {
		let id = evToId(e);
		setTooltipContent(id, e.clientX, e.clientY);
	});
	$('#' + oid).mouseout(function() {
		$('div#tooltip').css({
			top: 0,
			left: 0,
			display: 'none'
		});
	});
}
function deactivateTooltips() {
	for (const oid in G.uis) {
		$('#' + oid).unbind('mouseover mouseout');
	}
}
function setTooltipContent(oid, x, y) {
	// var myText = 'tooltip for object ' + oid;
	// $('div#tooltip').html(myText);
	let o = G.serverData.table[oid];
	console.log(o, o.obj_type);
	$('div#ttipTitle').html(o.obj_type + ('name' in o ? ':' + o.name : 'id' in o ? ':' + o.id : ''));

	let sProps = '';
	let sVals = '';
	//isBoardMember ausrechnen
	let isBoardMember = true;
	for (const p in o) {
		if (p == 'visible') {
		} else if (p == 'obj_type') {
			//ignore
			continue;
		} else if (p == 'id') {
			//ignore
			continue;
		} else if (isBoardMember && p in {neighbors: 0, row: 0, col: 0, corners: 0, edges: 0}) {
			//todo: isLocationInfo
			//ignore
			continue;
		}
		let val = o[p];
		sProps += p + '<br>';
		sVals += simpleRep(val) + '<br>';
	}

	$('div#ttipLeft').html(sProps);
	$('div#ttipRight').html(sVals);
	$('div#tooltip').css({
		display: 'inline-block',
		top: y,
		left: x
	});
}
//#endregion
