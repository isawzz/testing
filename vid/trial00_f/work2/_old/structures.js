//*** RSG structure types ***

function cardHand(pool, loc, o, oid, path, omap) {
	let size = CARD_SZ;
	let [w, h, gap] = [size * .66, size, 4];

	// *** stage 1: convert objects into uis ***
	let olist = mapOMap(omap, pool);
	if (isEmpty(olist)) return null;
	let uis = getUis(olist, sizedCard123(w, h));

	//TODO: if any cards are present: need to create corresponding mks and link them to oid (because care correspond to objects and resources dont!!!)

	//console.log(loc)
	let area = stage2_prepArea(loc);

	let container = stage3_prepContainer(area); mColor(container, 'red')

	//TODO: shall I create an mk for container??? not needed in step_from_scratch!!!! because hand does not need to be highlighted
	//TODO: naeher testen und ueberlegen ob das auch stimmt wenn ein object fuer hand existiert (market.neutral)

	stage4_layout(uis, container, w, h, gap, layoutHand);
}
function colorLabelRow(pool, loc, o, oid, path, omap) {

	// *** stage 1: convert objects into uis ***
	//console.log(omap)
	let size = LABEL_SZ, gap = 4;
	let olist = mapOMap(omap);
	//console.log('olist',olist)
	if (isEmpty(olist)) return;
	olist = olist.map(item => ({ color: convertToColor(item.key), label: convertToLabel(item.value) }));
	let uis = getUis(olist, colorLabelDiv(size));
	//TODO: if any cards are present: need to create corresponding mks and link them to oid (because care correspond to objects and resources dont!!!)

	let area = stage2_prepArea(loc);

	let container = stage3_prepContainer(area); mColor(container, 'white');

	//TODO: shall I create an mk for container??? not needed in step_from_scratch!!!! because hand does not need to be highlighted
	//TODO: naeher testen und ueberlegen ob das auch stimmt wenn ein object fuer hand existiert (market.neutral)

	stage4_layout(uis, container, size, size, gap, layoutRow);
}

function hexGrid(pool, loc, o, oid, path, omap) {

	if (USE_OLD_GRID_FUNCTIONS) return _hexGrid(loc, oid, omap, pool);

	// console.log('___________')
	// console.log('omap=board', omap)
	// console.log('path', path, 'board', board);

	// *** stage 0: calc skeleton of grid (layout) ***
	let [board, fields, corners, edges] = gridSkeleton(omap, pool, getHexGridInfo, getHexFieldInfo);
	board.oid = oid + (isEmpty(path) ? '' : '.' + path);

	//timit.showTime('skeleton done');
	generalGrid(board, fields, corners, edges, loc, agHex);

}
function quadGrid(pool, loc, o, oid, path, omap) {
	console.log('quadGrid',loc)
	if (USE_OLD_GRID_FUNCTIONS) return _quadGrid(loc, oid, omap, pool);
	// *** stage 0: calc skeleton of grid (layout) ***
	let [board, fields, corners, edges] = gridSkeleton(omap, pool, getQuadGridInfo, getQuadFieldInfo);
	board.oid = oid + (isEmpty(path) ? '' : '.' + path);
	return generalGrid(board, fields, corners, edges, loc, agRect);

}
function generalGrid(board, fields, corners, edges, loc, fieldFunc) {
	console.log('generalGrid',loc)
	//hab hiermit board,fields,corners,edges dicts mit {o,oid,info}

	// *** stage 0: sizing info ***
	let size = 100;//FIELD_SZ;//sollte multiple of 4 sein! weil wdef=4
	let gap = 4;

	let [fw, fh, wField, hField] = [size / board.info.wdef, size / board.info.hdef, size - gap, size - gap];
	let szCorner = Math.max(wField / 4, 20);
	let [wBoard, hBoard] = [fw * board.info.w + szCorner, fh * board.info.h + szCorner];

	// *** stage 1: convert objects into uis ***

	let pal = getTransPalette('silver');
	[fieldColor, nodeColor, edgeColor] = [pal[1], 'dimgray', pal[5]];

	let mk = registerObject(board, 'm', loc, RSGTYPES.board);

	for (const oid in fields) { let o = fields[oid]; let el = gG(); fieldFunc(el, wField, hField); gBg(el, fieldColor); o.ui = el; registerObject(o, 'm', mk.id, RSGTYPES.field); }
	for (const oid in edges) { let o = edges[oid]; let el = gG(); gFg(el, edgeColor, 10); o.ui = el; registerObject(o, 'm', mk.id, RSGTYPES.edge); }
	for (const oid in corners) { let o = corners[oid]; let el = gG(); agCircle(el, szCorner); gBg(el, nodeColor); o.ui = el; registerObject(o, 'm', mk.id, RSGTYPES.corner); }

	//uis sind board,fields,corners,edges .map(x=>x.ui)
	timit.showTime('stage 1 done');

	//area is div element treated as always (flexWrap)
	//container=board is a div (posRel) with svg and g inside =>3 containers!
	//fields,edges,corners are g elements within board g


	// *** stage 2: prep area div (loc 'areaTable') as flexWrap ***
	//let area = mBy(loc);// 
	let area = stage2_prepArea(loc);

	timit.showTime('stage 2 done');
	// *** stage 3: prep container div/svg/g (board) as posRel, size wBoard,hBoard ***
	let container = stage3_prepContainer(area); //mColor(container, 'transparent'); //container is appended to area!!!!!!!

	let svgContainer = gSvg();
	let style = `margin:0;padding:0;position:absolute;top:0px;left:0px;width:100%;height:100%;border-radius:${gap}px;`;
	svgContainer.setAttribute('style', style);
	container.appendChild(svgContainer);

	let gContainer = gG();
	svgContainer.appendChild(gContainer);

	board.ui = board.div = container;
	board.svg = svgContainer;
	board.g = gContainer; gContainer.id = board.id; //this counts as loc for board elements
	registerUiFor(mk, container);

	let [wTotal, hTotal] = [wBoard + 2 * gap, hBoard + 2 * gap];
	mStyle(container, { width: wTotal, height: hTotal, 'border-radius': gap });
	gContainer.style.transform = "translate(50%, 50%)"; //geht das schon vor append???
	//console.log(wTotal, hTotal);

	timit.showTime('stage 3 done');
	// *** stage 4: layout! means append & positioning = transforms... ***
	layoutGridInfo(board.g, fields, corners, edges, fw, fh);


}
function quadGrid_old(soDict, loc, sBoard, idBoard) {
	//timit.showTime(getFunctionCallerName());
	//let [idBoard, sBoard] = findMatch(soDict, condList);
	//console.log('quadGrid call')
	return _quadGrid(loc, idBoard, sBoard, soDict);
}
function hexGrid_old(soDict, loc, sBoard, idBoard) {
	//timit.showTime(getFunctionCallerName());
	//let [idBoard, sBoard] = findMatch(soDict, condList);
	let res = _hexGrid(loc, idBoard, sBoard, soDict);
	timit.showTime('old hexGrid done!');
	return res;
}

//#region stages
function stage1_makeUis(omap, objectPool, w, h, gap, domelFunc) {
	// *** stage 1: convert objects into uis ***
	let olist = mapOMap(omap, objectPool);
	//console.log('olist', olist);
	if (isEmpty(olist)) return null;

	let otrans = olist; //.map(item =>  ({ color: convertToColor(item.key), label: convertToLabel(item.value) }));
	//console.log('otransformed', otrans);

	let uis = getUis(otrans, domelFunc(w, h));
	//console.log(uis);
	return uis;
}
function stage2_prepArea(areaId) { let area = mBy(areaId); mClass(area, 'flexWrap'); return area; }
function stage3_prepContainer(area) { let container = mDiv(area); mPosRel(container); return container; }
function stage4_layout(uis, container, w, h, gap, layoutFunc) {
	// *** stage 4: create layout of objects within container *** >>returns size needed for collection
	let [wTotal, hTotal] = layoutFunc(uis, container, w, h, gap);
	mStyle(container, { width: wTotal, height: hTotal, 'border-radius': gap });
}
//#endregion

//#region helpers
function convertToColor(x) {
	let res = SPEC.color[x];
	if (!res) {
		res = SPEC.color[x] = randomColor();
	}
	return res;
}
function convertToLabel(x) {
	let res = lookup(SPEC, ['label', x]);
	return res ? res : x;
}

function getQuadGridInfo(rows, cols) {
	[wdef, hdef] = [4, 4];
	let info = {
		structType: 'quadGrid',
		rows: rows,
		cols: cols,
		wdef: 4,
		hdef: 4,
		dx: wdef,
		dy: hdef,
		w: wdef * cols,
		h: hdef * rows,
		minRow: 1,
		minCol: 1,
	};
	return info;
}
function getHexGridInfo(rows, cols) {
	[wdef, hdef] = [4, 4];
	[dx, dy] = [wdef / 2, (hdef * 3) / 4];
	let info = {
		structType: 'hexGrid',
		rows: rows,
		cols: cols,
		wdef: 4,
		hdef: 4,
		dx: dx,
		dy: dy,
		w: wdef + (cols - 1) * dx,
		h: hdef + (rows - 1) * dy,
		minRow: 0,
		minCol: 0,
	};
	return info;
}
function getQuadFieldInfo(boardInfo, row, col) {
	//is exactly same as for hex field except for shape! >so unify after testing!
	let info = {
		shape: 'rect',
		memType: 'field',
		row: row,
		col: col,
		x: -boardInfo.w / 2 + (col - boardInfo.minCol) * boardInfo.dx + boardInfo.wdef / 2,
		y: -boardInfo.h / 2 + (row - boardInfo.minRow) * boardInfo.dy + boardInfo.hdef / 2,
		w: boardInfo.wdef,
		h: boardInfo.hdef,
	};
	//console.log('col',col,'minCol',boardInfo.minCol,boardInfo.w,boardInfo.dx,boardInfo.wdef,'==>',info.x)
	info.poly = getQuadPoly(info.x, info.y, info.w, info.h);
	return info;
}
function getHexFieldInfo(boardInfo, row, col) {
	let info = {
		shape: 'hex',
		memType: 'field',
		row: row,
		col: col,
		x: -boardInfo.w / 2 + (col - boardInfo.minCol) * boardInfo.dx + boardInfo.wdef / 2,
		y: -boardInfo.h / 2 + boardInfo.hdef / 2 + (row - boardInfo.minRow) * boardInfo.dy,
		w: boardInfo.wdef,
		h: boardInfo.hdef,
	};
	info.poly = getHexPoly(info.x, info.y, info.w, info.h);
	return info;
}

function gridSkeleton(omap, pool, gridInfoFunc, fieldInfoFunc) {
	//calc pos skeleton of board
	let board = { o: omap, info: gridInfoFunc(omap.rows, omap.cols) };

	let fields = {};
	for (const fid of getElements(omap.fields)) {
		let o = pool[fid];
		fields[fid] = { oid: fid, o: pool[fid], info: fieldInfoFunc(board.info, o.row, o.col) };
	}
	// console.log('fields', fields);

	//now vertices
	board.info.vertices = correctPolys(Object.values(fields).map(x => x.info.poly), 1);

	let dhelp = {}; //remember nodes that have already been created!!!
	let corners = {};
	for (const fid in fields) {
		let f = fields[fid];
		let i = 0;
		for (const cid of getElements(f.o.corners)) {
			if (cid && nundef(dhelp[cid])) {
				let pt = f.info.poly[i];
				corners[cid] = { oid: cid, o: pool[cid], info: { shape: 'circle', memType: 'corner', x: pt.x, y: pt.y, w: 1, h: 1 } };
				dhelp[cid] = true;
			}
			i += 1;
		}
	}
	// console.log('corners', corners);

	//now edges
	dhelp = {}; //remember edges that have already been created!!!
	edges = {};
	for (const fid in fields) {
		let f = fields[fid];
		for (const eid of getElements(f.o.edges)) {
			if (eid && nundef(dhelp[eid])) {
				let el = pool[eid];
				let n1 = corners[el.corners[0]._obj];
				let n2 = corners[el.corners[1]._obj];
				let [x1, y1, x2, y2] = [n1.info.x, n1.info.y, n2.info.x, n2.info.y];
				//console.log(el, n1, n2)
				edges[eid] = { oid: eid, o: el, info: { shape: 'line', memType: 'edge', x1: x1, y1: y1, x2: x2, y2: y2, x: (x1 + x2) / 2, y: (y1 + y2) / 2, thickness: 1, w: 1, h: 1 } };
				dhelp[eid] = true;
			}
		}
	}
	// console.log('edges', edges);

	return [board, fields, corners, edges];

}





