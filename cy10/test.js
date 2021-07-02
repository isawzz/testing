function testOutputCollections() {
	console.log('alt key pressed!!!');
	let coll = Result = getNodes(x => { console.log('inside', x, x.id()); return x.id() <= 'g' });
	console.log(coll);

	console.log(
		'____ functions on collections\nlen', coll.length,
		'\nid,map', coll.map(x => x.id()),
		'\nfilter,isNode', coll.filter(x => x.isNode()).map(x => x.id()),
		'\nisEdge,id<g', coll.filter(x => x.isEdge() && x.id() <= 'c').map(x => x.id()),
		'\ngetNodeCount',getNodeCount(),
	);

}

