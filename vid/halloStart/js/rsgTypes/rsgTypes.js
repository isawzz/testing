const SET_RANDOM_COLORS = true; // true | false
const SHOW_AREA_IDS = true; // true | false
const SET_STANDARD_SIZE = false;// true | false

const RSGTYPES = { board: 1, hand: 2, field: 101, edge: 102, corner: 103 };//unter 100:container types

// param constants
const CARD_SZ = 80;
const LABEL_SZ = 40;
const FIELD_SZ = 40;
const DEF_ORIENTATION = 'h';
const DEF_SPLIT = 'equal';
const STANDARD_SIZE = [60, 20, 'mm'];

//default rsg types:
var DEF_LIST_TYPE = 'dom';
var DEF_ITEM_TYPE = 'dom';

//default req params for types:
var DEF_DOM_TAG = 'div';

function defaultUIFunc(mk) {
	let el = mk.elem = mCreate('div');
	el.style.backgroundColor = randomColor();
	// el.innerHTML = 'hallo';
	//el.innerHTML = 'oid' + mk.oid + ', id:' + mk.id + ', loc:' + mk.mapping.loc;
	//el.innerHTML = '<pre>' + 'hallo' + '</pre>'; // o2yaml('hallo'); //{hallo:'hallo'}); //mk.o);
	//el.innerHTML = '<pre style="white-space: nowrap;">' + jsonToYaml(mk.o) + '</pre>'; 
	// el.innerHTML = 'oid:' + mk.oid + ', id:' + mk.id + ', loc:' + mk.mapping.loc + o2yaml(mk.o); // id:'+mk.id+', map.oid:'+(mk.mapping.oid);
	el.innerHTML = formatJson(mk.o); // JSON.stringify(mk.o).replace('\"',''); // id:'+mk.id+', map.oid:'+(mk.mapping.oid);
	// let id = el.id = mk.childrensParentId = mk.id;
	el.style.textAlign = 'left';
	// el.style.whiteSpace = 'nowrap';
}
function formatJson(o) {
	let s = '';
	for (const k in o) {
		if (isSimple(o[k])) s += k + ':' + o[k] + ' ';
	}
	return s;
}
function o2yaml(o) { return '<pre>' + jsonToYaml(o) + '</pre>'; }
function o2yamlHtml(el, o) {
	el.innerHTML = '<pre>' + jsonToYaml(o) + '</pre>';
}

function worldMap(loc) {
	let html =
		`<div id="map_area" class="grid_div" style="width:340px;height:220px;background-color:rgba(86, 182, 222);">
			<svg width="100%" height="100%" viewBox="0 0 3400 2200" style="box-sizing:border-box;">
				<g id="mapG" >
					<image id="imgMap" href="/assets/tnt/TTmap.jpg" />
				</g>
			</svg>
		</div>`;
	//d3('#MAIN').html(html);
	let d = mBy(loc);
	d.innerHTML = html;
}
















