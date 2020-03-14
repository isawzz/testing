var SCALE = 1.0;












//#region vorher
window.addEventListener("wheel", ev => {
	if (!ev.altKey) return;
	ev.preventDefault(); if (ev.deltaY > 0) { zooom(.9); } else if (ev.deltaY < 0) zooom(1.1);
}, { passive: false }
);

//fillActions(12);

