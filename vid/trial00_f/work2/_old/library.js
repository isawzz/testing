














//#region primitives
function pictoLabelDiv(key, label, color = 'blue', sz=50, gap=2, fz) {
	let dOuter = mCreate('div');
	let wOuter = sz;
	let wInner = sz - 2 * gap;

	mStyle(dOuter, {
		width: wOuter,
		padding: 0,
		display: 'inline',
		position: 'absolute',
		'text-align': 'center',
		'background-color': randomColor(),
		// color: 'black',
	});
	let dPic = pictoDiv(key, color, wInner, wInner);
	mAppend(dOuter,dPic)
	mStyle(dPic, { margin: gap, 'margin-bottom': 1 })
	let dText = mAppendText(dOuter, label);
	dText.classList.add('truncate');
	mStyle(dText, { 'margin-bottom': gap, width: wOuter });
	// area=asElem(area);
	// mPosRel(area);
	// mAppend(area, dOuter);
	return dOuter;
}
function pictoDiv(key, color, w, h) { let d = mPic(key); mColor(d, color); mSizePic(d, w, h); return d; }
function labelDiv(label, color, w, h) { 
	let d = mDiv(); 
	let dText = mAppendText(d, label);
	dText.classList.add('truncate');
	dText.classList.add('centerCentered');

	//TODO fuer color nachdunkeln damit text besser lesbar
	//mFg(dText,colorIdealText(color))
	//mMarginAuto(d);
	mColor(d, color); 
	mSize(d, w, h); 
	return d; 
}
//#region items
function picLabelDiv(size) { return o=>pictoLabelDiv(o.key, o.label, o.color, size); }
function picDiv(size) { return o=>pictoDiv(o.key, o.color, size, size); }
function colorLabelDiv(size) { return o=>labelDiv(o.label, o.color, size, size); }
function getUis(olist, func) { return olist.map(o => func(o)); }

//#region layouts

function layoutRow(uis, area, w,h, gap) {
	if (isEmpty(uis)) return [0,0];
	let x = y = gap;
	uis.map(d => {
		mAppend(area, d);
		mPos(d, x, y);

		x += w + gap;
	});
	//let h=getBounds(uis[0]).height; //getBounds kann erst NACH appendChild benuetzt werden!!!!!!!!!!!!!!!!!!!
	//console.log('h',h)
	return [x,y+h+gap]; //x is total width for layout
}
function layoutHand(uis, area, w,h, gap) {
	if (isEmpty(uis)) return [0,0];
	let x = y = gap;
	let overlap = .25*w;
	uis.map(d => {
		mAppend(area, d);
		mPos(d, x, y);
		x += overlap;
	});
	//let h=getBounds(uis[0]).height; //getBounds kann erst NACH appendChild benuetzt werden!!!!!!!!!!!!!!!!!!!
	//console.log('h',h)
	return [x+w,y+h+gap]; //x is total width for layout
}
function layoutGridInfo(gContainer,fields,corners,edges,fw,fh){
	for (const [id, f] of Object.entries(fields)) {
		gContainer.appendChild(f.ui);
		gPos(f.ui, fw * f.info.x, fh * f.info.y);
	}
	for (const [id, f] of Object.entries(edges)) {
		agLine(f.ui, f.info.x1 * fw, f.info.y1 * fw, f.info.x2 * fw, f.info.y2 * fw);
		gContainer.appendChild(f.ui);
	}
	for (const [id, f] of Object.entries(corners)) {
		gContainer.appendChild(f.ui);
		gPos(f.ui, fw * f.info.x, fh * f.info.y);
	}
}

//#RSG types main functions


//helpers
function sizedCard123(w,h){return o=>card123(o,w,h);}
function card123(oCard,w,h) {
	//console.log(oCard,w,h)
	//look at card typeMappings
	if (lookup(SPEC, ['typeMappings', 'card'])) {
		for (const k in SPEC.typeMappings.card) {
			oCard[k] = oCard[SPEC.typeMappings.card[k]];
		}
	}
	let el = cardFace(oCard,w,h);
	return el;
}

function mapOMap(omap, pool) {
	//if omap is a _set or list of objects, convert it to list of corresponding object in table
	//otherwise, turn it into [{key:key,val:value},...] list
	let olist = [];
	//console.log(omap)
	//console.log(pool)
	let ids = omap ? getElements(omap) : [];
	console.log('ids',ids)
	if (!isEmpty(ids)) {
		for(const id of ids){
			let o=pool[id];
			o.id=id;
			olist.push(o);
		}
		// let odict = {};
		// for (const id of ids) { odict[id] = pool[id]; }
		// olist = odict2olist(odict);
	} else {
		for (const k in omap) {
			let item = { key: k, value: omap[k] };
			olist.push(item);
		}
	}
	return olist;
}





















