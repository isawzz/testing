function addBaseArea(id, iPalette, {isClearable = false, row, col} = {}) {
	//base areas are the areas in basic layout (see pageLayout.css, layout1)
	let areaInfo = {id: id, div: document.getElementById(id), isBase: true, isClearable: isClearable, row: row, col: col, iPalette: iPalette};
	SYS.areas[id] = areaInfo;
}
function addArea(id, {x = 0, y = 0, w, h, bg, row, col, gName, baseArea, iPalette}) {
	//d,e
	let areaInfo = {id: id, div: document.getElementById(id), isBase: false, x: x, y: y, w: w, h: h, bg: bg, row: row, col: col, gName: gName};
	if (isdef(iPalette)) {
		areaInfo.iPalette = iPalette;
	}
	if (isdef(baseArea)) {
		if (isString(baseArea)) baseArea = getArea(baseArea);
		areaInfo.row = baseArea.row;
		areaInfo.col = baseArea.col;
		if (nundef(areaInfo.iPalette)) areaInfo.iPalette = baseArea.iPalette;
	}
	SYS.areas[id] = areaInfo;
}
function areaG(areaName) {
	//makes g area out of areaName!!!!!!!
	let baseArea = getArea(areaName);
	let id = baseArea.id;
	let gName = 'g_' + id;
	clearElement(baseArea.div);
	let g = addSvgg(baseArea.div, gName, {originInCenter: true});
	baseArea.gName = gName;
	return gName;
}
function areaDivPosG(id, containerArea, x, y, w, h, {bg: bg}) {
	let d = addDivPos(containerArea.div, x, y, w, h, {gap: 0, bg: bg});
	d.id = id;
	let gName = 'g_' + id;
	let g = addSvgg(d, gName, {originInCenter: true});
	addArea(id, {x: x, y: y, w: w, h: h, bg: bg, gName: gName, baseArea: containerArea, iPalette: containerArea.iPalette});
	return gName;
}
function areaBlink(id) {
	let area = getArea(id);
	area.div.classList.add('blink');
}
function stopBlinking(area) {
	area.div.classList.remove('blink');
}
function clearScreen() {
	//clears ALL base areas
	//button (b) areas remain unchanged
	//removes all non_base areas
	for (const id in SYS.areas) {
		let info = getArea(id);
		stopBlinking(info);
		if (info.isClearable) {
			//console.log(id, 'is clearable!');
			clearElement(info.div);
		} else if (!info.isBase) {
			removeArea(id);
		}
	}
	//add basic elements for some areas
	let status = getArea('area_status');
}
function getArea(id) {
	return SYS.areas[id];
}
function getGName(id) {
	return getArea(id).gName;
}
function removeArea(id) {
	delete SYS.areas[id];
}
function resizeArea(a, w, h) {
	//if it is a base area, resizing must be done using css variables for row,col!!!
	if (a.isBase) {
		let cssW = '--w_' + a.col;
		let cssH = '--h_' + a.row;
		if (w) setCSSVariable(cssW, '' + w + 'px');
		if (h) setCSSVariable(cssH, '' + h + 'px');
	} else {
		if (w) a.div.style.width = w;
		if (h) a.div.style.height = h;
	}
	if (w) a.w = w;
	if (h) a.h = h;
}
