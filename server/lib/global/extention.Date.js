    /*
	/*
	 * 转换为web能识别的日期格式
	 * */
	Date.prototype.toString=function () {
		return this.format("yy/MM/dd hh:mm:ss");
    };
    /*
	 * any转日期
	 * */
	Date.prototype.toDate=function () {
		return this;
	};
	/*
	 * 格式化时间
	 * */

    Date.prototype.format = function(a,b) {
        if(b=="12"){
            return a.replace("yy", this.getFullYear().toString().fill("2000"))
                .replace("MM", (this.getMonth() + 1).toString().fill("00"))
                .replace("dd", this.getDate().toString().fill("00"))
                .replace("hh", (this.getHours()%12).toString().fill("00"))
                .replace("mm", this.getMinutes().toString().fill("00"))
                .replace("ss", this.getSeconds().toString().fill("00"))
                .replace("ampm", this.getHours()<12?"AM":"PM")
        }else{
            return a.replace("yy", this.getFullYear().toString().fill("2000"))
                    .replace("MM", (this.getMonth() + 1).toString().fill("00"))
                    .replace("dd", this.getDate().toString().fill("00"))
                    .replace("hh", this.getHours().toString().fill("00"))
                    .replace("mm", this.getMinutes().toString().fill("00"))
                    .replace("ss", this.getSeconds().toString().fill("00"))
        }
    };