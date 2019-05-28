
	Number.prototype.trim = function( ){
		return this.toString().trim()
	};


	Number.prototype.toFloat = function(  defaultValue){
		return this.toString().toFloat( defaultValue)
	};

	Number.prototype.toInt = function( defaultValue){
		return this.toString().toInt(  defaultValue)
	};
	/*
	 * 数字转字符串
	 *
	 * */
	String.prototype.tpl = function () {
		var arg = arguments;
		var that = this;
		for (var i = 0; i < arg.length; i++) {
			that = that.replace(new RegExp('\\{' + i + '\\}', "g"), arg[i]);
		}
		return that;
	};


	/*
	 * 数字转字符串###,##.##
	 *小数点超过4位，0.0001将会被转化为0
	 * 整数不超过16位
	 * */
	Number.prototype.format = function( parten ){
		

		var pointIdx = parten.lastIndexOf(".");

		var accuracy = pointIdx!=-1?(parten.length-pointIdx-1):0;

        var result = ( Math.round(this * Math.pow(10, accuracy)) / Math.pow(10, accuracy) + Math.pow(10, -(accuracy + 1))).toString();
		
		var pointStrIdx = result.lastIndexOf(".");

        if( pointStrIdx==-1 ){
            pointStrIdx = result.length
        }
		
		var prefixStr = result.slice(0,pointStrIdx);
		var suffixStr = result.slice(pointStrIdx,result.length);

        var prefixParten

        if(~pointIdx){
            prefixParten = parten.slice(0,pointIdx);
        }else{
            prefixParten = parten;
        }

		var str = [];
		/*高位在前，低位在后*/
		for(var i=prefixParten.length-1,j=prefixStr.length-1;i>=0&&j>=0;i--){
			if(prefixParten[i]=="#"){
				str.unshift(prefixStr[j]);
				j--;
			}else{
				str.unshift(prefixParten[i]);
			}
		}
		/*补全高位*/
		for(;j>=0;j--){
			str.unshift(prefixStr[j]);
		}
		/*补小数点*/
		for(i=0;(i<accuracy+1)&&accuracy;i++){
			str.push(suffixStr[i])
		}
		
		return str.join("");

    };

