var dGame = document.getElementById('game');
setCSSVariable('--wTable','300px')
var dLog = document.getElementById('log');
log.innerHTML = 'HALOQ Wdas fd asd WWWWW';//style.minWidth='400px';
log.style.setProperty('min-width','100px');

fillActions2('actions', 25, 100);


//initZoomToFit('actions','game','log');
//_calcWidthNeeded('actions','game','log');
zoom_on_resize('game','actions','log');



//initZoom();
//zoom_on_resize('rsg');

//let b=getBounds('actions2');
//console.log(b)






//#region vorher
// window.addEventListener("wheel", ev => {
// 	if (!ev.altKey) return;
// 	ev.preventDefault(); if (ev.deltaY > 0) { zooom(.9); } else if (ev.deltaY < 0) zooom(1.1);
// }, { passive: false }
// );

//fillActions(12);

