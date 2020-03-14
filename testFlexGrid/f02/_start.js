var SCALE = 1.0;

let block = document.querySelector(".block-1");
let slider = document.querySelector(".slider");

// on mouse down (drag start)
slider.onmousedown = function dragMouseDown(e) {
	// get position of mouse
	let dragX = e.clientY;
	// register a mouse move listener if mouse is down
	document.onmousemove = function onMouseMove(e) {
		// e.clientY will be the position of the mouse as it has moved a bit now
		// offsetHeight is the height of the block-1
		block.style.height = block.offsetHeight + e.clientY - dragX + "px";
		// update variable - till this pos, mouse movement has been handled
		dragX = e.clientY;
	}
	// remove mouse-move listener on mouse-up (drag is finished now)
	document.onmouseup = () => document.onmousemove = document.onmouseup = null;
}













//#region vorher
//window.addEventListener("wheel", ev => { ev.preventDefault(); if (ev.deltaY > 0) { zooom(1.1); } else if (ev.deltaY < 0) zooom(.9); }, { passive: false });

//fillActions(12);

