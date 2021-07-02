var cy = cytoscape({

	container: document.getElementById('cy'), 

	elements: [ 
		{ data: { id: 'a' } },
		{ data: { id: 'b' } },
		{ data: { id: 'c' } },
		{ data: { id: 'd' } },
		{ data: { id: 'e' } },
		{ data: { id: 'f' } },
		{ data: { id: 'ab', source: 'a', target: 'b' } },
		{ data: { id: 'ac', source: 'a', target: 'c' } },
		{ data: { id: 'bf', source: 'b', target: 'f' } },
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

});