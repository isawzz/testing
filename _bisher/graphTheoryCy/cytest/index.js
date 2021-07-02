var cy;
window.onload = start;
function start() {

	let nodes = [
		{ data: { id: 'a' } },
		{ data: { id: 'b' } },
		{ data: { id: 'c' } },
		{ data: { id: 'd' } },
		{ data: { id: 'e' } }
	];

	let edges = [
		{ data: { id: 'ae', weight: 1, source: 'a', target: 'e' } },
		{ data: { id: 'ab', weight: 3, source: 'a', target: 'b' } },
		{ data: { id: 'be', weight: 4, source: 'b', target: 'e' } },
		{ data: { id: 'bc', weight: 5, source: 'b', target: 'c' } },
		{ data: { id: 'ce', weight: 6, source: 'c', target: 'e' } },
		{ data: { id: 'cd', weight: 2, source: 'c', target: 'd' } },
		{ data: { id: 'de', weight: 7, source: 'd', target: 'e' } }
	];

	makeGraph(mBy('cy'), nodes, edges);
}
function makeGraph(dParent, vertices, edges) {
	_convertToCy(dParent, vertices, edges);
	cy.fit();
	cy.center();
}
function _convertToCy(dParent, vertices, edges) {
	let d = mDiv(dParent);
	mStyleX(dParent, { w: '90%', h: '90%', margin: 'auto', padding: 20, bg: 'green' });
	mStyleX(d, { w: '100%', h: '100%' });

	let elements = { nodes: [], edges: [] };
	for (const v of vertices) { elements.nodes.push(v); }
	for (const e of edges) { elements.nodes.push(e); }

	//console.log(elements.edges); // each element must have id!

	//return;
	cy = cytoscape({
		container: d,
		elements: elements,
		style: [
			{
				selector: 'node',
				style: {
					'label': 'data(id)',
					'background-color': 'red'
				}
			},
			{
				selector: 'edge',
				style: {
					'label': 'data(id)',
					'target-arrow-shape': 'triangle',
					'width': 4,
					'line-color': '#ddd',
					'target-arrow-color': '#ddd'
				}
			}
		],
		layout: { name: 'grid', },
	});
}










function muell() {


	cy = cytoscape({
		container: mBy('cy'),
		style: cytoscape.stylesheet()
			.selector('node')
			.css({
				'content': 'data(id)'
			})
			.selector('edge')
			.css({
				'target-arrow-shape': 'triangle',
				'width': 4,
				'line-color': '#ddd',
				'target-arrow-color': '#ddd'
			})
			.selector('.highlighted')
			.css({
				'background-color': '#61bffc',
				'line-color': '#61bffc',
				'target-arrow-color': '#61bffc',
				'transition-property': 'background-color, line-color, target-arrow-color',
				'transition-duration': '0.5s'
			}),

		elements: {
			nodes: [
				{ data: { id: 'a' } },
				{ data: { id: 'b' } },
				{ data: { id: 'c' } },
				{ data: { id: 'd' } },
				{ data: { id: 'e' } }
			],

			edges: [
				{ data: { id: 'ae', weight: 1, source: 'a', target: 'e' } },
				{ data: { id: 'ab', weight: 3, source: 'a', target: 'b' } },
				{ data: { id: 'be', weight: 4, source: 'b', target: 'e' } },
				{ data: { id: 'bc', weight: 5, source: 'b', target: 'c' } },
				{ data: { id: 'ce', weight: 6, source: 'c', target: 'e' } },
				{ data: { id: 'cd', weight: 2, source: 'c', target: 'd' } },
				{ data: { id: 'de', weight: 7, source: 'd', target: 'e' } }
			]
		},

		// layout: {
		// 	name: 'grid',
		// 	directed: true,
		// 	roots: '#a',
		// 	padding: 10
		// },

		ready: function () {

			p = cy.elements().aStar({ root: 'a', goal: 'd', directed: true }).path;
			if (p) {
				p.filter(function (i, x) { return x != source_node && x != target_node; })
					.addClass('path_element');

				p.edgesWith(p)
					.addClass('path_element');
			}
			// window.cy = this;

			// var bfs = cy.elements().bfs('#a', function(){}, true);

			// var i = 0;
			// var highlightNextEle = function(){
			// 	bfs.path[i].addClass('highlighted');

			// 	if( i < bfs.path.length ){
			// 		i++;
			// 		setTimeout(highlightNextEle, 1000);
			// 	}
			// };

			// // kick off first highlight
			// highlightNextEle();
		}
	});

}
