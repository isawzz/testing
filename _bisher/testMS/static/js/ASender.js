class ASender {
	constructor(backendUrl = LOCALHOST, options = {}) {
		this.serverData = {};
		this.akku = {};
		this.msgCounter = 0;
		this.stepCounter = 0;
		this.callback = null;
		//this.player = "";
		this.options = options;
		//console.log('last letter of url',backendUrl[backendUrl.length-1])
		if (backendUrl[backendUrl.length - 1] != '/') {
			backendUrl += '/';
		}
		this.backendUrl = backendUrl;
	}
	augment(data) {
		this.stepCounter += 1;
		this.akku = extend(true, this.akku, data);
		//console.log("this", this);

		//console.log('sender this=',this,'options',this.options)

		if (this.options.output == 'fine') {
			logFormattedData(this.serverData, this.stepCounter);
		} else if (this.options.output == 'raw') {
			//console.log(this.serverData);
		}
	}
	chainSend(msgChain, player, callback) {
		this.stepCounter = 0;
		this.akku = {game: {player: player}};
		this.callback = callback;
		this.chainSendRec({}, msgChain, callback);
	}
	chainSendRec(data, msgChain, callback) {
		this.augment(data);

		if (msgChain.length > 0) {
			//console.log('sending:',msgChain[0]);
			this.send(msgChain[0], d => this.chainSendRec(d, msgChain.slice(1), callback));
		} else {
			testOutput({3: ['sender akku:', this.akku]});
			callback(this.akku);
			//console.log("done chainSend");
		}
	}
	send(url, callback) {
		url = this.backendUrl + url;
		this.msgCounter += 1;
		unitTestRequest(this.msgCounter + ': request sent: ' + url);

		$.ajax({
			url: url,
			type: 'GET',
			success: response => {
				//unitTestResponse('server:', response.substring(0, 200));
				if (response[0] != '{') {
					//ERROR
					unitTestResponse(response);
					callback(JSON.parse('{"response":"' + response + '"}'));
				} else {
					this.serverData = JSON.parse(response);
					//this.history = JSON.parse(response);
					unitTestResponse(this.serverData);
					// if ("removed" in this.serverData) {
					//   for (const id in this.serverData.removed) {
					//     unitTestRemoved(this.serverData.removed.toString());
					//     ////alert("removed data!!!");
					//     break;
					//   }
					// }
					if ('error' in this.serverData) {
						error(this.serverData);
						error(this.serverData.error);
					} else {
						//console.log(this.serverData);
						callback(this.serverData);
					}
				}
			},
			error: err => {
				error(err);
			}
		});
	}
}
