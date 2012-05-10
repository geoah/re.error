if(typeof re=='undefined'){
	(function(global) {
		global.re = {}
	})(this);
}

re.error = {
	E_DEBUG: 0,
	E_INFO: 1,
	E_WARNING: 2,
	E_CRITICAL: 3,
	queue: [],
	queueHandle: null,
	queueTimeout: 2000,
	extras: {},
	setup: function(extras){
		re.error.extras = extras;
	},
	escapeString: function(str){
		return (str+'').replace(/[%&<>'"]/g, function(match){
			return '&#'+match.charCodeAt()+';';
		});
	},
	log: function(level, source, er){
		var tmpExtras = re.error.extras;
		var tmpEr = {
			location: location.toString() || '',
			level: level || 0,
			source: source || 'generic',
			error: er || {}
		};
		for (var attrname in tmpEr) { tmpExtras[attrname] = tmpEr[attrname]; }
		re.error.queue.push(tmpExtras);
		window.clearTimeout(re.error.queueHandle);
		re.error.queueHandle = window.setTimeout(re.error.sendQueue, re.error.queueTimeout);
	},
	sendQueue: function(){
		//console.info("er.error: Sending queue.");
		var queue = re.error.queue;
		re.error.queue = [];
		new Image().src = 'http://noodles.gr/re.error/?data='+encodeURIComponent(JSON.stringify(queue));
	}
};

(function(global) {
	window.onerror = function(message, file, line) {
		var er = {
			message: message || '',
			file: file || '',
			line: line || ''
		};
		re.error.log(re.error.E_WARNING, 'onerror', er);
	};
	window.onload = function(){
		if(typeof jQuery!='undefined'){
			jQuery().ready(function(){
				jQuery.ajaxSetup({
					success:function(x,e){
						var er = {
							request: {
								url: this.url,
								type: this.type,
								contentType: this.contentType,
								status: x.status,
								response: x.responseText
							}
						};
						re.error.log(re.error.E_INFO, 'ajaxsetup', er);
					},
					error:function(x,e){
						console.info(this,x,e);
						var er = {
							request: {
								url: this.url,
								type: this.type,
								contentType: this.contentType,
								status: x.status,
								response: x.responseText
							}
						};
						if(x.status==0){
							alert('Connection error or XHR violation.');
							er.message = 'Connection error or XHR violation.';
						}else if(x.status==404){
							er.message = 'URL does not exist.';
						}else if(x.status==500){
							er.message = 'Internal Server Error.';
						}else if(e=='parsererror'){
							er.message = 'Parsing JSON Request failed.';
						}else if(e=='timeout'){
							er.message = 'Request Time out.';
						}else {
							alert('Unknown Error.\n'+x.responseText);
							er.message = 'Unknown Error.';
						}
						re.error.log(re.error.E_CRITICAL, 'ajaxsetup', er);
					}
				});
			});
		};
	};
})(this);
