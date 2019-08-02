require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.system.js");

const generate = localRequire("@/server/lib/node_modules/esprima/generate-unicode-regex.js");
const {
  getArgAndCode,
  formatSpace,
  removeNote,
  filterByClose,
  findLeftOffsetByExpression,
  findRightOffsetByStatement,
  matchAndOrExcepssion,
  findLeftOffsetByString,
  generateCode
} = require("enhanced-resolve/lib/codeParse");

var Keyword = {
  "var": 1,
  "let": 1,
  "function": 1,
  "class": 1,
  "const": 3,
  "if": 2,
  "else": 2,
  "with": 2,
  "switch": 2,
  "while": 2,
  "do": 2,
  "export": 3,
  "throw": 3,
  "import": 3,
  "static": 3,
  "typeof": 3,
  "instanceof": 3,
  "delete": 3,
  "await": 3,
  "new": 3,
  "extends": 3,
  "void": 3,
  "yield": 3,
  "async": 3,
  "case": 3,
  "return": 3,
  "default": 4,
  "break": 4,
  "debugger": 4,
  "continue": 4,
  "constructor": 5,
  "super": 5
}

var Punctuate = {
  ",": 8,
  "=>": 7,
  "=": 1,
  "+": 1,
  "*=": 1,
  "*": 1,
  "/": 1,
  "%": 1,
  "-": 1,
  "+=": 1,
  "%=": 1,
  "/=": 1,
  "-=": 1,
  "|=": 1,
  "&": 1,
  "|": 1,
  "^": 1,
  "&=": 1,
  "^=": 1,
  "**=": 1,
  ">>=": 1,
  "<<": 1,
  ">>=": 1,
  ">>": 1,
  "<<<=": 1,
  ">>>=": 1,
  ">>>": 1,
  "!": 2,
  "~": 2,
  "&&": 3,
  "||": 3,
  ".": 4,
  "(": 5,
  "[": 5,
  "{": 5,
  "]": 6,
  ")": 6,
  "}": 6
}
const cacheInputFileSystem = rap.system.input;


class Parser {
  //
  constructor(code) {
    this.length = code.length;
    this.code = code;
    this.index = 0;
  }
  nextToken() {
    this.index++;
    this.next = this.code[this.index];
    if(this.eof()){
      throw "end";
    }
  }
  igroneLine() {
    if (this.next == "\n") { //前面已经过滤掉了空格
      this.nextToken(); //过滤掉
      return true;
    }
    return false;
  }
  parseStatementExpression() {
    this.igroneLine();
    let statment = {};
    statment.name = this.next; //当前期望是个变量
    this.nextToken();
    this.igroneLine();
    if (this.next == ";") {
      this.nextToken(); //往下走
      return;
    }

    if (this.next == ",") { //多次定义
      this.ast.expression.push(statment);
      this.parseStatementExpression();
    } else if (Punctuate[this.next] == 1) {
      statment.operate = this.next;
      this.igroneLine();
      statment.value = {};
      this.parseExpression(statment.value);
    }

  }
  parseExpression(expression,root){
    if(!root){
      root = expression;
    }
    this.nextToken(); //往下走
    let isPunctuate = Punctuate[this.next];
    if(isPunctuate==3){
      expression.keyword = this.next;
      this.igroneLine();
      if(this.next=="function"){
        root.func={};
        root.params = {};
        this.igroneLine();
        if(this.next=="("){
          this.parseFunctionParam( root.params);
        }else{
          root.name = this.next;
          this.nextToken(); //往下走
        }
        this.parseFunctionExpression(root.func);
      }
    }else if(this.next=="("){
      this.igroneLine();
      expression.value =  expression.value||{}
      this.parseExpression(expression.value,root);
    }else if(this.next==")"){
      this.igroneLine();
      if(this.next=="=>"){
        root.func={};
        root.params = root.value;
        this.parseFunctionExpression(root.func);
      }
      this.nextToken(); //往下走
    }else if(this.next=="{"){
      expression.object={};
      expression.object.member=[];
      this.parseObject(expression.object);
    }else if(this.next=="["){
      expression.array={};
      expression.array.member=[];
      this.parseArray(expression.object);
    }
  }

  parseFunctionExpression(func){
    this.igroneLine();
    this.nextToken(); //{
      func.body = {};
      this.start(func.body);//新的区间
      this.nextToken(); //}
  }
  parseArray(object){
    this.nextToken();
    this.igroneLine();
      let member = {};
      member.name = this.next;
      this.igroneLine();
      object.expression = {};
      this.parseExpression(object.expression);
      if(this.next==","){
        object.member.push(member);
        this.parseObject(object)
      }if(this.next=="]"){
        this.nextToken();//:
      }
  }
 parseObject(object){
  this.nextToken();
  this.igroneLine();
    let member = {};
    member.name = this.next;
    this.igroneLine();
    this.nextToken();//:
    this.igroneLine();
    object.expression = {};
    this.parseExpression(object.expression);
    if(this.next==","){
      object.member.push(member);
      this.parseObject(object)
    }if(this.next=="}"){
      this.nextToken();//:
    }
  }
  start(ast) {
    this.c = code[this.index];
    this.nextToken();
    let isKeyword = Keyword[this.c];
    let isPunctuate = Punctuate[this.c];
    this.ast = ast || {};
    if (this.eof()) {
      if (isKeyword) {
        switch (isKeyword) {
          case 1:
            this.ast.type = "expression";
            this.ast.expression = [];
            this.ast.statementType = this.c;
            this.parseStatementExpression();
            break;
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
          case 8:
        }
      }
      if (isPunctuate) {
        switch (isPunctuate) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
          case 8:
        }
      }
    }
  }
  eof() {
    return this.index < this.length;
  }
}
//解析程序代码
function parseProgram(code) {
  let parser = new Parser();
  this.start(code);
}

function ast(code) {
  code = removeNote(code);
  code = generateCode(code)
  return parseProgram(code);
}



var dir = localRequire("@/server/test/ast/code.js", true);
var data = cacheInputFileSystem.readData(dir)
var key = ast(data);