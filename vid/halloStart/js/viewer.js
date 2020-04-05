function showViewer(N) {
	let viewer = createViewer('tabs');
	// console.log(viewer)
	//let numViews = 6;
	for (let n = 0; n < N; n++) {
		let rootName = 'root0' + (n+1);
		let vName = createView(viewer, rootName);
		let result = G[rootName] = parseSpecRoot(rootName, SPEC, ['staticSpec', rootName]);
		console.log('root0' + n, result,'\n ');
	}
}
function createViewer(areaName) {
	let viewerArea = 'tabs';
	let d = mBy(viewerArea);
	clearElement(d);
	mFlexWrap(d);
	mFlexCenterContent(d);
	return d;
}
function createView(dViewer, rootName) {
	//let viewer=mBy(viewerName);
	let d = mDiv(dViewer);
	mStyle(d, { margin: 10 });
	mColor(d, 'white', 'black')
	let title = mDiv(d);
	title.innerHTML = rootName;
	let body = mDiv(d);
	body.id = rootName;
	mMinSize(body, 4, 3, 'cm');
	return body;
}

function parseSpecRoot(areaName, spec, keys) {
	trace(areaName, keys);

	let gg = {};
	let eigeneSpec = gg.root = jsCopy(lookup(spec, keys)); //copy of branch spec
	gg.spec = spec;
	gg.keys = keys;
	gg.id = areaName;
	gg.info = {};
	gg.areas = {};

	staticArea(gg, areaName, eigeneSpec);
	addIdToAreaDict(gg, 'root', eigeneSpec);

	UI[areaName] = gg; //global root dict

	return gg;
}













