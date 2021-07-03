
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
	cose() { this.cy.layout({ name: 'cose' }).run(); }
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
function onClickCose() { for (const g of MGraph.All) g.cose(); }

function onClickTogglePan() { for (const g of MGraph.All) { let on = g.isPan(); g.pan(!on); } }
function onClickToggleZoom() { for (const g of MGraph.All) { let on = g.isZoom(); g.zoom(!on); } }
























