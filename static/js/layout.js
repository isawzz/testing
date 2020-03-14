function layaddLeaf(area, t, pal, ipal, x, y, w, h) {
	let bg;
	let newPal = pal;

	info = layparseLeaf(t);

	if (!info.bg && !info.ipal) {
		bg = pal[ipal];
		ipal += 1;
	} else if (!info.bg) {
		ipal = Number(info.ipal);
		bg = getPal(ipal, pal);
		ipal += 1;
	} else if (!info.ipal) {
		bg = info.bg;
		newPal = colorPalette(bg);
		ipal = 3;
	} else {
		//both color and ipal given
		ipal = Number(info.ipal);
		newPal = colorPalette(info.bg);
		bg = getPal(ipal, newPal);
		ipal += 1;
	}

	areaDivPosG(info.name, area, x, y, w, h, {bg: bg});
	return {pal: newPal, ipal: ipal};
}
function layParseKey(k) {
	let percent = allNumbers(k)[1];
	let howMany = stringAfter(k, '__');
	unitTestLayout(percent, howMany);
	return {percent: percent, howMany: howMany};
}
function layprepQueue(t) {
	let res = {};
	let firstUniqueIndex = Object.keys(t).length;
	let sortedKeys = Object.keys(t).sort();
	//console.log(sortedKeys);
	for (const k of sortedKeys) {
		if ((k[0] == 'r' && !k.includes('__')) || (k[0] == 'c' && !k.includes('__'))) {
			res[k] = t[k];
		} else {
			let kInfo = layParseKey(k);
			//how many do I need?
			let howMany = kInfo.howMany;
			let n = 0;
			if (isNumber(howMany)) {
				n = Number(howMany);
			} else {
				n = SGet(howMany, 4);
			}
			if (n == 0) {
				//alert('0 players in layprepQueue LAYOUT!!!!!');
				n = 1;
			}
			//find percentage
			let percent = kInfo.percent;
			let percentNew = Math.ceil(percent / n);
			let info = layparseLeaf(t[k]);
			for (let i = 0; i < n; i++) {
				let newKey = (k[0] == 'r' && k.includes('__') ? 'r' : 'c') + firstUniqueIndex + '_' + percentNew;
				firstUniqueIndex += 1;
				//for now only support multi row/col leaves!!!!
				res[newKey] = info.name + (i + 1) + ',' + (i ? '' : info.bg) + ',' + (i ? '' : info.ipal);
			}
		}
	}
	return res;
}
function layparseLeaf(t) {
	//eg. t='M,deepSkyBlue,1' or 'Cards'
	//name HAS TO BE PROVIDED!!! JA weil id von area brauche
	let parts = t.split(',');
	let len = parts.length;
	let name = null,
		bg = null,
		ipal = null;
	if (len > 0) {
		name = parts[0];
	}
	if (len > 1) {
		bg = parts[1];
	}
	if (len > 2) {
		ipal = parts[2];
	}
	return {name: name, bg: bg, ipal: ipal};
}
function layoutRec(containerArea, t, pal, ipal, x, y, w, h) {
	if (isString(t)) {
		unitTestLayout('leaf', t);
		return layaddLeaf(containerArea, t, pal, ipal, x, y, w, h);
	}
	unitTestLayout(t);
	let keys = Object.keys(t);
	unitTestLayout(keys);
	let k0 = keys[0];
	if (k0[0] == 'r') {
		let queue = layprepQueue(t);
		unitTestLayout(queue);

		let hSum = 0;
		for (const k in queue) {
			let kInfo = layParseKey(k);
			let percent = kInfo.percent;
			let hNew = (h * percent) / 100;
			newPalInfo = layoutRec(containerArea, queue[k], pal, ipal, x, hSum, w, hNew);
			unitTestLayout('newPalInfo', newPalInfo);
			pal = newPalInfo.pal;
			ipal = newPalInfo.ipal;
			unitTestLayout(hNew, hSum);
			hSum += hNew;
		}
	} else if (k0[0] == 'c') {
		let queue = layprepQueue(t);
		unitTestLayout(queue);
		let wSum = 0;
		for (const k in queue) {
			let kInfo = layParseKey(k);
			let percent = kInfo.percent;
			let wNew = (w * percent) / 100;
			unitTestLayout(wNew, wSum);
			newPalInfo = layoutRec(containerArea, queue[k], pal, ipal, wSum, y, wNew, h);
			pal = newPalInfo.pal;
			ipal = newPalInfo.ipal;
			unitTestLayout(wNew, wSum);
			wSum += wNew;
		}
	}
	return {pal: pal, ipal: ipal};
}
