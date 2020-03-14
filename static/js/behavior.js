//needs to specify what to do when new object is found
var BEHAVIORS = {};

function initDefaultBehaviors() {
	let dummy_table = {};
	dummy_table.areaName = 'dummy_objects';
	dummy_table.gName = areaG(dummy_table.areaName); //make a g area in objects tab!
	let dummy_board = new PolyGrid('dummies', {shape: 'quad', rows: 5, cols: 5});
	dummy_board.addPositions();

	BEHAVIORS.dummy = {table: dummy_table, board: dummy_board};

	//das wird so ein dictionary wo specific props in specific way rep werden
	//hier koennen auch default tablePresentation algos stehen!
}
