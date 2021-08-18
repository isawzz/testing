window.onload = start;

function start() {
	Items = {}; let styleDict = getSampleStyle(); let dBlue = mBy('dBlue'), dPink = mBy('dPink');

	mStyleX(dBlue, { w: '100%', h: 300, rounding: 10, matop: 10, bg: 'skyblue' });
	mStyleX(dPink, { w: '50%', h: 300, rounding: 10, matop: 10, bg: 'pink' });

	let g1 = new MGraph(dBlue, styleDict, getSampleData(8,12));
	//let g2 = new MGraph(dPink, styleDict, getSampleData(12,8));

	storePositionData(g1);
	setPositionData(g1);
	//setTimeout(()=>setPositionData(g1),1000);

	g1.cy.mount(dPink);
	setTimeout(()=>g1.center(),100);

	//working tests!
	// let nodes = g1.getNodes();
	// console.log('nodes',nodes);
	// let n=g1.getNode('a');console.log('n',n);
	// n.position({x:100,y:100});
	// setTimeout(()=>n.position({x:10,y:200}),1000);
	// setTimeout(()=>makeNewLayout(g1),3000);

	//old API
	// cyGraph(mBy('cy'), styleDict, elements);
	// cyClickNode(id=>console.log('clicked',id))
}
function makeNewLayout(g1){
	let nodes = g1.getNodes();
	let x=10; let y=10;
	for(n of nodes){
		n.position({x:x,y:y});
		x+=50;y+=50;if (y>250){y=10;}if (x>550){x=10;}
	}
}

function setPositionData(g1){
	let ids = g1.getNodeIds();
	for(const id of ids){
		let pos = g1.getProp(id,'center');
		g1.setPosition(id,pos.x,pos.y);
	}
}
function storePositionData(g1){
	let ids = g1.getNodeIds();
	let x=10; let y=10;
	for(const id of ids){
		g1.setProp(id,'center',{x:x,y:y});
		x+=50;y+=50;if (y>250){y=10;}if (x>550){x=10;}
	}
}
