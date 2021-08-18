
function layoutCose() {
	let layout = {
		name: 'cose',
		idealEdgeLength: 100,
		nodeOverlap: 20,
		refresh: 20,
		fit: true,
		padding: 30,
		randomize: false,
		componentSpacing: 100,
		nodeRepulsion: 400000,
		edgeElasticity: 100,
		nestingFactor: 5,
		gravity: 80,
		numIter: 1000,
		initialTemp: 200,
		coolingFactor: 0.95,
		minTemp: 1.0
	};
	cy.layout(layout).run();

}

async function cyLayout(myLayoutOptions) {
	const clone = obj => Object.assign({}, obj);
	const savePos1 = n => n.scratch('_layoutPos1', clone(n.position()));
	const savePos2 = n => n.scratch('_layoutPos2', clone(n.position()));
	const restorePos1 = n => n.position(n.scratch('_layoutPos1'));
	const getPos2 = n => n.scratch('_layoutPos2');

	cy.startBatch();

	const nodes = cy.nodes();
	const layout = cy.layout(myLayoutOptions); // n.b. animate:false
	const layoutstop = layout.promiseOn('layoutstop');

	nodes.forEach(savePos1);

	layout.run();

	await layoutstop;

	nodes.forEach(savePos2);

	nodes.forEach(restorePos1);

	cy.endBatch();

	cy.layout({
		name: 'preset',
		animate: true,
		positions: getPos2,

		// specify zoom and pan as desired
		//zoom: 1,
		//pan: { x: 300, y: 200 },
	}).run();
	//cy.fit();
	//cy.center();
}
