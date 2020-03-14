class ADecisionUI {
	constructor(div) {
		this.divTuples = div;
		this.msSelected = null;
		this.hoverTuple = null;
	}
	clearHoverTuple() {
		unitTestHover('clearHoverTuple');
		if (this.hoverTuple) {
			unitTestHover('clearHoverTuple', this.hoverTuple.id);
			this.hoverTuple = null;
		}
	}
	onExitTuple(ev) {
		if (this.hoverTuple) {
			unitTestHover('exit', this.hoverTuple.id);
		} else {
			unitTestHover('exit null');
		}
		this.clearHoverTuple();
	}
	onEnterTuple(ev) {
		let idTuple = evToId(ev);
		unitTestHover('enter', idTuple);
		if (this.hoverTuple != null && this.hoverTuple.id == idTuple) return;
		let idx = firstNumber(idTuple);
		let tuple = this.tuples[idx];
		this.hoverTuple = {id: idTuple, idx: idx, tuple: tuple};
	}
	restoreNoFilterHighlightType(highlight = true) {
		this.elTuples.map(el => (el.style = '')); //all tuples are shown!
	}
	startManualSelection(phase, tuples, container, onSelectedHandler) {
		this.tuples = tuples;
		this.elTuples = arrChildren(container);
		for (const el of this.elTuples) {
			el.addEventListener('click', onSelectedHandler);
			el.addEventListener('mouseenter', this.onEnterTuple.bind(this));
			el.addEventListener('mouseleave', this.onExitTuple.bind(this));
		}
	}
}
