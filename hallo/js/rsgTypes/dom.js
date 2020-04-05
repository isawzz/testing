function dom(o,{loc,pool,params}){
	console.log(o,loc,pool,params);
	let res = mCreate(params.tag?params.tag:'div'); //div is default tag
	let sep = params.separator?params.separator:',';
	if (params.optin) res.innerHTML = params.optin.map(x=>o.o[x]).join(sep);
	console.log('content:',res.innerHTML);
	return res;
}















