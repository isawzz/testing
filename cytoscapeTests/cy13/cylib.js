var cy, Result;
// const NodeNames = 'abcdefghijklmnopqrstuvwxyz';
// const SelectedNodes = [];

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

function getNodeCount() { return cy.nodes().length; }
function getNodeIds() { return cy.nodes().map(x => x.id()); }

function toggleSelection(ele) { if (ele.data().selected) unselectNode(ele); else selectNode(ele); }
function selectNode(ele) { ele.addClass('highlight'); addIf(SelectedNodes, ele.id()); ele.data().selected = true; }
function unselectNode(ele) { ele.removeClass('highlight'); removeInPlace(SelectedNodes, ele.id()); ele.data().selected = false; }
function updateGraph() {
	onNodeClickToggleSelection();
	cy.reset();
	testOutputCollections();
}










