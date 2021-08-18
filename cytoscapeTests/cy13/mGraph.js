
class MGraph {
	static All = [];
	static SelectedNodes = [];
	static NodeNames = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	static NodeIds = [];
	constructor(dParent, styleDict, els) {
		//console.log('elements',els)
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
		this.cy = cytoscape(options);
		this.id = dParent.id;
		iAdd(this, { div: dParent });
		MGraph.All.push(this);
	}
	//#region pan zoom center fit
	center() { this.cy.center(); this.cy.fit(); }
	reset() { this.pan0(); this.zoom1(); this.center(); }
	pan0() { this.cy.pan({ x: 0, y: 0 }); }
	zoom1() { this.cy.zoom(1); }

	isPan() { return this.cy.panningEnabled(); }
	isZoom() { return this.cy.zoomingEnabled(); }

	pan(isOn, reset = true) {
		this.cy.panningEnabled(isOn);
		this.cy.userPanningEnabled(isOn);
		if (!isOn && reset) { this.pan0(); this.center(); }
	}
	zoom(isOn, minZoom = .25, maxZoom = 1, reset = true) {
		this.cy.zoomingEnabled(isOn);
		this.cy.userZoomingEnabled(isOn);
		if (!isOn && reset) { this.zoom1(); this.center(); }
		else if (isOn) { this.cy.minZoom(minZoom); this.cy.maxZoom(maxZoom); }
	}
	//#endregion

	getNode(id) { return this.cy.getElementById(id); }
	getNodes() { return this.cy.nodes(); }
	getNodeIds() { return this.cy.nodes().map(x => x.id()); }
	getNodeData() { return this.cy.nodes().map(x => x.data()); }
	getNodePositions() { return this.cy.nodes.map(x => x.position()); }
	setPosition(id, x, y) { this.cy.getElementById(id).position({ x: x, y: y }); }
	setProp(id, prop, val) { this.cy.getElementById(id).data()[prop] = val; }
	getProp(id, prop) { return this.cy.getElementById(id).data()[prop]; }

	addNode(data, coords) {
		if (nundef(data.id)) data.id = getNodeName();
		coords.x -= this.cy.pan().x;
		coords.y -= this.cy.pan().y;
		var ele = this.cy.add({
			group: 'nodes',
			data: data,
			position: coords
		});
		return ele;
	}
	addEdge(nid1, nid2, data) {
		data.id = nid1 + nid2;
		data.source = nid1;
		data.target = nid2;
		var ele = this.cy.add({
			group: 'edges',
			data: data,
		});
		return ele;
	}
	breadthfirst() { this.cy.layout({ name: 'breadthfirst', animate: true }).run(); }
	circle() { this.cy.layout({ name: 'circle', animate: 'end' }).run(); }
	concentric() { this.cy.layout({ name: 'concentric', animate: true }).run(); }
	cose() { this.cy.layout({ name: 'cose', animate: 'end' }).run(); }
	fcose() {
		var defaultOptions = {

			// 'draft', 'default' or 'proof' 
			// - "draft" only applies spectral layout 
			// - "default" improves the quality with incremental layout (fast cooling rate)
			// - "proof" improves the quality with incremental layout (slow cooling rate) 
			quality: "default",
			// Use random node positions at beginning of layout
			// if this is set to false, then quality option must be "proof"
			randomize: true,
			// Whether or not to animate the layout
			animate: true,
			// Duration of animation in ms, if enabled
			animationDuration: 500,
			// Easing of animation, if enabled
			animationEasing: undefined,
			// Fit the viewport to the repositioned nodes
			fit: true,
			// Padding around layout
			padding: 30,
			// Whether to include labels in node dimensions. Valid in "proof" quality
			nodeDimensionsIncludeLabels: false,
			// Whether or not simple nodes (non-compound nodes) are of uniform dimensions
			uniformNodeDimensions: false,
			// Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
			packComponents: true,
			// Layout step - all, transformed, enforced, cose - for debug purpose only
			step: "all",

			/* spectral layout options */

			// False for random, true for greedy sampling
			samplingType: true,
			// Sample size to construct distance matrix
			sampleSize: 25,
			// Separation amount between nodes
			nodeSeparation: 75,
			// Power iteration tolerance
			piTol: 0.0000001,

			/* incremental layout options */

			// Node repulsion (non overlapping) multiplier
			nodeRepulsion: node => 4500,
			// Ideal edge (non nested) length
			idealEdgeLength: edge => 50,
			// Divisor to compute edge forces
			edgeElasticity: edge => 0.45,
			// Nesting factor (multiplier) to compute ideal edge length for nested edges
			nestingFactor: 0.1,
			// Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
			numIter: 2500,
			// For enabling tiling
			tile: true,
			// Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
			tilingPaddingVertical: 10,
			// Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
			tilingPaddingHorizontal: 10,
			// Gravity force (constant)
			gravity: 0.25,
			// Gravity range (constant) for compounds
			gravityRangeCompound: 1.5,
			// Gravity force (constant) for compounds
			gravityCompound: 1.0,
			// Gravity range (constant)
			gravityRange: 3.8,
			// Initial cooling factor for incremental layout  
			initialEnergyOnIncremental: 0.3,

			/* constraint options */

			// Fix desired nodes to predefined positions
			// [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
			fixedNodeConstraint: undefined,
			// Align desired nodes in vertical/horizontal direction
			// {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
			alignmentConstraint: undefined,
			// Place two nodes relatively in vertical/horizontal direction
			// [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
			relativePlacementConstraint: undefined,

			/* layout event callbacks */
			ready: () => { }, // on layoutready
			stop: () => { }, // on layoutstop
			name: 'fcose',
		};
		this.cy.layout(defaultOptions).run(); //{name: 'fcose'}).run(); 
	}
	gridLayout() { this.cy.layout({ name: 'grid', animate: true }).run(); }
	presetLayout() { this.cy.layout({ name: 'preset' }).run(); }
	randomLayout() { this.cy.layout({ name: 'random', animate: true }).run(); }

	klay() {
		var options = {
			nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
			fit: true, // Whether to fit
			padding: 20, // Padding on fit
			animate: true, // Whether to transition the node positions
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
		this.cy.layout(options).run();
	}

}

function getNodeName() {
	let ids = MGraph.NodeIds;
	let letters = lettersToArray(MGraph.NodeNames);
	let newName = firstCond(letters, x => !ids.includes(x));
	ids.push(newName)
	//console.log('next node name is', newName);
	return newName;
}
function getSampleStyle() {
	let styleDict = {
		node: {
			'background-color': 'red', //color of node
			"color": "#fff", //color of text [black]
			'label': 'data(id)',
			"text-valign": "center", //sonst wird label ober node gemacht
			"text-halign": "center",
		},
		edge: {
			'width': 2,
			'line-color': 'blue',
			'curve-style': 'bezier'
		}
	};
	return styleDict;
}
function getSampleData(nNodes, nEdges) {
	let elements = [], x = 20, y = 70;
	for (let i = 0; i < nNodes; i++) {
		let id = getNodeName();
		let el = { data: { id: id }, position: { x: x, y: i % 2 ? y - 40 : y + 40 } };
		elements.push(el);
		x += 50; if (x > 300) { x = 20; y += 140; }
	}
	let combis = [];
	let nodeIds = elements.map(x => x.data.id);

	for (const id1 of nodeIds) {
		for (const id2 of nodeIds) {
			if (id1 == id2 || combis.includes(id2 + id1)) continue;
			combis.push(id1 + id2);
		}
	}
	let edgeIds = choose(combis, nEdges);
	//console.log('edge names',edgeIds);
	for (const id of edgeIds) {
		let el = { data: { id: id, source: id[0], target: id[1] } };
		elements.push(el);
	}
	return elements;
}
function getGraph(id) { return Items[id]; }
function onClickReset() { for (const g of MGraph.All) { g.reset(); } }
function onClickBreadthfirst() { for (const g of MGraph.All) g.breadthfirst(); }
function onClickCircle() { for (const g of MGraph.All) g.circle(); }
function onClickConcentric() { for (const g of MGraph.All) g.concentric(); }
function onClickCose() { for (const g of MGraph.All) g.cose(); }
function onClickFCose() { for (const g of MGraph.All) g.fcose(); }
function onClickGrid() { for (const g of MGraph.All) g.gridLayout(); }
function onClickKlay() { for (const g of MGraph.All) g.klay(); }
function onClickPreset() { for (const g of MGraph.All) g.presetLayout(); }
function onClickRandom() { for (const g of MGraph.All) g.randomLayout(); }

function onClickTogglePan() { for (const g of MGraph.All) { let on = g.isPan(); g.pan(!on); } }
function onClickToggleZoom() { for (const g of MGraph.All) { let on = g.isZoom(); g.zoom(!on); } }
























