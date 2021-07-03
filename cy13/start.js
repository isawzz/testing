window.onload = start;

function start() {
	Items = {}; let styleDict = getSampleStyle(); let dBlue = mBy('dBlue'), dPink = mBy('dPink');

	mStyleX(dBlue, { w: '100%', h: 300, rounding: 10, matop: 10, bg: 'skyblue' });
	mStyleX(dPink, { w: '100%', h: 300, rounding: 10, matop: 10, bg: 'pink' });

	let g1 = new MGraph(dBlue, styleDict, getSampleData(8,12));
	let g2 = new MGraph(dPink, styleDict, getSampleData(12,8));

	// cyGraph(mBy('cy'), styleDict, elements);
	// cyClickNode(id=>console.log('clicked',id))
}

