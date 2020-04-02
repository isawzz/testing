//#region _work
function getNodeUid(node){return node.ui.id;}
function presentCardHand(omap,node) {
	let size = CARD_SZ;
	let [w, h, gap] = [size * .66, size, 4];

	// *** stage 1: convert objects into uis ***
	let pool=getDefaultPool();
	let olist = mapOMap(omap, pool);
	if (isEmpty(olist)) return null;
	let uis = getUis(olist, sizedCard123(w, h));

	//TODO: if any cards are present: need to create corresponding mks and link them to oid (because care correspond to objects and resources dont!!!)

	//console.log(loc)
	let loc=getNodeUid(node);
	let area = stage2_prepArea(loc);
	console.log(area)
	
	clearElement(area)
	mNull(area,'class');
	mNull(area,'style');
	mSize(area,w+10,h+10);
	mColor(area,'blue')
	// mClass(area,null);

	let container = stage3_prepContainer(area); mColor(container, 'red')

	//TODO: shall I create an mk for container??? not needed in step_from_scratch!!!! because hand does not need to be highlighted
	//TODO: naeher testen und ueberlegen ob das auch stimmt wenn ein object fuer hand existiert (market.neutral)

	stage4_layout(uis, container, w, h, gap, layoutHand);
}


function populate(ggg,container,omap){

	presentCardHand(omap,container.oInfo);
	return;

	let node = container.oInfo;
	console.log('node',node)

	//zuerst fill content into ui
	//dont worry about info nodes!
	let oids = getElements(omap);
	console.log(oids);
	let uiContainer=node.ui;
	//uiContainer.padding='auto';
	//addClass(uiContainer,'centerCentered');
	// uiContainer.style.justifyContent = 'center';
	// uiContainer.style.alignContent = 'center';
	// uiContainer.style.flexDirection = 'row';
	clearElement(uiContainer);
	let d=mDiv(uiContainer);

	for(const oid of oids){
		// in wirklichkeit waer das jetzt ein info node!
		//aber info nodes gibt es noch nicht
		let o=getObject(oid);
		console.log(o);
		let sz=50;
		let uiCard=cardFace({rank:o.short_name},sz*.66,sz);
		//uiCard.style.display = 'inline-box';
		// uiCard.style.margin='10px';
		console.log(uiCard)
		mAppend(d,uiCard);
		// let s='wwwwwwwwwwww wwaaaaaaaaaaaa aaaaaaaDDDDDDDDDDD dasdasd dddddddddddddddd dasdddddddddd trettttttt WWWWWWWWWWWW DDDDDDDDDDDDDDDDDDDDDDDDD GGGGGGGGGGGGGGGGGGGG DDDDDDDDDDDDDDDDDDDDDDDD fffffffffffffsd dddddddddddd';
		// uiContainer.innerHTML=s.repeat(3);
	}


}
















