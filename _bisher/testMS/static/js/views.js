function switchView() {}
function addView(areaName, board, syskey = 'dev') {
	let gName = 'g' + areaName;
	let div = addGArea(gName, areaName);

	//da drin mach ein board so gross es geht!
}
function getBoardView(
	board,
	gName,
	{
		nodeShape = 'circle',
		fw = 43,
		fh = 50,
		nw = 12,
		nh = 12,
		ew = 10,
		w,
		h,
		f2nRatio = 4,
		opt = 'fit',
		gap = 4,
		margin = 0,
		edgeColor = 'maroon',
		fieldColor = 'beige',
		nodeColor = 'sienna'
	} = {}
) {
	this.gName = gName;
	if (w == undefined) {
		let g = document.getElementById(gName);
		let transinfo = getTransformInfo(g);
		w = transinfo.translateX * 2;
		h = transinfo.translateY * 2;
	}
	this.nodeShape = nodeShape;
	if (opt == 'fit') {
		this.fwmult = Math.floor((w - margin) / (this.wBoard + this.wdef / 2));
		this.fhmult = Math.floor((h - margin) / (this.hBoard + this.hdef / 2));
		this.nwmult = Math.floor(this.fwmult / f2nRatio);
		this.nhmult = Math.floor(this.fhmult / f2nRatio);
		this.ewmult = ew;
		//console.log('wBoard',this.wBoard,'hBoard',this.hBoard,'margin',margin,'w',w,'h',h,'wdef',this.wdef,'hdef',this.hdef);
		//console.log('fwmult',this.fwmult,'fhmult',this.fhmult);
	} else {
		this.fwmult = fw;
		this.fhmult = fh;
		this.nwmult = nw;
		this.nhmult = nh;
		this.ewmult = ew;
	}
	let x = 0;
	let y = 0;
	for (const id of board.fields) {
		let el = board.objects[id];
		createBoardElem(el, board.id, gName, 'main', el.w * board.fwmult - gap, el.h * board.fhmult - gap, fieldColor, board.shape, board.fwmult, board.fhmult);
	}
	for (const id of board.corners) {
		let el = this.objects[id];
		createBoardElem(
			el,
			board.id,
			gName,
			'main',
			Math.max(board.wdef * thboardis.nwmult, ew),
			Math.max(board.hdef * board.nhmult, ew),
			nodeColor,
			board.nodeShape,
			board.fwmult,
			board.fhmult
		);
	}
	// add edges
	for (const id of board.edges) {
		let el = board.objects[id];
		createBoardElem(el, board.id, gName, 'main', el.thickness * board.ewmult, 0, edgeColor, 'line', board.fwmult, board.fhmult);
	}
}
