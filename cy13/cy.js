function cyGraph(dParent, styleDict = {}, els = []) {
	let options = {};
	if (isdef(dParent)) options.container = dParent;

	//#region extend styleDict based on defStyleDict
	let defStyleDict = {
		node: { 'background-color': 'red', "color": "#fff", 'label': 'data(id)', "text-valign": "center", "text-halign": "center", },
		edge: { 'width': 2, 'line-color': 'blue', 'curve-style': 'bezier', },
		'node.highlight': { 'background-color': 'yellow' },
		'node.semitransp': { 'opacity': '0.5' },
	}
	for (const k in styleDict) {
		if (isdef(defStyleDict)) addKeys(defStyleDict[k], styleDict[k]);
	}
	addKeys(defStyleDict, styleDict);
	//#endregion

	let style = [];
	for (const k in styleDict) { style.push({ selector: k, style: styleDict[k] }); }
	options.style = style;

	options.elements = els;

	let defOptions = {
		maxZoom: 1,
		minZoom: .2,
		motionBlur: true,
		wheelSensitivity: 0.05,
		zoomingEnabled: true,
		userZoomingEnabled: true,
		panningEnabled: true,
		userPanningEnabled: true,
		boxSelectionEnabled: false,
		layout: { name: 'preset' }

	};
	addKeys(defOptions, options);
	cy = cytoscape(options);
}
function cyRemoveClickHandler() { cy.unbind('click'); }
function cyClickEdgeNode(nodeHandler, edgeHandler) {
	cy.unbind('click');
	cy.bind('click', 'node,edge', ev => { if (ev.target.isEdge()) edgeHandler(ev.target.id()); else nodeHandler(ev.target.id()) });
}
function cyClickEdge(handler) {
	cy.unbind('click');
	cy.bind('click', 'edge', ev => handler(ev.target.id()));
}
function cyClickNode(handler) {
	cy.unbind('click');
	cy.bind('click', 'node', ev => handler(ev.target.id()));
}
function cyPanOn() {
	cy.panningEnabled(true);
	cy.userPanningEnabled(true);
}
function cyPanOff(reset = true) {
	if (reset) { cyResetPan(); cy.center(); }
	cy.panningEnabled(false);
	cy.userPanningEnabled(false);
}
function cyPanToggle(reset = true) { if (cy.panningEnabled()) cyPanOff(); else cyPanOn(); }
function cyReset() { cyCenterFitReset(); }
function cyCenterFitReset() { cyResetPan(); cyResetZoom(); cy.fit(); cy.center(); }
function cyResetPan() { cy.pan({ x: 0, y: 0 }); }
function cyResetZoom() { cy.zoom(1); }
function cyZoomOn(minZoom, maxZoom = 1) {
	cy.zoomingEnabled(true);
	cy.userZoomingEnabled(true);
	cy.minZoom(minZoom);
	cy.maxZoom(maxZoom);
}
function cyZoomOff(reset = true) {
	if (reset) { cyResetZoom(); cy.fit(); }
	cy.zoomingEnabled(false);
	cy.userZoomingEnabled(false);
}
function cyZoomToggle(reset = true) { if (cy.zoomingEnabled()) cyZoomOff(); else cyZoomOn(); }

function addEdge(nid1, nid2) {
}
function removeNode(id) { var j = cy.$('#' + id); cy.remove(j); }
function removeNodes(idlist) {
	var collection = cy.elements('node[weight > 50]');
	cy.remove(collection);

	cy.remove('node[weight > 50]'); // remove nodes with weight greater than 50
}
function addNodes(o) {
	var eles = cy.add([
		{ group: 'nodes', data: { id: 'n0' }, position: { x: 100, y: 100 } },
		{ group: 'nodes', data: { id: 'n1' }, position: { x: 200, y: 200 } },
		{ group: 'edges', data: { id: 'e0', source: 'n0', target: 'n1' } }
	]);
}
function addNode(data, coords) {
	if (nundef(data.id)) data.id = getNodeName();
	coords.x -= cy.pan().x;
	coords.y -= cy.pan().y;
	var ele = cy.add({
		group: 'nodes',
		data: data,
		position: coords
	});
	return ele;
}
function addEdge(nid1, nid2, data) {
	data.id = nid1+nid2;
	data.source= nid1;
	data.target= nid2;
	var ele = cy.add({
		group: 'edges',
		data: data,
	});
	return ele;
}

function getNode(id) {
	return cy.getElementById(id);
	return cy.$id(id);
}
function getNodes(func) {
	let collection = cy.filter((ele, i, eles) => func(ele));
	//console.log(collection);
	return collection;
}
function getPosRelTo(elem, pos) {
	let rect = getRect(elem);
	pos.x -= rect.x;
	pos.y -= rect.y;
	return pos;
}

var selectedNodes;

function onNodeClickToggleSelection(){
	cy.nodes().on('click', e => {
		let n = e.target;
		console.log('click',n.id())
		n.style.backgroundColor = 'yellow';//addClass('yellow');
		// let id = n.id();
		// console.log('click', e.target.id());
		// var clickedNode = e.target;
		// selectedNodes = selectedNodes.union(clickedNode);

		// let n2 = getNode(id);
		// console.log(id, n2.id(), n == n2); //yes! getNode returns a node!
		//how to get length of collection?

	});
}
function onNodeClickSelectNodePair() {
	cy.nodes().on('click', e => {
		let n = e.target;
		let id = n.id();
		console.log('click', e.target.id());
		var clickedNode = e.target;
		selectedNodes = selectedNodes.union(clickedNode);

		let n2 = getNode(id);
		console.log(id, n2.id(), n == n2); //yes! getNode returns a node!
		//how to get length of collection?

	});
}
function relayout(layoutName,options={}){
	cyLayout({name:'cose'}); return;
	if (layoutName == 'klay') {reklayout(); return;}

	if (nundef(layoutName)) layoutName = 'cose';// circle | breadthfirst | concentric
	options.name = layoutName;

	cy.layout(options).run();//cy.center();

}
function reklayout(){
	var options = {
		nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
		fit: true, // Whether to fit
		padding: 20, // Padding on fit
		animate: false, // Whether to transition the node positions
		animateFilter: function (node, i) { return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
		animationDuration: 500, // Duration of animation in ms if enabled
		animationEasing: undefined, // Easing of animation if enabled
		transform: function (node, pos) { return pos; }, // A function that applies a transform to the final node position
		ready: undefined, // Callback on layoutready
		stop: undefined, // Callback on layoutstop
		klay: {
			// Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
			addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
			aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
			borderSpacing: 20, // Minimal amount of space to be left to the border
			compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
			crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
			/* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
			INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
			cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
			/* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
			INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
			direction: 'UNDEFINED', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
			/* UNDEFINED, RIGHT, LEFT, DOWN, UP */
			edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
			edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
			feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
			fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
			/* NONE Chooses the smallest layout from the four possible candidates.
			LEFTUP Chooses the left-up candidate from the four possible candidates.
			RIGHTUP Chooses the right-up candidate from the four possible candidates.
			LEFTDOWN Chooses the left-down candidate from the four possible candidates.
			RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
			BALANCED Creates a balanced layout from the four possible candidates. */
			inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
			layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
			linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
			mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
			mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
			nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
			/* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
			LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
			INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
			nodePlacement: 'BRANDES_KOEPF', // Strategy for Node Placement
			/* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
			LINEAR_SEGMENTS Computes a balanced placement.
			INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
			SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
			randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
			routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
			separateConnectedComponents: true, // Whether each connected component should be processed separately
			spacing: 20, // Overall setting for the minimal amount of space to be left between objects
			thoroughness: 7 // How much effort should be spent to produce a nice layout..
		},
		name: 'klay',

		priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
	};
	cy.layout(options).run();

}

//#region muell
function hallo() {
	let o = {
		container: document.getElementById('cy'),

		elements: [],

		style: [
			//node styles
			{
				selector: 'node',
				style: {
					'background-color': 'red', //color of node
					"color": "#fff", //color of text [black]
					'label': 'data(id)',
					"text-valign": "center", //sonst wird label ober node gemacht
					"text-halign": "center",
				}
			},
			{ selector: 'node.highlight', style: { 'background-color': 'yellow' } },
			{ selector: 'node.semitransp', style: { 'opacity': '0.5' } },
			//edge styles
			{ selector: 'edge', style: { 'width': 2, 'line-color': 'blue', 'curve-style': 'bezier', } },
		],

		maxZoom: 1,
		minZoom: .2,
		motionBlur: true,
		wheelSensitivity: 0.05,
		zoomingEnabled: true,
		userZoomingEnabled: true,
		panningEnabled: true,
		userPanningEnabled: true,
		layout: { name: 'preset' }
	};


}









