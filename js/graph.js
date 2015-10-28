'use strict';

class canvasHelpers {


	y(n){
		return Math.abs(n - this.height);
	}

	x(n){
		return Math.abs(n - this.width);
	}


	drawLine(l,b,x,y){
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.moveTo(l, this.y(b));
		this.ctx.lineTo(x,this.y(y));
		this.ctx.closePath();
		this.ctx.stroke();
		this.ctx.restore();
	}
	drawDottedLine(l,b,x,y){
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.setLineDash([1,5]);
		this.ctx.moveTo(l, this.y(b));
		this.ctx.lineTo(x,this.y(y));
		this.ctx.closePath();
		this.ctx.stroke();
		this.ctx.restore();
	}

	getMeasure(text,size){
		this.ctx.save();
		this.ctx.font = size+"px sans-serif";
		var font = this.ctx.measureText(text).width;
		this.ctx.restore();
		return font;
	}

	drawText(l,b,text,size,prefix){
		var prefix = prefix || "";
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.font = prefix+" "+size+"px sans-serif";
		this.ctx.fillText(text,l,this.y(b))
		this.ctx.closePath();
		this.ctx.restore();
	}

	drawCircle(x, y, r,c){
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.fillStyle = c || "#000000";
		this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.restore();
	}

	drawRectGradient(x,y,w,h,c){
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.fillStyle = c || "#000000";
		this.ctx.fillRect(x,y,w,h,c);
		this.ctx.closePath();
		this.ctx.restore();
	}
	clearCanvas(){
		this.ctx.clearRect(0,0,this.width,this.height);
	}

}

class veCanvas extends canvasHelpers{


	constructor(id){
		super();
		this.init(id);
		
	}


	init(id){
		var elm = document.getElementById(id || 'nufarm');
		this.elm = elm;
		this.ctx = this.elm.getContext("2d");
		this.height = elm.height;
		this.width = elm.width;
		this.columns = 8;
		this.coordinates = {
			columns: {
				x : [],
				y : []
			}
		}
		this.info = {
			total : [],
			clave : []
		}
		this.pointers = {
			total: []
		};
	}
	setWorkSpace(p){
		var init = {
			paddingLeft: p.paddingLeft || this.width * 0.30,
			paddingBottom: p.paddingBottom || this.width * 0.10,
			paddingTop: p.paddingTop || 0
		}
			init.graphSpace = {
				h : this.height - init.paddingBottom,
				w : this.width - init.paddingLeft,
				x : init.paddingLeft,
				y : this.y(init.paddingBottom)
			}
		this.workspace = init;
	}

	setColumnProperties(p){
		var init = {
			hColumns : p.hColumns || 50 
		}
		this.columnProperties = init;
	}

	setMaxPercent(c){
		var p = [];
		for (var i = 0; i < c.length; i++) {
			p.push(c[i].percent);
		};
		var maxPercent = Math.max.apply(null,p);
		this.columnProperties.maxColPercent = Math.ceil(maxPercent / 50) * 50;
		this.columnProperties.maxWorkCol = Math.ceil(maxPercent / 50);
	}
	getScale(n){
		var scale = (this.columnProperties.hColumns / 50);
		return scale * n;
	}

	displayinfo(event){
		var cursor = {
			x : event.offsetX,
			y : event.offsetY
		}
		this.clearCanvas();
		this._WorkSpace();
		console.log(cursor);
	}


	data(p){
		this.setMaxPercent(p.total);
		this.info.total = p.total;
		this.info.clave = p.clave;
	}

	_Pointers(c,n){

		var d = [];
		for (var i = 0; i < this.coordinates.columns.x.length; i++) {
			
			//var ind = Math.abs()
			d.push({
				x: this.x(this.coordinates.columns.x[i]),
				y:  this.getScale(c[i].percent),
				val: c[i].value,
				perc: c[i].percent
			});
		};
		this.pointers[n] = d.reverse();
	}
	_ColumnsX(){
		var x = [];
		var widthColumns = this.workspace.graphSpace.w / this.columns;
		var tmp = 0;
		for (var i = 0; i < this.columns; i++) {
			x.push(tmp + this.workspace.paddingLeft)
			tmp += widthColumns;
		};
		this.coordinates.columns.x = x;
	}
	_ColumnsY(){
		var y = [];
		var tmp = this.columnProperties.hColumns;
		for (var i = 0; i < this.columnProperties.maxWorkCol; i++) {
			//if(i > 0){
				y.push(tmp);
			//}
			tmp += this.columnProperties.hColumns  ;
		};
		this.coordinates.columns.y = y;
	}

	_ReziseElement(){
		var newHeight = (this.columnProperties.maxWorkCol * this.columnProperties.hColumns) + this.columnProperties.hColumns;
			newHeight += this.workspace.paddingTop;
			newHeight += this.workspace.paddingBottom;
			this.elm.height = newHeight;
			this.height = newHeight;
	}
	_DrawPoints(n,c){
		for (var i = 0; i < this.pointers[n].length; i++) {
			var p = this.pointers[n][i];
			this.drawCircle(p.x ,this.y(p.y + this.workspace.paddingBottom) ,4,c);
		};
	}

	_DrawRectOneHundredGradient(){
		this.drawRectGradient(
			this.workspace.paddingLeft,
			this.y(this.workspace.paddingBottom + (this.columnProperties.hColumns * 2)),
			this.width - this.workspace.paddingLeft,
			this.columnProperties.hColumns * 2,
			"rgba(77,77,77,0.1)");
	}
	

	_DrawLinePoints(n,color){

		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		this.ctx.moveTo(this.workspace.paddingLeft,this.y(this.workspace.paddingBottom));
		// 0 to n
		this.ctx.lineTo(this.pointers[n][0].x,this.y(this.pointers[n][0].y + this.workspace.paddingBottom));

		for (var i = 0; i < this.pointers[n].length; i++) {

			if(this.pointers[n][i + 1] != undefined){

				this.ctx.lineTo(this.pointers[n][i + 1].x,this.y(this.pointers[n][i + 1].y + this.workspace.paddingBottom));
			}

		};
		//to end canvas
		this.ctx.lineTo(this.width,this.y(this.pointers[n][ this.pointers[n].length - 1 ].y + this.workspace.paddingBottom));
		// go to bottom workspace
		this.ctx.lineTo(this.width, this.y(this.workspace.paddingBottom));

		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.restore();
	}

	_WorkSpace(){
		
		//initial dashed line
		this.drawDottedLine(this.workspace.paddingLeft,
			this.workspace.paddingBottom, 
			this.width,
			this.workspace.paddingBottom);
		// 0%
		var measure = this.getMeasure("0%",14);
		this.drawText(this.workspace.paddingLeft - measure - 5 ,this.workspace.paddingBottom - 2  ,"0%",14);

		// rest percents
		var tmp = 0;
		for (var i = 0; i < this.coordinates.columns.y.length; i++) {
			var relToBottom = this.workspace.paddingBottom + this.coordinates.columns.y[i];
			var relToLeft = this.workspace.paddingLeft;

			tmp += 50;
			var text = tmp+"%";
			
			var measure = this.getMeasure(text,14);

			this.drawDottedLine(relToLeft,
			relToBottom, 
			this.width,
			relToBottom);

			if(tmp == 100){
				this.drawText(relToLeft - measure - 5 ,relToBottom - 2  ,text,14,"bold");
				this._DrawRectOneHundredGradient();
			}else{
				this.drawText(relToLeft - measure - 5 ,relToBottom - 2  ,text,14);
			}
		};

		// draw pointers "total"
		
		this._DrawLinePoints("total","rgba(141,42,141,0.5)");
		this._DrawLinePoints("clave","rgba(141,42,141,0.5)");
		this._DrawPoints("total","#6085A8");
		this._DrawPoints("clave","#272822");


	}



	commit(){
		this._ReziseElement();
		this._ColumnsX();
		this._ColumnsY();
		this._Pointers(this.info.total,"total");
		this._Pointers(this.info.clave,"clave");
	}

	draw(){
		//this.clearCanvas();
		this._WorkSpace();

	}



}
