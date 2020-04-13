	/*
	 * 清空两边空白
	 *
	 * */
	String.prototype.trim= function () {
		return this.toString().replace(/^\s+|\s+$/,"");
    };
       /*
    * 将\转换\\,\r转\n,\n转"\n"
    *
    * */
    String.prototype.seam=function(){
    	return this.replace(/\\/g,"\\\\").replace(/(\n|\r)+/g,"\\n").replace(/("|')/g,"\\\$1").replace(/\n/g,"\"+\n\"")
    }	
    /*
    * 字符串转为整型数字
    *
    * */
   String.prototype.toInt = function( defaultValue){
       return parseInt(this,10)||defaultValue||0;
   };
   	/*
	 * 字符串转为浮点数字
	 *
	 * */
	String.prototype.toFloat = function( defaultValue ){
		return parseFloat(this,10)||defaultValue||0;
    };
    /*
	 * 数字转字符串
	 *
	 * */
	String.prototype.format = function (parten) {
		return this.toFloat().format(parten);
    };
   /*
	 * 转正则表达式
	 *
	 * */
	String.prototype.toReg = function () {
		return this.replace(/(\/|\.|\)|\(|\]|\[|\}|\{|\||\?|\+|\*|\^|\$)/g, "\\$1");
    };
    	/*
	 * 转url
	 *
	 * */
	String.prototype.toURI = function () {
		return this.replace(/^\s+|\s+$/g, "")
			.replace(/\/$/g, "")
			.replace(/\\/g, "/")
			.replace(/([^\/])\/+/g, "$1/")
			.replace(/^(\w:)/,function (m, m1) {
				return m1.toLowerCase()
			})
			.replace(/(^http:|^https:)/g,
			function (m, m1) {
				return m1 + "/"
			})
    };
    
    
	/*
	 * 转html
	 *
	 * */
	String.prototype.toHtml = function(){

        return this.replace(/&gt;/gm,">")
            .replace(/&lt;/gm,"<")
            .replace(/&nbsp;/gm," ")
            .replace(/&apos;/gm,"")
            .replace(/&quot;/gm,"")
            .replace(/&amp;/gm,"")
    };

    	/*
	 * 转html转string
	 *
	 * */
	String.prototype.htmlToString = function(){
		return this.replace(/>/gm,"&gt;")
			.replace(/</gm,"&lt;")
	};

	String.prototype.oneUp = function() {
		return this.replace(this[0], this[0].toUpperCase());
	};

	String.prototype.oneDown = function() {
		return this.replace(this[0], this[0].toLowerCase());
	};

	String.prototype.toLowerBySplit = function( type) {
		type = type || "_";
		var b = this.split(type)
		for( var i=0; i<b.length; i++ ){
			if(b[i]){
				b[i]=b[i].oneUp();
			}
		}
		return b.join("");
    }
    
	/**
	 * @introduction：返回格式化的字符串
	 * @param {string|Date} date日期字符串或者对象
	 * @param {string} outType 格式化 yyyy MM dd hh mm ss(年月日时分秒)（yyyy-MM-dd）,outType=="object"表示返回Date对象
	 * @return {string}  返回格式化的时间字符串
	 */
	String.prototype.toDate = function () {

        var that = this.trim();
        var tm,td;

		var checkDate = new Date(this);
		var dateToStr;

		if( (checkDate instanceof Date) && (checkDate != "Invalid Date")&&(checkDate.toString().indexOf("aN")==-1 )&&(checkDate.toString().indexOf("NaN")==-1 )){
			return checkDate;
		}else{
            if(/^\d+$/g.test(that)){
                //2016080901表示时间字符串
                if(that.length<=10){
                    that = that.perFill("2000010100");
                     tm = (that.slice(4,6)=="00"?"01":that.slice(4,6));
                     td = (that.slice(6,8)=="00"?"01":that.slice(6,8));
                    return new Date(that.slice(0,4)+"/"+tm+"/"+td)

                //认为是时间戳
                }else if(that.length<14){
                    return new Date(that*1);
                //20160809010908
                }else{
                    that = that.perFill("20000101000000");
                     tm = (that.slice(4,6)=="00"?"01":that.slice(4,6));
                     td = (that.slice(6,8)=="00"?"01":that.slice(6,8));
                    return new Date(that.slice(0,4)+"/"+tm+"/"+td+"/"+that.slice(8,10)+"/"+that.slice(10,12)+"/"+that.slice(12,14))
                }
            }else if(this.trim()==""){
				return new Date();
			}else{
				dateToStr = this;
			}

		}

		dateToStr = dateToStr.replace("Jan",1).replace("Feb",2).replace("Mar",3).replace("Apr",4).replace("May",5).replace("Jun",6)
			.replace("Jul",7).replace("Aug",8).replace("Sep",9).replace("Oct",10).replace("Nov",11).replace("Dec",12);

		//去掉非数字部分
		var t = dateToStr.replace(/\D+/g," ").replace(/^\s+|\s+$/,"").split(/\s+/);

		//Thu Sep 10 2015 22:30:38 GMT+0800 (中国标准时间)
		if(dateToStr.indexOf("GMT+0800")>0){

			date = [t[2], t[0], t[1], t[3], t[4], t[5] ];

			//"Thu, 17 Sep 2015 08:28:21 GMT"
		}else if(/GMT$/.test(dateToStr)){
			date = [t[2], t[1], t[0], t[3], t[4], t[5] ];

			//"Thu Nov 19 00:00:00 CST 2015"
		}else if(dateToStr.indexOf("CST")>0){
			date = [t[5], t[0], t[1], t[2], t[3], t[4] ];

			//"2015/9/17 下午4:28:55"
		}else{
			date = t;
		}

		var y = ("" + date[0]).fill("2000");//年
		var M = ("" + date[1]).fill("00");//月（大写）
		var d = ("" + date[2]).fill("00");//日

		var h = ("" + date[3]).fill("00");//时
		var m = ("" + date[4]).fill("00");//分
		var s = ("" + date[5]).fill("00");//秒

		return new Date(y+"/"+M+"/"+d+" "+h+":"+m+":"+s);

	};
	/*
	* 向后填充
	* */
	String.prototype.fill =function (perfix) {
	    var len = perfix.length - this.length;
        if(len<0){
            return this+"";
        }else{
            return (perfix).slice(0,len)+this;
        }

	};
    /*
     * 向前填充
     * */
    String.prototype.perFill =function (perfix) {
        var len = this.length;
        if(len<0){
            return this+"";
        }else{
            return this+(perfix).slice(len,perfix.length);
        }
    };

    /*
     *加密
     * */
    String.prototype.ENC=function(dir,notEncStr){

        if(notEncStr){
            notEncStr = notEncStr.split("");
        }

        var that = this;

        dir = dir||1;

        var ret = [];

        for (var i = 0; i < that.length; i++) {
            if (that[i] == "") {
                ret.push("");
                continue
            }
                if (notEncStr&&notEncStr.indexOf( that[i] )) {
                    ret.push(that[i].charCodeAt(i) );
                   continue
                }else{
                    ret.push("00" + (that.charCodeAt(i) + 1 * dir).toString(16).slice(-4))
                }

        }
        return unescape("%u" +ret.join("%u") );

        }
