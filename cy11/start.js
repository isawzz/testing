window.onload = start;

function start() {
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
	}
	let elements = [
		{ data: { id: 'a' }, position: { x: 10, y: 10 } },
		{ data: { id: 'b' }, position: { x: 10, y: 50 } },
		{ data: { id: 'c' }, position: { x: 10, y: 90 } },
		{ data: { id: 'd' }, position: { x: 50, y: 50 } },
		{ data: { id: 'ab', source: 'a', target: 'b' } },
		{ data: { id: 'ac', source: 'a', target: 'c' } },
		{ data: { id: 'bc', source: 'b', target: 'c' } },
	];
	cyGraph(mBy('cy'), styleDict, elements);
	cyClickNode(id=>console.log('clicked',id))
}

function start_dep() {

	cy = cytoscape({
		container: document.getElementById('cy'),

		elements: [
			{ data: { id: 'a' }, position: { x: 10, y: 10 } },
			{ data: { id: 'b' }, position: { x: 10, y: 50 } },
			{ data: { id: 'c' }, position: { x: 10, y: 90 } },
			{ data: { id: 'd' }, position: { x: 50, y: 50 } },
			{ data: { id: 'ab', source: 'a', target: 'b' } },
			{ data: { id: 'ac', source: 'a', target: 'c' } },
			{ data: { id: 'bc', source: 'b', target: 'c' } },
		],

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
	});

	cy.ready(activateEvents);
}
function activateEvents() {
	//hier will ich es systematischer!


	cy.on('click', 'node', ev => {
		console.log('click node');
		ev.cancelBubble = true;

		ev.preventDefault();
		ev.stopPropagation(); return;
		if (!ev.shiftKey) toggleSelection(ev.target);
	});
	window.onclick = ev => {
		console.log('click window'); return;
		if (ev.shiftKey) {
			if (SelectedNodes.length >= 2) {
				let n = addEdge(SelectedNodes[0], SelectedNodes[1], {});
				console.log('edge', n.id(), 'added');
			} else {
				let n = addNode({}, getPosRelTo(mBy('cy'), { x: ev.clientX, y: ev.clientY }));
				console.log('node', n.id(), 'added');
			}
		}
	};
	// window.onkeydown = e => {
	// 	if (e.ctrlKey && e.key === 'f') {
	// 		e.preventDefault();
	// 		//updateGraph();
	// 	}
	// };

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



