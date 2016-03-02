/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 01.03.16
 * Time: 20:13
 * To change this template use File | Settings | File Templates.
 */
var stage;
var layer;
var stageWidth = 1320;
var stageHeight = 160;
var ceilSize = 20;
var lineWidth = 0.5;
var stationLineWidth = 2;
var gridColor = "black";
var stationColor = "blue";
var trainLineWidth = 2;
var trainColor = "red";
var stationX = 16;
var stationY = 1;

var interval;

var leftTrain;
var rightTrain;
var leftTarinX = 5;
var rightTarinX = 27;
function init(){
	stage = new Konva.Stage({
		width : stageWidth,
		height : stageHeight,
		container : "container"
	});
	layer = new Konva.Layer();

	drawGrid();
	station();

	leftTrain =  new train();
	leftTrain.x = leftTarinX;
	leftTrain.y = stationY+1;

	rightTrain =  new train();
	rightTrain.x = rightTarinX;
	rightTrain.y = stationY+1;

	layer.add(leftTrain.obj);
	layer.add(rightTrain.obj);
	stage.add(layer);

	/*var r = new moveToRight();
	r.train = leftTrain;

	var l = new moveToLeft();
	l.train = rightTrain;    //

	/*setInterval(function(){
	    r.execute();
		l.execute();
	},1000);  */


}

function drawGrid(){
  	var i, j, l,k;
	l = stageWidth/ceilSize +1 ;
	k = stageHeight/ceilSize +1 ;
	var line;
	for (i=0;i<l;i++){
		line = new Konva.Line({
			points: [i*ceilSize, 0, i*ceilSize, stageHeight],
			stroke: gridColor,
            strokeWidth: lineWidth,
			tension: 1
		});
		layer.add(line);
		//console.log(i*ceilSize, 0, i*ceilSize, stageHeight);
	}
	for (j=0;j<k;j++){
		line = new Konva.Line({
			points: [0, j*ceilSize, stageWidth, j*ceilSize],
			stroke: gridColor,
            strokeWidth: lineWidth,
			tension: 1
		});
		layer.add(line);
		//console.log(0, j*ceilSize, stageWidth, j*ceilSize);
	}
}

function station(){
	var line = new Konva.Line({
		points: [ceilSize/2, 0, 0, ceilSize, 0, 2*ceilSize, ceilSize, 2*ceilSize, ceilSize, ceilSize, ceilSize/2, 0],
		fill: stationColor,
		stroke: stationColor,
		strokeWidth: stationLineWidth,
		closed : true
	});
	line.move({
		x : stationX*ceilSize,
		y : stationY*ceilSize
	});
	layer.add(line);
}
function train(){
	var _commands = new Array();
	var _currentCommand;
	var line = new Konva.Line({
		points: [0, 0, 0, ceilSize, ceilSize, ceilSize, ceilSize, 0, 0, 0],
		fill: trainColor,
		stroke: trainColor,
		strokeWidth: trainLineWidth,
		closed : true
	});
	Object.defineProperties(this,{
		x : {
			get : function(){
				return line.x()/ceilSize;
			},
			set : function(value){
				var trainX = value*ceilSize;
				line.x(trainX);
				layer.batchDraw();
			}
		},
		y : {
			get : function(){
				return line.y();
			},
			set : function(value){
				var trainY = value*ceilSize;
				line.y(trainY);
			}
		},
		obj : {
			get : function(){
				return line;
			}
		},
		commands : {
			set : function(value){
				_commands = value;
				_currentCommand = 0;
			}
		},
		goto : {
			set : function(value){
				_currentCommand = value-1;
			}
		}
	});
	this.right = function(){
		this.x += 1;
	};
	this.left = function(){
		this.x -= 1;
	}
	this.next = function(){
		if(_currentCommand>=_commands.length) return;
		_commands[_currentCommand].train = this;
		_commands[_currentCommand].execute();
		_currentCommand++;
	}
}


function run(){
	var textArea = document.getElementById("commands");
	var commands = new Array();
	var executeCommands = new Array();
	var value = textArea.value;
	commands = value.split(";");
	var regexp = new RegExp("\n");
	var i,l;
	l = commands.length;
	for(i=0;i<l;i++){
		commands[i] = commands[i].replace(regexp, "");
		if(commands[i]==""){
			commands.splice(i,1);
			i--;
			l--;
		}else{
			executeCommands.push(simpleCommandFactory(commands[i]));
		}
	}
	leftTrain.commands = executeCommands;
	rightTrain.commands = executeCommands;
	_executeAll();
}


function _executeAll(){
	interval = setInterval(function(){
		leftTrain.next();
	    rightTrain.next();
	}, 300);
}
function stop(){
	clearInterval(interval);
	leftTrain.x = leftTarinX;
	rightTrain.x = rightTarinX;
}


function command(train){
	this._train;
	this._innercommand;
	this.execute = function(){
		this.executeCommand();
	}
	Object.defineProperties(this,{
		train : {
			set : function(value){
				this._train = value;
			},
			get : function(){
				return this._train;
			}
		},
		innercommand : {
			set : function(value){
				this._innercommand = value;
			},
			get : function(){
				return this._innercommand;
			}
		}
	})
}

function moveToRight(){
	this.executeCommand = function(){
		this.train.right();
	}
}
function moveToLeft(){
	this.executeCommand = function(){
		this.train.left();
	}
}
function gotoLine(){
	this.executeCommand = function(){
		console.log("goto " + this.innercommand);
		console.log("train " + this);
		this.train.goto = this.innercommand;
	}
}
function ifStation(){
	this.executeCommand = function(){
		var inputCommand = simpleCommandFactory(this.innercommand);
		if(this.train.x == stationX){
			inputCommand.train = this.train;
			inputCommand.execute();
		}
	}
}
moveToRight.prototype = new command();
moveToLeft.prototype = new command();
gotoLine.prototype = new command();
ifStation.prototype = new command();

function simpleCommandFactory(command){
	var _command;
	if(command == "R" || command == "r"){
		_command = new moveToRight(null);
		return _command;
	}
	if(command == "L" || command == "l"){
		_command = new moveToLeft(null);
		return _command;
	}
	if(command.indexOf("ifstation")!=-1){
		var regexp = new RegExp("ifstation ");
		command = command.replace(regexp, "");
		_command = new ifStation(null);
		//console.log("|"+_command+"|");
		_command.innercommand = command;
		return _command;
	}
	if(command.indexOf("goto") != -1){
		var regexp = new RegExp("goto ");
		var str = command.replace(regexp, "");
		_command = new gotoLine(null);
		//console.log("|"+str+"|");
		_command.innercommand = parseInt(str);
		return _command;
	}
	throw new Error("Unknown command");
}
