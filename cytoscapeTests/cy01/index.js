var cy, idx = 6, Result;
const Names = 'abcdefghijklmnopqrstuvwxyz';
window.onload = start;
window.onmouseup = ev => {
	if (ev.shiftKey) {
		let n = addNode({ id: Names[idx] }, getPosRelTo(mBy('cy'), { x: ev.clientX, y: ev.clientY }));
		console.log('node', n)
		idx += 1;
	} else if (ev.altKey) {
		testOutputCollections();
	}
};
window.onkeydown = e => {
	if (e.ctrlKey && e.key === 's') {
		e.preventDefault();
		// Place your code here
		testOutputCollections();
		console.log('CTRL + S');
	}
};

function testOutputCollections() {
	console.log('alt key pressed!!!');
	let coll = Result = getNodes(x => { console.log('inside', x, x.id()); return x.id() <= 'g' });
	console.log(coll);

	console.log(
		'____ functions on collections\nlen', coll.length,
		'\nid,map', coll.map(x => x.id()),
		'\nfilter,isNode', coll.filter(x => x.isNode()).map(x => x.id()),
		'\nisEdge,id<g', coll.filter(x => x.isEdge() && x.id() <= 'c').map(x => x.id()),

	);

}
function start() {
	cy = cytoscape({
		container: document.getElementById('cy'),

		elements: [
			{ data: { id: 'a' }, position: { x: 10, y: 10 } },
			{ data: { id: 'b' }, position: { x: 10, y: 50 } },
			{ data: { id: 'c' }, position: { x: 10, y: 90 } },
			{ data: { id: 'd' }, position: { x: 50, y: 50 } },
			// { data: { id: 'e' } },
			// { data: { id: 'f' } },
			{ data: { id: 'ab', source: 'a', target: 'b' } },
			{ data: { id: 'ac', source: 'a', target: 'c' } },
			{ data: { id: 'bc', source: 'b', target: 'c' } },
		],

		style: [
			{
				selector: 'node',
				style: {
					'background-color': 'red', //color of node
					"color": "#fff", //color of text [black]
					'label': 'data(id)', 
					// 'content': 'data(id)', //same as label?
					"text-valign": "center", //sonst wird label ober node gemacht
    			"text-halign": "center",
				}
			},

			{
				selector: 'edge',
				style: {
					'width': 3,
					'background-color': 'blue',
					'color':'white',
					'line-color': 'blue',
					'target-arrow-color': 'blue',
					'target-arrow-shape': 'triangle',
					'curve-style': 'bezier',
					'label': 'data(id)',
					// "text-valign": "top", //geht nicht bei edge!
    			// "text-halign": "center",
				}
			}
		],

		zoomingEnabled: false,
		userZoomingEnabled: false,
		panningEnabled: false,
		userPanningEnabled: false,
		// layout: {
		// 	name: 'preset',
		// }
	});
	selectedNodes = cy.collection();

	cy.ready(testOutputCollections);
}

function startAllOptions() {
	cy = cytoscape({

		container: document.getElementById('cy'),

		elements: [
			// { data: { id: 'a' } },
			// { data: { id: 'b' } },
			// { data: { id: 'c' } },
			// { data: { id: 'd' } },
			// { data: { id: 'e' } },
			// { data: { id: 'f' } },
			// { data: { id: 'ab', source: 'a', target: 'b' } },
			// { data: { id: 'ac', source: 'a', target: 'c' } },
			// { data: { id: 'bf', source: 'b', target: 'f' } },
		],

		style: [
			{
				selector: 'node',
				style: {
					'background-color': 'red',
					'label': 'data(id)'
				}
			},

			{
				selector: 'edge',
				style: {
					'width': 3,
					'line-color': 'blue',
					'target-arrow-color': 'blue',
					'target-arrow-shape': 'triangle',
					'curve-style': 'bezier'
				}
			}
		],

		// layout: {
		//   name: 'grid',
		//   rows: 1
		// }

		data: { /* ... */ },

		// initial viewport state:
		zoom: 1,
		pan: { x: 0, y: 0 },

		// interaction options:
		minZoom: .5,
		maxZoom: 1,
		zoomingEnabled: false,
		userZoomingEnabled: true,
		panningEnabled: true,
		userPanningEnabled: true,
		boxSelectionEnabled: true,
		selectionType: 'single',
		touchTapThreshold: 8,
		desktopTapThreshold: 4,
		autolock: false,
		autoungrabify: false,
		autounselectify: false,

		// rendering options:
		headless: false,
		styleEnabled: true,
		hideEdgesOnViewport: false,
		textureOnViewport: false,
		motionBlur: false,
		motionBlurOpacity: 0.2,
		//wheelSensitivity: 1,
		pixelRatio: 'auto'
	});


}



