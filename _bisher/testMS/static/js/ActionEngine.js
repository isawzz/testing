class ActionEngine {
	constructor(sender, areaName, syspals) {
		this.area = getArea(areaName); //where tuples are presented
		this.buttonPalette = syspals[0];
		this.highlightPalette = syspals[2];
		this.actionsPalette = syspals[0];
		this.gamePalette = syspals[1];

		this.callback = null;
		this.tupleGroups = null;
		this.autoplay = false;
		this.boats = []; //contains comprehensive info about each tuple
		this.boatChosen = null;
		this.hoverboat = null;
		this.choiceCompleted = false;

		this.choiceHistory = {}; //previous choices

		//bot prep: not used
		this.phase = null;
		this.sender = sender;
		this.decisionMode = null;

		this.filters = [];
		this.matchCount = 0;
		this.filteredBoats = []; //all visible boats
		this.selectedBoats = []; //all boats with 'selected' class on domel (ie, highlighted)

		//for faster matching: (vielleicht spaeter paar davon eliminieren!)
		this.i2oids = {};
		this.i2uis = {};
		this.uid2boat = {};
		this.oid2boat = {};
		this.alloids = [];
		this.alluis = [];

		this.clickHandler = this.onSelected.bind(this); //handler vars NEEDED iot remove event listeners correctly!!!
		this.mouseEnterHandler = this.onEnterTuple.bind(this);
		this.mouseLeaveHandler = this.onExitTuple.bind(this);

		//WEG!!!this.cd = {hoverList: 'green', select: 'red', showAvailable: 'silver', none: 'yellow'};
	}
	_createListElement(boat, divParent) {
		let el = document.createElement('a');
		el.id = 'aaa' + boat.iTuple;
		el.textContent = boat.text;
		boat.domel = el;
		divParent.appendChild(el);
	}
	_createTupleBoats() {
		this.filters = [];
		this.matchCount = 0;
		this.filteredDomels = []; //all visible boats
		this.selectedDomels = []; //all boats with 'selected' class (ie, highlighted)
		this.i2oids = {};
		this.i2uis = {};
		this.oid2boat = {};
		this.ms2boat = {};
		this.alloids = [];
		this.alluis = [];
		this.boats = [];
		let iGroup = 0;
		let iTuple = 0;
		for (const tg of this.tupleGroups) {
			for (const t of tg.tuples) {
				let boat = {desc: tg.desc, tuple: t, iGroup: iGroup, iTuple: iTuple, text: t.map(x => x.val), weg: false};
				let uis = [];
				let oids = [];
				this.i2oids[iTuple] = [];
				this.i2uis[iTuple] = [];
				for (const tel of t) {
					if (tel.type == 'obj' && isdef(tel.ID)) {
						let oid = tel.ID;
						this.i2oids[iTuple].push(oid);
						if (nundef(this.oid2boat[oid])) this.oid2boat[oid] = [];
						addIf(this.oid2boat[oid], boat);
						addIf(this.alloids, oid);
						let ms = getuiG(oid, 'main');
						oids.push(oid);
						if (ms) {
							uis.push(ms);
							this.i2uis[iTuple].push(ms);
							if (nundef(this.uid2boat[ms.id])) this.uid2boat[ms.id] = [];
							addIf(this.uid2boat[ms.id], boat);
							addIf(this.alluis, ms);
						}
					}
				}
				boat.oids = oids;
				boat.uis = uis;
				this.boats.push(boat);
				iTuple += 1;
			}
			iGroup += 1;
		}
	}
	clearActionList() {
		let d = this.area.div;
		clearElement(d);
		d.scrollTop = 0;
	}
	closeDecision() {
		for (const x of this.boats) {
			this._removeUIHandlers(x);
			this._clear(x);
		}
	}
	decideAutoplay(G) {
		this.finalizeChoice(randomNumber(0, this.boats.length - 1));
	}
	finalizeChoice(idx) {
		if (!this.choiceCompleted) {
			this.choiceCompleted = true;
			this.boatChosen = this.boats[idx];
			this._clear(this.boatChosen);
			this._red(this.boatChosen);
			setTimeout(() => {
				this.closeDecision();
				let i = this.boatChosen.iTuple;
				let t = this.boatChosen.tuple;
				this.callback(t, i);
			}, 500);
		}
	}
	genMove(G, callback, autoplay = true) {
		this.callback = callback;
		this.autoplay = autoplay;
		this.tupleGroups = G.tupleGroups;
		this.boatChosen = null;
		this.choiceCompleted = false;

		this._createTupleBoats();
		this.present();

		if (autoplay) this.decideAutoplay(G);
		else this.boats.map(b => this._addUIHandlers(b));
	}
	getBoat(ev) {
		let idTuple = evToId(ev);
		let idx = firstNumber(idTuple);
		let boat = this.boats[idx];
		return boat;
	}
	onClickStep(G) {
		if (!this.choiceCompleted) {
			this.decideAutoplay(G);
		}
	}
	onEnterTuple(ev) {
		let boat = this.getBoat(ev);
		this._green(boat);
		// if (this.hoverBoat == boat) return;
		// if (this.hoverBoat != null) {
		// 	this._unhighlightBoat(this.hoverBoat);
		// }
		// this.hoverBoat = boat;
		// this._highlightBoat(this.hoverBoat, 'hoverList');
	}
	onExitTuple(ev) {
		let boat = this.getBoat(ev);
		this._ungreen(boat);
		// if (this.hoverBoat == boat) {
		// 	this._unhighlightBoat(this.hoverBoat);
		// 	this.hoverBoat = null;
		// } else if (this.hoverBoat != null) {
		// 	error('boat missed to unhighlight!!!!!!', this.hoverBoat.iTuple);
		// }
	}
	onSelected(ev) {
		let boat = this.getBoat(ev);
		this.finalizeChoice(boat.iTuple);
	}
	present() {
		//TODO area.clear
		this.clearActionList();

		for (const boat of this.boats) {
			this._createListElement(boat, this.area.div);
			this._yellowF(boat);
		}
		return d;
	}

	toggleFilter(ev) {
		//ev belongs to ms element
		let oid = evToId(ev);
		let ms = getuiG(oid, 'main');
		//console.log('toggleFilter for', oid);
		if (this.filters.includes(oid)) {
			this.removeFilter(oid);
			ms.unselOrange();
		} else if (this.matchCount == 1) {
			this.removeAllFilters();
			this.addFilter(oid);
			ms.selOrange();
		} else {
			this.addFilter(oid);
			ms.selOrange();
		}
	}
	applyFilters() {
		//console.log('applyFilters:', this.filters.toString());

		this.matchCount = this.boats.length;
		this.filteredBoats = [];
		//TODO: make this incrementally!
		for (const b of this.boats) {
			//console.log(b.oids);
			for (const ofilter of this.filters) {
				if (!b.oids.includes(ofilter)) {
					b.domel.style = 'display:none';
					b.weg = true;
					this.matchCount -= 1;
					break;
				}
			}
			if (!b.weg) this.filteredBoats.push(b);
		}
		if (this.matchCount == 1 && OPTIONS.clickToSelect) {
			this.finalizeChoice(this.filteredBoats[0].iTuple);
		}
	}
	clearFilters() {
		//console.log('clearFilters');
		for (const b of this.boats) {
			b.domel.style = '';
			b.weg = false;
			b.domel.classList.remove('selected');
		}
	}
	removeAllFilters() {
		for (const oid of this.filters) {
			let ms = getuiG(oid, 'main');
			ms.unselOrange();
		}
		this.filters = [];
	}
	removeFilter(oid) {
		removeInPlace(this.filters, oid);
		this.clearFilters();
		this.applyFilters();
	}
	addFilter(oid) {
		//console.log('addFilter');
		addIf(this.filters, oid);
		this.clearFilters();
		this.applyFilters();
	}
	highlightListItemsMatching(uid) {
		for (const b of this.uid2boat[uid]) {
			if (b.weg) continue;
			let domel = b.domel;

			if (!domel.classList.contains('selected')) {
				this.selectedBoats.push(b);
				domel.classList.add('selected');
			}
		}
	}
	unhighlightListItemsMatching(uid) {
		for (const b of this.uid2boat[uid]) {
			let domel = b.domel;
			if (domel.classList.contains('selected')) {
				//console.log('yes, contains selected:', b, b.domel);
				removeInPlace(this.selectedBoats, b);
				domel.classList.remove('selected');
			}
		}
	}

	_addUIHandlers(boat) {
		//console.log('add ui handlers to', boat);
		let el = boat.domel;
		el.addEventListener('click', this.clickHandler);
		el.addEventListener('mouseenter', this.mouseEnterHandler);
		el.addEventListener('mouseleave', this.mouseLeaveHandler);

		boat.uis.map(x => enableClick(x, ev => this.toggleFilter(ev)));
		boat.uis.map(x => enableHover(x, ev => this.highlightListItemsMatching(evToId(ev)), ev => this.unhighlightListItemsMatching(evToId(ev))));

		//when entering object, all boats with that object should highlight domel (only if mode='highlight' vs mode='tooltip')
		//when leaving object, unhighlight

		//when clicking on object, filter boats to the ones that have this tuple inside
		//in mode='oneclick' if this object only fits to 1 tuple, select it
		//in mode='listclick' [default] final selection is ALWAYS done in dom list

		//action pane title should have icons for mode choices! or a settings wheel!
	}
	_removeUIHandlers(boat) {
		//remove all handlers,
		let el = boat.domel;
		this.clickHandler = this.onSelected.bind(this);
		el.removeEventListener('click', this.clickHandler);
		el.removeEventListener('mouseenter', this.mouseEnterHandler);
		el.removeEventListener('mouseleave', this.mouseLeaveHandler);

		boat.uis.map(x => disableClick(x));
		boat.uis.map(x => disableHover(x));
	}
	// #region colors
	_green(boat) {
		boat.uis.map(x => x.selGreen());
	}
	_blue(boat) {
		boat.uis.map(x => x.selBlue());
	}
	_red(boat) {
		boat.uis.map(x => x.selRed());
	}
	_yellow(boat) {
		boat.uis.map(x => x.selYellow());
	}
	_orange(boat) {
		boat.uis.map(x => x.selOrange());
	}
	_violet(boat) {
		boat.uis.map(x => x.selViolet());
	}
	_white(boat) {
		boat.uis.map(x => x.selWhite());
	}
	_black(boat) {
		boat.uis.map(x => x.selBlack());
	}
	_silver(boat) {
		boat.uis.map(x => x.selSilver());
	}
	_greenF(boat) {
		boat.uis.map(x => x.addBorder('green'));
	}
	_blueF(boat) {
		boat.uis.map(x => x.addBorder('blue'));
	}
	_redF(boat) {
		boat.uis.map(x => x.addBorder('red'));
	}
	_yellowF(boat) {
		/* Color Theme Swatches in Hex */
		let yellow0 = '#F2E530';
		let yellow1 = '#F2D43D';
		let yellow2 = '#FFD500';
		let yellow4 = '#FFC819';
		let yellow6 = '#FFBB00';
		let yellow8 = '#FFBC00';
		let yellow9 = '#FFA900';
		boat.uis.map(x => x.addBorder(yellow1)); //'gold')); //this.highlightPalette[5])); //'yellow'));
	}
	_orangeF(boat) {
		boat.uis.map(x => x.addBorder('orange'));
	}
	_violetF(boat) {
		boat.uis.map(x => x.addBorder('violet'));
	}
	_whiteF(boat) {
		boat.uis.map(x => x.addBorder('white'));
	}
	_blackF(boat) {
		boat.uis.map(x => x.addBorder('black'));
	}
	_silverF(boat) {
		boat.uis.map(x => x.addBorder('silver'));
	}
	_ungreen(boat) {
		boat.uis.map(x => x.unselGreen());
	}
	_unblue(boat) {
		boat.uis.map(x => x.unselBlue());
	}
	_unred(boat) {
		boat.uis.map(x => x.unselRed());
	}
	_unyellow(boat) {
		boat.uis.map(x => x.unselYellow());
	}
	_unorange(boat) {
		boat.uis.map(x => x.unselOrange());
	}
	_unviolet(boat) {
		boat.uis.map(x => x.unselViolet());
	}
	_unwhite(boat) {
		boat.uis.map(x => x.unselWhite());
	}
	_unblack(boat) {
		boat.uis.map(x => x.unselBlack());
	}
	_unsilver(boat) {
		boat.uis.map(x => x.unselSilver());
	}
	_unsel(boat) {
		boat.uis.map(x => x.unsel());
	}
	_unframe(boat) {
		boat.uis.map(x => x.removeBorder());
	}
	_clear(boat) {
		boat.uis.map(x => x.unselAll());
	}
	// #endregion colors
}
