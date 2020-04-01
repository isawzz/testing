function testFront() {
	testMS();
}
function testMS() {
	console.log('hi!');

	//muss eine ms area machen!!!
	let gName = areaG('area_game');
	let ms = new MS('m1', gName).rect({w: 200, h: 200}).draw();
	ms.setBg('yellow', true);
	dots(ms, 2); //, {colors: ['blue', 'yellow']});
	let ms2;
}
function testTooltips() {
	$('div#ttipTop').html('<h3>object:' + oid + '</h3>');
	$('div#ttipLeft').html('propName1:<br>propName2:<br>propName 3 laenger:');
	$('div#ttipRight').html('propval1:<br>val:<br>val 3 laenger:');
	$('div#tooltip').css({
		display: 'inline-block',
		top: e.clientY,
		left: e.clientX
	});
}
