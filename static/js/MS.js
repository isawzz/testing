class MS {
	constructor(id, areaName, uid = null) {
		this.id = id; //TODO: id<=>uid mapping
		this.uid = uid ? uid : id;
		this.areaName = areaName;
		this.parent = document.getElementById(areaName);
		//console.log(areaName)
		this.areaType = detectType(areaName);
		testGSM('type', this.areaType);

		this.elem = null;
		if (this.areaType == 'div') {
			this.elem = addSvgg(document.getElementById(this.areaName), this.uid, {});
			testGSM('type', getTypeOf(this.elem));
		} else if (this.areaType == 'g') {
			this.elem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			this.elem.id = this.uid;
		}

		this.isDrawn = false;
		this.isHighlighted = false;
		this.isSelected = false;

		this.isSelGreen = false;
		this.isSelRed = false;
		this.isSelYellow = false;
		this.isSelOrange = false;
		this.isSelViolet = false;
		this.isSelBlue = false;
		this.isSelWhite = false;
		this.isSelBlack = false;
		this.isSelSilver = false;
		this.isFrameGreen = false;
		this.isFrameRed = false;
		this.isFrameYellow = false;
		this.isFrameOrange = false;
		this.isFrameViolet = false;
		this.isFrameBlue = false;
		this.isFrameWhite = false;
		this.isFrameBlack = false;
		this.isFrameSilver = false;

		this.hasInFrame = false;
		this.hasOutFrame = false;
		this.isCovered = false;

		this.isEnabled = false;
		this.isBlinking = false;
		this.isVisible = false;
		this.x = 0; // refers to center!
		this.y = 0;
		this.w = 0;
		this.h = 0;
		this.bounds = {l: 0, t: 0, w: 0, h: 0, r: 0, b: 0};
		this.overlay = null; //this is the overlay element for highlighting and selecting
		this.ground = null;
		//frame workaround: add frame el on top of overlay inset by 2,fill trans and stroke=frame
		this.elFrame = null; //das ist damit inset frame geht!!! add another el on top of overlay
		this.frameThickness = null;
		this.elCover = null;

		this.data = {}; //any properties
		this.clickHandler = null;
		this.mouseEnterHandler = null;
		this.mouseLeaveHandler = null;
		this.elem.addEventListener('click', this.onClick.bind(this));
		this.elem.addEventListener('mouseenter', this.onMouseEnter.bind(this));
		this.elem.addEventListener('mouseleave', this.onMouseLeave.bind(this));
		this.children = {}; //dictionary that holds info about children of specific classes
		this.texts = []; //akku for text elems, each elem {w:textWidth,el:elem}
		this.layout = null;
		this.colorKeys = {}; //dynamic classes for selKeyColor
		this.bg = null;
		this.fg = null;
		this.textBackground = null; //this child will be inserted under text if line
	}

	//#region text
	setTextFill(r, fill, alpha = 1, textBg = null) {
		fill = fill ? fill : this.fg ? this.fg : textBg ? colorIdealText(textBg) : this.bg ? colorIdealText(this.bg) : null;
		if (!fill) {
			fill = 'white';
			textBg = 'gray';
		}
		fill = anyColorToStandardString(fill, alpha);
		//console.log('text color fill='+fill,'bg='+this.bg,'fg='+this.fg,'textBg='+textBg)
		r.setAttribute('fill', fill);
		r.setAttribute('stroke', fill);
		return textBg ? textBg : this.bg;
	}
	setTextBorder(color, thickness = 1) {
		//to set stroke for line or text different from fill!
		let c = anyColorToStandardString(color);
		let children = arrChildren(this.elem);
		unitTestMS('setTextBorder', children);
		for (const ch of children) {
			console.log(ch.getAttribute('stroke-width'));
			let t = getTypeOf(ch);
			if (t == 'text' || t == 'line') {
				ch.setAttribute('stroke-width', thickness);
				ch.setAttribute('stroke', c);
			}
		}
	}
	calcTextWidth(txt, fz, family, weight) {
		let sFont = weight + ' ' + fz + 'px ' + family; //"bold 12pt arial"
		sFont = sFont.trim();
		let wText = getTextWidth(txt, sFont);
		return wText;
	}
	text({
		txt,
		className = null,
		isOverlay = false,
		replaceFirst = true,
		fill = null,
		textBg = null,
		alpha = 1,
		x = 0,
		y = 0,
		fz = 20,
		family = 'arial',
		weight = ''
	} = {}) {
		// ms.text({txt: val, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz, bg: 'white', fill: 'black'});
		//TODO: shrinkFont,wrap,ellipsis options implementieren
		//if replaceFirst true ... if this elem already contains a text, that text child is replaced by new text
		let isFirstChild = this.elem.childNodes.length == 0;

		let r = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		if (isFirstChild) {
			this.ground = r;
		}
		r.setAttribute('font-family', family);
		r.setAttribute('font-weight', weight);

		// CSS classes
		if (isOverlay) {
			r.classList.add('overlay'); //className);
			this.overlay = r;
		}
		r.classList.add('msText');
		if (className) {
			r.classList.add(className);
		}
		//console.log('classes attached to new text element',r.getAttribute('class'),r.classList);

		textBg = this.setTextFill(r, fill, alpha, textBg);
		//console.log('text: textBg='+textBg)
		let wText = this.calcTextWidth(txt, fz, family, weight);

		if (this.isLine) {
			x += this.cx;
			y += this.cy;
			if (this.textBackground) {
				this.elem.removeChild(this.textBackground);
			}

			this.textBackground = this.getRect({w: wText + 10, h: fz * 1.5, fill: textBg});
			this.textBackground.setAttribute('rx', 6);
			this.textBackground.setAttribute('ry', 6);
		}
		r.setAttribute('font-size', '' + fz + 'px');
		r.setAttribute('x', x);
		r.setAttribute('y', y + fz / 2.8);
		r.setAttribute('text-anchor', 'middle');
		r.textContent = txt;
		r.setAttribute('pointer-events', 'none'); // geht!!!!!!

		if (replaceFirst && this.texts.length > 0) {
			let ch = this.texts[0]; //findChildOfType('text', this.elem);

			this.elem.insertBefore(r, ch);
			if (this.isLine) {
				this.elem.insertBefore(this.textBackground, r);
			}
			this.removeTexts();
		} else {
			if (this.isLine) {
				this.elem.appendChild(this.textBackground);
			}
			this.elem.appendChild(r);
		}

		let res = {el: r, w: wText};
		this.texts.push(res);
		return res;
	}
	reduceFontSize(el, n) {
		let fz = el.getAttribute('font-size');
		fz = firstNumber(fz);
		if (fz > n) fz -= n;
		el.setAttribute('font-size', '' + fz + 'px');
	}
	removeTexts() {
		for (const t of this.texts) {
			this.elem.removeChild(t.el);
		}
		this.texts = [];
	}
	multiText({
		replacePrevious = true,
		className = '',
		maxWidth = 1000,
		txt = ['one', 'two', 'three'],
		fz = 20,
		fill = 'black',
		padding = 1,
		alpha = 1,
		x = 0,
		y = 0,
		family = 'arial',
		weight = ''
	}) {
		if (replacePrevious) {
			this.removeTexts();

			// let chlist = findChildrenOfType('text', this.elem);
			// for (const ch of chlist) {
			// 	this.elem.removeChild(ch);
			// }
		}
		let h = txt.length * (fz + padding);
		//testMS_fine("height", h);
		let yStart = y - h / 2 + fz / 2;
		let maxW = 0;
		let akku = [];
		for (const t of txt) {
			let tel = this.text({
				replaceFirst: false,
				className: className,
				maxWidth: maxWidth,
				txt: t,
				fz: fz,
				fill: fill,
				padding: padding,
				alpha: alpha,
				x: x,
				y: yStart,
				family: family,
				weight: weight
			});
			maxW = Math.max(maxW, tel.w);
			akku.push(tel);
			yStart += fz + padding;
		}
		//console.log('maxw:', maxW);
		let MIN_FONT = 6;
		let overflow = maxW > this.bounds.w - 2 * padding;
		if (overflow > 0) {
			let dec = Math.ceil(overflow / 3);
			if (dec < 2) dec = 2;
			else if (fz - dec < MIN_FONT) dec = fz - MIN_FONT;
			//console.log('reducing font by', dec);
			this.texts.map(x => this.reduceFontSize(x.el, dec));
		}
		let isFirstChild = this.elem.childNodes.length == 0;
		if (isFirstChild || this.isLine) {
			this.bounds.w = this.w = maxW + 2 * padding;
			this.bounds.h = this.h = h;
		}

		return this;
	}

	//#endregion

	//#region colors NEW!
	setBg(color, updateFg = false) {
		let c = anyColorToStandardString(color);
		this.bg = c;
		this.elem.setAttribute('fill', c);
		if (updateFg) {
			this.setFg(colorIdealText(c), true);
		}
		//all child elements except line and text that do not have fill explicitly set, will get set automatically!
		return this;
	}
	setFg(color, updateFillTextLine = true) {
		let c = anyColorToStandardString(color);
		this.fg = c;
		this.elem.setAttribute('stroke', c);
		//all text or line child elements need to be updated if fill is not set!
		if (updateFillTextLine) {
			let children = arrChildren(this.elem);
			//unitTestMS('setFg', children);
			for (const ch of children) {
				//console.log(ch.getAttribute('stroke-width'));
				let t = getTypeOf(ch);
				if (t == 'text' || t == 'line') {
					ch.setAttribute('fill', c);
				}
			}
		}

		return this;
	}
	setFill(el, fill, alpha) {
		if (fill != null && fill !== undefined) {
			fill = anyColorToStandardString(fill, alpha);
			el.setAttribute('fill', fill);
		}
	}
	//#endregion

	//#region css classes
	addClass(clName) {
		let el = this.overlay;
		if (!el) return;

		el.classList.add(clName);

		// let cl = el.getAttribute('class');
		// if (cl && cl.includes(clName)) {
		// 	return this;
		// } else {
		// 	let newClass = cl ? (cl + ' ' + clName).trim() : clName;
		// 	testGSM('add result:', newClass);
		// 	el.setAttribute('class', newClass);
		// }
		// //testGSM('am ende:', this.overlay, cl, this.overlay.getAttribute('class'));
		// return this;
	}
	getClass() {
		if (this.overlay) {
			return this.overlay.getAttribute('class');
		}
		return null;
	}
	removeClass(clName) {
		let el = this.overlay;
		if (!el) return;
		el.classList.remove(clName);

		// let cl = el.getAttribute('class');
		// if (cl && cl.includes(clName)) {
		// 	let newClass = cl.replace(clName, '').trim();
		// 	testMS_fine('remove result:', newClass);
		// 	el.setAttribute('class', newClass);
		// }
		// testMS_fine('am ende:', this.overlay, cl, this.overlay.getAttribute('class'));
		// return this;
	}
	//#endregion

	//#region geo
	ellipse({border, thickness = 0, className = '', w = 50, h = 25, fill, alpha = 1, x = 0, y = 0} = {}) {
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');

		if (this.isLine) {
			x += this.cx;
			y += this.cy;
		}

		this.setFill(r, fill, alpha);

		r.setAttribute('stroke-width', thickness);
		if (thickness > 0) {
			border = convertToRgba(border, alpha);
			r.setAttribute('stroke', border);
		}

		if (this.elem.childNodes.length == 0) {
			this.bounds.w = this.w = w;
			this.bounds.h = this.h = h;
		}

		r.setAttribute('rx', w / 2);
		r.setAttribute('ry', h / 2);
		r.setAttribute('cx', x); //kann ruhig in unit % sein!!!
		r.setAttribute('cy', y);
		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			} else if (className.includes('ground')) {
				this.ground = r;
			}
		}
		this.elem.appendChild(r);
		return this;
	}
	getRect({border, thickness = 0, className = '', w = 50, h = 25, fill, alpha = 1, x = 0, y = 0} = {}) {
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

		if (this.isLine) {
			x += this.cx;
			y += this.cy;
		}

		r.setAttribute('width', w);
		r.setAttribute('height', h);
		r.setAttribute('x', -w / 2 + x);
		r.setAttribute('y', -h / 2 + y);

		if (this.elem.childNodes.length == 0) {
			this.w = this.bounds.w = w;
			this.h = this.bounds.h = h;
		}

		this.setFill(r, fill, alpha);

		r.setAttribute('stroke-width', thickness);
		if (thickness > 0) {
			border = convertToRgba(border, alpha);
			r.setAttribute('stroke', border);
		}

		//testGSM('rect nachher', fill);

		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			} else if (className.includes('ground')) {
				this.ground = r;
			}
		}
		return r;
	}
	circle({border, thickness = 0, className = '', sz = 50, fill, alpha = 1, x = 0, y = 0} = {}) {
		return this.ellipse({
			className: className,
			w: sz,
			h: sz,
			fill: fill,
			border: border,
			thickness: thickness,
			alpha: alpha,
			x: x,
			y: y
		});
	}
	hex({className = '', x = 0, y = 0, w, h = 0, fill, alpha = 1, border = 'white', thickness = 0, flat = false}) {
		//flat=true means  TODO: implement!
		//if h<=0, heightis calculated from width!
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

		if (h <= 0) {
			h = (2 * w) / 1.73;
		}
		let pts = size2hex(w, h, x, y);
		r.setAttribute('points', pts);

		if (this.elem.childNodes.length == 0) {
			this.w = this.bounds.w = w;
			this.h = this.bounds.h = h;
		}

		this.setFill(r, fill, alpha);

		if (thickness > 0) {
			border = convertToRgba(border, alpha);
			r.setAttribute('stroke', border);
			r.setAttribute('stroke-width', thickness);
		}

		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			} else if (className.includes('ground')) {
				this.ground = r;
			}
		}
		this.elem.appendChild(r);
		return this;
	}
	image({className = '', path = '', w = 50, h = 50, x = 0, y = 0} = {}) {
		//<image xlink:href="firefox.jpg" x="0" y="0" height="50px" width="50px"/>
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'image');
		r.setAttribute('href', path);

		r.setAttribute('width', w);
		r.setAttribute('height', h);
		r.setAttribute('x', -w / 2 + x);
		r.setAttribute('y', -h / 2 + y);
		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		if (this.elem.childNodes.length == 0) {
			this.w = w;
			this.h = h;
		}
		this.elem.appendChild(r);
		return this;
	}
	line({className = '', x1 = 0, y1 = 0, x2 = 100, y2 = 100, fill, alpha = 1, thickness = 2}) {
		// <line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		r.setAttribute('x1', x1);
		r.setAttribute('y1', y1);
		r.setAttribute('x2', x2);
		r.setAttribute('y2', y2);

		let isFirstChild = this.elem.childNodes.length == 0;

		if (thickness > 0) {
			let stroke = anyColorToStandardString(fill, alpha);
			r.setAttribute('stroke', stroke);
			r.setAttribute('stroke-width', thickness);
		}
		if (className !== '') {
			r.setAttribute('class', className);
		}
		if (className.includes('overlay')) {
			r.setAttribute('class', 'overlay_line');
			this.overlay = r; //set the interactive element!
		} else if (isFirstChild || className.includes('ground')) {
			this.ground = r;
			this.isLine = true;
			this.cx = Math.round((x1 + x2) / 2);
			this.cy = Math.round((y1 + y2) / 2);
		}

		this.elem.appendChild(r);
		return this;
	}
	poly({className = '', pts = '0,0 100,0 50,80', fill, alpha = 1, border = 'white', thickness = 0}) {
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		r.setAttribute('points', pts);

		//bounds berechnen!!!
		// r.setAttribute('height', h);
		// r.setAttribute('x', -w / 2 + x);
		// r.setAttribute('y', -h / 2 + y);

		// if (this.elem.childNodes.length == 0) {
		// 	this.bounds.w = w;
		// 	this.bounds.h = h;
		// }

		//testGSM('rect vorher', fill);
		this.setFill(r, fill, alpha);

		if (thickness > 0) {
			border = convertToRgba(border, alpha);
			r.setAttribute('stroke', border);
			r.setAttribute('stroke-width', thickness);
		}

		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			} else if (className.includes('ground')) {
				this.ground = r;
			}
		}
		this.elem.appendChild(r);
		return this;
	}
	rect({border, thickness = 0, className = '', w = 50, h = 25, fill, alpha = 1, x = 0, y = 0} = {}) {
		let r = this.getRect({border: border, thickness: thickness, className: className, w: w, h: h, fill: fill, alpha: alpha, x: x, y: y});
		this.elem.appendChild(r);
		return this;
	}
	roundedRect({border, thickness = 0, className = '', w = 150, h = 125, fill = 'darkviolet', rounding = 10, alpha = 1, x = 0, y = 0} = {}) {
		this.rect({
			className: className,
			w: w,
			h: h,
			fill: fill,
			border: border,
			thickness: thickness,
			alpha: alpha,
			x: x,
			y: y
		});
		let r = this.elem.lastChild;
		r.setAttribute('rx', rounding); // rounding kann ruhig in % sein!
		r.setAttribute('ry', rounding);
		return this;
	}
	square({className = '', sz = 50, fill = 'yellow', alpha = 1, x = 0, y = 0, border, thickness = 0} = {}) {
		return this.rect({
			className: className,
			w: sz,
			h: sz,
			fill: fill,
			alpha: alpha,
			x: x,
			y: y,
			border: border,
			thickness: thickness
		});
	}
	//#endregion

	//#region interactivity
	enable() {
		this.isEnabled = true;
	}
	disable() {
		this.isEnabled = false;
	}
	makeUnselectable() {
		this.unhighlight();
		this.unselect();
		this.clickHandler == null;
		this.disable();
	}
	makeSelectable(handler) {
		this.highlight();
		this.enable();
		this.clickHandler = handler;
	}
	onClick(ev) {
		testGSM('click', this.id, this.isEnabled, this.clickHandler);
		if (!this.isEnabled) return;

		if (typeof this.clickHandler == 'function') {
			testGSM('calling clickhandler');
			this.clickHandler(ev);
		}
	}
	onMouseEnter(ev) {
		testGSM('mouseEnter', this.id, this.isEnabled, this.mouseEnterHandler);
		if (!this.isEnabled) return;

		if (typeof this.mouseEnterHandler == 'function') {
			testGSM('calling mouseEnterHandler');
			this.mouseEnterHandler(ev);
		}
	}
	onMouseLeave(ev) {
		testGSM('mouseLeave', this.id, this.isEnabled, this.mouseLeaveHandler);
		if (!this.isEnabled) return;

		if (typeof this.mouseLeaveHandler == 'function') {
			testGSM('calling mouseLeaveHandler');
			this.mouseLeaveHandler(ev);
		}
	}
	//to set the pointer-events:none for text elements!
	mouseDisable() {
		this.addClass('mouseDisabled');
	}
	mouseEnable() {
		this.removeClass('mouseDisabled');
	}
	//#endregion

	//#region parent, pos, draw, remove from UI
	getPos() {
		return {x: this.x, y: this.y};
	}
	setPos(x, y) {
		this.elem.setAttribute('transform', `translate(${x},${y})`);
		this.x = x; //center!
		this.y = y;
		this.bounds.l = x - this.w / 2;
		this.bounds.t = y - this.h / 2;
		this.bounds.r = x + this.w / 2;
		this.bounds.b = y + this.h / 2;
		return this;
	}
	draw() {
		if (!this.isDrawn && this.parent) {
			this.isDrawn = true;
			this.parent.appendChild(this.elem);
			this.show();
		} else {
			let p = this.parent;
			if (!p) return this;
			let ch = findChildWithId(this.id, p);
			testMS_fine('child is', ch, 'this.id is', this.id, 'this.elem.id is', this.elem.id, 'this.parent is', this.parent);
			testMS_fine('children of parent:', arrChildren(p));
			testMS_fine('childNodes od p', p.childNodes);
			testMS_fine('childNodes od p', p.children);
			if (ch == null) {
				//this elem has been removed from UI
				//but is still retaining its parent
				//attach it back to parent
				this.isDrawn = true;
				this.parent.appendChild(this.elem);
				this.show();
				testMS_fine('element', this.id, 'has been re drawn!!!');
			} else {
				testMS_fine('there is already an element with id', this.id, 'drawn!!!!!!!');
				//the draw call is unecessary!
				//this element might have been hidden?
				//this.show();
			}
		}
		return this;
	}
	removeForever() {
		this.removeFromUI();
		this.clickHandler = null; //no need probably
		this.elem.removeEventListener('click', this.onClick.bind(this));
	}
	removeFromChildIndex(idx) {
		let el = this.elem;
		while (el.childNodes.length >= idx) {
			el.removeChild(el.lastChild);
		}
		testMS_fine(el, this);
	}
	removeChildWithClass(className) {
		for (const ch of [...this.elem.childNodes]) {
			let cl = ch.getAttribute('class');
			if (cl && ch.getAttribute('class').includes(className)) {
				this.elem.removeChild(ch);
				return;
			}
		}
	}
	removeFromUI() {
		if (this.isDrawn && this.parent) {
			this.parent.removeChild(this.elem);
			this.isDrawn = false;
		}
	}
	removeFromUIAndParent() {
		if (this.isDrawn && this.parent) {
			this.parent.removeChild(this.elem);
			this.isDrawn = false;
		}
		this.parent = null;
	}
	//#endregion

	//#region temp visual features

	// outline-color: rgb(0, 0, 255);;
	// outline-style: solid;
	// outline-width: 10px;
	// outline-offset: -10px;
	correctFramePos(el, fr, thickness) {
		let x = el.getAttribute('x'); // -w / 2 + x
		let y = el.getAttribute('y');
		let w = el.getAttribute('width'); // -w / 2 + x
		let h = el.getAttribute('height');
		// console.log('old pos + size', x, y, w, h);
		let wNew = w - thickness; //w - 2 * thickness;
		let hNew = h - thickness; //h - 2 * thickness;
		let xNew = Number(x) + thickness / 2;
		let yNew = Number(y) + thickness / 2;
		// console.log('new pos', xNew, yNew);
		fr.setAttribute('x', xNew);
		fr.setAttribute('y', yNew);
		fr.setAttribute('width', wNew);
		fr.setAttribute('height', hNew);
	}
	inframe(color, thickness = 4) {
		if (this.hasInFrame) {
			this.elFrame.setAttribute('stroke', color);
			if (thickness != this.frameThickness) {
				this.correctFramePos(this.overlay, fr, thickness);
				this.elFrame.setAttribute('stroke-width', thickness);
				this.frameThickness = thickness;
			}
			return;
		}
		//basically duplicate overlay and give it new color and different class name
		let el = this.overlay;
		if (!el) return;

		let fr = cloneSvg(el, 'frame');
		this.elFrame = fr;
		fr.setAttribute('fill', 'transparent');
		this.frameThickness = thickness;
		this.correctFramePos(el, fr, thickness);

		fr.setAttribute('stroke', color);
		fr.setAttribute('stroke-width', thickness);
		fr.setAttribute('class', 'hit_invisible');

		// newel.setAttribute('x',0)
		// newel.setAttribute('y',0)
		//newel.setAttribute('class', 'cover');
		//console.log(newel)

		//this.setFill(newel, color, alpha);
		this.elem.appendChild(fr);

		this.hasInFrame = true;
	}
	outframe(color = 'red', thickness = 4) {
		if (!this.overlay) return;
		this.overlay.setAttribute('stroke', color);
		this.overlay.setAttribute('stroke-width', thickness);
		this.hasOutFrame = true;
	}
	unframe() {
		if (this.hasInFrame) {
			this.elFrame.setAttribute('stroke', 'transparent');
		}
		if (this.hasOutFrame) {
			this.hasOutFrame = false;
			this.overlay.setAttribute('stroke-width', 0);
		}
	}
	addBorder(color = 'red', thickness = 4) {
		this.inframe(color, thickness);
	}
	removeBorder() {
		this.unframe();
	}
	removeBorder_outside() {
		if (!this.overlay) return;
		this.overlay.setAttribute('stroke-width', 0);
	}
	cover(color, alpha) {
		if (this.isCovered) return;
		//basically duplicate overlay and give it new color and different class name
		let el = this.overlay;
		if (!el) return;

		let newel = cloneSvg(el, 'cover');
		// newel.setAttribute('x',0)
		// newel.setAttribute('y',0)
		newel.setAttribute('class', 'cover');
		//console.log(newel)

		this.setFill(newel, color, alpha);
		this.elem.appendChild(newel);

		this.isCovered = true;
	}
	uncover() {
		//removes child w/ className 'cover'
		if (this.isCovered) {
			this.removeChildWithClass('cover');
			this.isCovered = false;
		}
	}
	addBorderNOGO(color = 'red', thickness = 4) {
		if (!this.overlay) return;
		this.overlay.setAttribute('stroke', color);
		this.overlay.setAttribute('stroke-width', thickness);
		this.overlay.setAttribute('style', 'stroke-alignment:inside');
	}
	removeBorderNOGO() {
		if (!this.overlay) return;
		this.overlay.setAttribute('stroke-width', 0);
	}
	addBorder0(color = 'red', thickness = 4) {
		if (!this.overlay) return;

		this.overlay.setAttribute('outline-color', color);
		this.overlay.setAttribute('outline-width', thickness);
		this.overlay.setAttribute('outline-offset', -thickness);
		this.overlay.setAttribute('outline-style', 'solid');
	}
	removeBorder0() {
		if (!this.overlay) return;
		this.overlay.setAttribute('outline-color', transparent);
		// this.overlay.setAttribute('stroke-width', 0);
	}
	highlight() {
		testMS_fine('highlighting', this.id);
		if (this.isHighlighted) return;
		this.addClass('highlighted');
		this.isHighlighted = true;
	}
	unhighlight() {
		if (!this.isHighlighted) return;
		this.removeClass('highlighted');
		this.isHighlighted = false;
	}
	select() {
		if (this.isSelected) return;
		testMS_fine('selecting', this.id);
		this.addClass('selected');
		//this.isHighlighted = false;
		this.isSelected = true;
	}
	unselect() {
		if (!this.isSelected) return;
		this.removeClass('selected');
		this.isSelected = false;
	}
	highFrame(color, alpha = 1) {
		if (alpha != 1) color = anyColorToStandardString(color, alpha);
		this.addBorder(color);
	}
	highColor(color, key, alpha = 0.5) {
		this.selKeyColor(color, key, alpha);
	}
	unhigh() {
		this.removeBorder();
		this.unselKeyColor();
	}
	unhighFrame() {
		this.removeBorder();
	}
	unhighColor() {
		this.unselKeyColor();
	}
	selKeyColor(color, key, alpha = 0.5) {
		if (!key) key = 'fill_' + color;
		color = colorTrans(color, alpha);
		if (!(key in this.colorKeys)) {
			addCSSClass(key, 'fill:' + color + ';'); //transition: 0.3s;');
			this.colorKeys[key] = color;
		}
		this.tag('colorKey', key);
		this.addClass(key);
	}
	unselKeyColor() {
		let key = this.getTag('colorKey');
		if (key) {
			this.removeClass(key);
		}
	}
	selColor(color, alpha = 0.5) {
		//make color transparent
		color = colorTrans(color, alpha);

		//set css variable --selColor (in msStyles.css)
		setCSSVariable('--selColor', color);

		this.addClass('selColor');
	}
	unselColor() {
		this.removeClass('selColor');
	}
	//#endregion

	//#region NEW highlights!
	unsel() {
		if (!this.overlay) return;
		let el = this.overlay;
		el.setAttribute('class', 'overlay');
		// let cl = el.getAttribute('class');
		// clParts = cl.split(' ');
		// el.setAttribute('class', 'overlay');
		// for (const s of clParts) {
		// 	if (s[0] == 'f') el.classList.add(s);
		// }
	}
	// unframe() {
	// 	this.removeBorder();
	// 	// if (!this.overlay) return;
	// 	// let el = this.overlay;
	// 	// let cl = el.getAttribute('class');
	// 	// clParts = cl.split(' ');
	// 	// el.setAttribute('class', 'overlay');
	// 	// for (const s of clParts) {
	// 	// 	if (s[0] == 's') el.classList.add(s);
	// 	// }
	// }
	unselAll() {
		this.unframe();
		this.unsel();
	}
	//#endregion
	//#region sel[Color]: Green,Blue,Violet,Orange,Yellow,Red,White,Black,Silver
	selGreen() {
		if (this.isSelGreen) return;
		this.addClass('selGreen');
		this.isSelGreen = true;
	}
	unselGreen() {
		if (!this.isSelGreen) return;
		this.removeClass('selGreen');
		this.isSelGreen = false;
	}
	selBlue() {
		if (this.isSelBlue) return;
		this.addClass('selBlue');
		this.isSelBlue = true;
	}
	unselBlue() {
		if (!this.isSelBlue) return;
		this.removeClass('selBlue');
		this.isSelBlue = false;
	}
	selViolet() {
		if (this.isSelViolet) return;
		this.addClass('selViolet');
		this.isSelViolet = true;
	}
	unselViolet() {
		if (!this.isSelViolet) return;
		this.removeClass('selViolet');
		this.isSelViolet = false;
	}
	selOrange() {
		if (this.isSelOrange) return;
		this.addClass('selOrange');
		this.isSelOrange = true;
	}
	unselOrange() {
		if (!this.isSelOrange) return;
		this.removeClass('selOrange');
		this.isSelOrange = false;
	}
	selYellow() {
		if (this.isSelYellow) return;
		this.addClass('selYellow');
		this.isSelYellow = true;
	}
	unselYellow() {
		if (!this.isSelYellow) return;
		this.removeClass('selYellow');
		this.isSelYellow = false;
	}
	selRed() {
		if (this.isSelRed) return;
		this.addClass('selRed');
		this.isSelRed = true;
	}
	unselRed() {
		if (!this.isSelRed) return;
		this.removeClass('selRed');
		this.isSelRed = false;
	}
	selBlack() {
		if (this.isSelBlack) return;
		this.addClass('selBlack');
		this.isSelBlack = true;
	}
	unselBlack() {
		if (!this.isSelBlack) return;
		this.removeClass('selBlack');
		this.isSelBlack = false;
	}
	selWhite() {
		if (this.isSelWhite) return;
		this.addClass('selWhite');
		this.isSelWhite = true;
	}
	unselWhite() {
		if (!this.isSelWhite) return;
		this.removeClass('selWhite');
		this.isSelWhite = false;
	}
	selSilver() {
		if (this.isSelSilver) return;
		this.addClass('selSilver');
		this.isSelSilver = true;
	}
	unselSilver() {
		if (!this.isSelSilver) return;
		this.removeClass('selSilver');
		this.isSelSilver = false;
	}
	//#endregion
	//#region frame[Color]: DONT USE!!!!!!!!!! Green,Blue,Violet,Orange,Yellow,Red,White,Black,Silver
	frameGreen() {
		if (this.isFrameGreen) return;
		this.addBorder('green');
		// this.addClass('frameGreen');
		this.isFrameGreen = true;
	}
	unframeGreen() {
		if (!this.isFrameGreen) return;
		this.removeBorder();
		// this.removeClass('frameGreen');
		this.isFrameGreen = false;
	}
	frameBlue() {
		if (this.isFrameBlue) return;
		this.addBorder('blue');
		// this.addClass('frameGreen');
		this.isFrameBlue = true;
	}
	unframeBlue() {
		if (!this.isFrameBlue) return;
		this.removeBorder();
		// this.removeClass('frameGreen');
		this.isFrameBlue = false;
	}
	frameViolet() {
		if (this.isFrameViolet) return;
		this.addClass('frameViolet');
		this.isFrameViolet = true;
	}
	unframeViolet() {
		if (!this.isFrameViolet) return;
		this.removeClass('frameViolet');
		this.isFrameViolet = false;
	}
	frameOrange() {
		if (this.isFrameOrange) return;
		this.addClass('frameOrange');
		this.isFrameOrange = true;
	}
	unframeOrange() {
		if (!this.isFrameOrange) return;
		this.removeBorder();
		// this.removeClass('frameOrange');
		this.isFrameOrange = false;
	}
	frameYellow() {
		if (this.isFrameYellow) return;
		this.addBorder('var(--pal2_7');
		//this.addClass('frameYellow');
		this.isFrameYellow = true;
	}
	unframeYellow() {
		if (!this.isFrameYellow) return;
		this.removeBorder();
		//this.removeClass('frameYellow');
		this.isFrameYellow = false;
	}
	frameRed() {
		if (this.isFrameRed) return;
		this.addClass('frameRed');
		this.isFrameRed = true;
	}
	unframeRed() {
		if (!this.isFrameRed) return;
		this.removeBorder();
		// this.removeClass('frameRed');
		this.isFrameRed = false;
	}
	frameWhite() {
		if (this.isFrameWhite) return;
		this.addClass('frameWhite');
		this.isFrameWhite = true;
	}
	unframeWhite() {
		if (!this.isFrameWhite) return;
		this.removeBorder();
		// this.removeClass('frameWhite');
		this.isFrameWhite = false;
	}
	frameBlack() {
		if (this.isFrameBlack) return;
		this.addClass('frameBlack');
		this.isFrameBlack = true;
	}
	unframeBlack() {
		if (!this.isFrameBlack) return;
		this.removeBorder();
		// this.removeClass('frameBlack');
		this.isFrameBlack = false;
	}
	frameSilver() {
		if (this.isFrameSilver) return;
		this.addClass('frameSilver');
		this.isFrameSilver = true;
	}
	unframeSilver() {
		if (!this.isFrameSilver) return;
		this.removeBorder();
		// this.removeClass('frameSilver');
		this.isFrameSilver = false;
	}
	//#endregion

	//#region visibility
	show() {
		testMS_fine('called show!!! ', this.id, this.isVisible);
		if (this.isVisible) return;
		this.elem.setAttribute('style', 'visibility:visible;');
		this.isVisible = true;
	}
	hide() {
		//if (!this.isVisible) return;
		this.elem.setAttribute('style', 'visibility:hidden;display:none');
		this.isVisible = false;
	}
	hideChildren(className) {
		testMS_fine('hideChildren');
		if (!(className in this.children)) {
			testMS_fine('className', className, 'not in ', this.children);
			this.children[className] = {isHidden: false};
		}
		testMS_fine('pik dame');
		if (this.children[className].isHidden) return this;
		for (const ch of [...this.elem.childNodes]) {
			let cl = ch.getAttribute('class');
			testGSM('class', cl, 'className', className);
			if (cl && ch.getAttribute('class').includes(className)) {
				ch.setAttribute('style', 'visibility:hidden;display:none');
			}
		}
		this.children[className].isHidden = true;
		return this;
	}
	showChildren(className) {
		if (!(className in this.children)) {
			testGSM(className, 'not in', this.children);
			this.children[className] = {isHidden: true};
		}
		if (!this.children[className].isHidden) {
			testGSM(this.children[className].isHidden, 'seems to be false');
			return this;
		}
		for (const ch of [...this.elem.childNodes]) {
			let cl = ch.getAttribute('class');
			testGSM('class', cl, 'className', className);

			if (cl && ch.getAttribute('class').includes(className)) {
				ch.setAttribute('style', '');
			}
		}
		this.children[className].isHidden = false;
		return this;
	}
	toggleVisibility() {
		if (this.isVisible) this.hide();
		else this.show();
	}

	//#endregion

	//#region tags
	tag(key, val) {
		this.data[key] = val;
		return this;
	}
	getTag(key) {
		if (key in this.data) return this.data[key];
		else return null;
	}
	hasTag(key) {
		return key in this.data;
	}
	hasTagWithVal(key, val) {
		return key in this.data && this.data[key] == val;
	}
	//#endregion
}
