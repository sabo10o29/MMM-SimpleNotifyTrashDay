/* Magic Mirror
 * Module: MMM-SimpleNotifyTrashDay
 *
 * By sabo10o29 https://github.com/sabo10o29
 * MIT Licensed.
 */

const DAYS = {"sun":0, "mon":1, "tue":2, "wed":3, "thu":4, "fri":5, "sat":6};

Module.register("MMM-SimpleNotifyTrashDay",{
	// Module config defaults.
	defaults: {
		notify: 1,
		animationSpeed: 1000,
		upadteInterval: 60 * 60 *1000, //msec
		timeFormat: "MM/DD",
		title: "Trash day"
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},
	// Define styles.
	getStyles: function() {
		return ["styles.css"];
	},
	// Define start sequence.
	start: function() {
		var self = this;
		Log.info("Starting module: " + self.name);

		setInterval(function() {
			self.updateDom(this.config.animationSpeed);
		}, self.config.upadteInterval);

		self.updateDom(this.config.animationSpeed);
	},

	getOptions() {
		return options = {
			url: this.config.api,
			method: "GET",
		};
	},

	//設定から対象のゴミの日を計算して該当するゴミの日があったら表示する
	getDom: function() {

		var trashItems = this.config.trashDay;
		var notify = this.config.notify;

		var wrapper = document.createElement("div");
		if(trashItems.length == 0){
			console.log("There are no configuration items.");
			return wrapper;
		}

		var title = document.createElement("text");
		title.innerHTML = this.config.title;

		var table = document.createElement("table");
		table.className = "info";
		if(this.data.position == "top_right" || this.data.position == "bottom_right" ){
			table.style.marginLeft = "auto";
			title.style.textAlign = "right";
		}

		const notifyItems = []
		for(var i = 0; i < trashItems.length; i++){
			var item = trashItems[i];
			for(var j = 0; j <= notify; j++){
				var m = moment().add(j, "d");
				if(this.isTargetWeek(m, item) && this.isTargetDay(m, item)){
					notifyItems.push({moment: m, trashItem: item})
				}
			}
		}

		notifyItems.sort((a, b) => a.moment.diff(b.moment)).forEach(i => {
			var infoItem = document.createElement("tr");
			infoItem.className = "bright";
			// Add time
			var time = document.createElement("td");
			time.className = "time";
			// time.innerHTML = moment.unix(Number(item.lastupdate)).format(this.config.timeFormat);
			time.innerHTML = i.moment.format(this.config.timeFormat);
			infoItem.appendChild(time);
			//Add event content
			var content = document.createElement("td");
			content.innerHTML = i.trashItem.LABEL;
			infoItem.appendChild(content);
			table.appendChild(infoItem);
		});

		if(notifyItems.length==0){
			console.log("There are no items to notify.");
			return wrapper;
		}

		wrapper.appendChild(title);
		wrapper.appendChild(table);
		return wrapper;
	},

	//該当の週かどうかを確認
	isTargetWeek: function(m, item) {
		var targetWeeks = item.NOW;
		var currentWeek = Math.ceil(m.date() / 7 ) ;
		for(var i = 0; i < targetWeeks.length; i++){
			var targetWeek = targetWeeks[i];
			if(currentWeek == targetWeek){
				return true;
			}
		}
		return false;
	},

	//該当日かどうかを確認
	isTargetDay: function(m, item){
		var targetDays = item.DOW;
		const currentDay = m.day();
		for(var i = 0; i < targetDays.length; i++){
			var targetDay = DAYS[targetDays[i]];
			if(currentDay == targetDay){
				return true;
			}
		}
		return false;
	},
});

