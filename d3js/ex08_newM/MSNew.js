function msBase(id){
	let ms = new MS();
	ms.id = isdef(id)?id:getUID();
	UIS[ms.id]=ms;
	return ms;
}
function msElem(cat,domType){
	
}
function msDiv(id,idParent='root'){
	let ms = msBase(id);

	//if elem w/ id exists take that as elem
	let el = d3.select()

}

function makeG(idParent){}
function makeM(idParent) {
	initMSRoot();
	let shapes = {
		rect: ['rect', 'square', 'roundedRect'],
		ellipse: ['ellipse', 'circle'],
		polygon: ['poly', 'triangle', 'triangleUpdown', 'hex', 'hexFlat'],
		text: ['picto', 'text', 'multitext'],
		image: ['image'],
		line: ['line']
	};
	let ms = new MS();
	ms.id = getUID();
	ms.idParent = 'root';
	UIS[ms.id]=ms;
	//domType und cat














	return ms;
}

var UIS=null;
function initMSRoot(selector='body') {
	if (UIS) return;
	let msRoot = new MS();
	msRoot.id = 'root';
	msRoot.selector = selector;
	msRoot.d3 = d3.select(selector);
	msRoot.elem = msRoot.d3.node();
	UIS={};
	UIS['root']=msRoot;
}
class MS {
	constructor() {


	}
	attach() { }
	detach() { }
	clear() { }
	destroy() { }

	addClickHandler() { }
	addMouseEnterHandler() { }
	addMouseLeaveHandler() { }
	removeHandlers() { }

	show() { }
	hide() { }
	high() { }
	unhigh() { }
	frame() { }
	unframe() { }

	setShape() { }
	setBg() { }
	setFg() { }
	setPos() { }
	setSize() { }
	setScale() { }
	setRot() { }


}

//#region maybe
class extras {
	getShape() { }
	getBg() { }
	getFg() { }
	getPos() { }
	getCenter() { }
	getLeft() { }
	getRight() { }
	getTop() { }
	getBottom() { }
	getSize() { }
	getW() { }
	getH() { }
	getScale() { }
	getRot() { }
}
//#endregion