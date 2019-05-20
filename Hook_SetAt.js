// 封装 函数指针， 返回值类型， 参数类型到 MyFunction
function MyFunction(funcPtr, retType, paramsType) {
  this.funcPtr = funcPtr;
  if (retType != null && paramsType != null) {
    this.retType = retType,
    this.paramsType = paramsType,
    this.nativeFunc = new NativeFunction(funcPtr, retType, paramsType);
  } else {
    this.retType = null;
    this.paramsType = null;
    this.nativeFunc = null;
  }
};

// 全局函数，读取动态库的导出表，获取指定函数在内存中的地址
// 并根据参数创建一个 NativeFunction 用于在js中调用这个动态库中的函数。
function getMyFunction(moduleName, func, retType, paramsType) {
  var funcPtr = null;
  if (typeof(func) == "number") {
    var moduleBase = Module.findBaseAddress(moduleName);
    funcPtr = ptr(parseInt(moduleBase) + func);
    //console.log("moduleBase: " + moduleBase + ", offset: " + func.toString(16) + ", funcPtr:" + funcPtr);
  } else {
    funcPtr = Module.findExportByName(moduleName, func);
  }
  if (funcPtr == null) {
    throw new ReferenceError("Frida: Can't found module name or function name.");
  }
  return new MyFunction(funcPtr, retType, paramsType);
};

function GetStackTraceString(traces) {
  // range 含有以下三个属性
  // base: 0x76894000
  // size: 61440
  // protection: r-x
  var range;
  
  // "base": "0x768a5000",
  // "name": "libComm.so",
  // "path": "/data/data/com.Autel.maxi/app_myLibs/libComm.so",
  // "size": 376832
  var module;
  
  // "offset": 12288,
  // "path": "/system/lib/libc.so",
  // "size": 0
  var rangeFile = null;
  var str;
  var traceString = "";

  for (var i in traces) {
    var moduleName = "null";
    var moduleBase = 0;
    //range = Process.findRangeByAddress(traces[i]);
    module = Process.findModuleByAddress(traces[i]);
    if (module) {
      moduleName = module.name;
      moduleBase = module.base;
    }
    str = i + ": " + moduleName + ", address: " + traces[i] + ", offset: 0x" + (parseInt(traces[i]) - parseInt(moduleBase)).toString(16).toUpperCase() + "\n";
    traceString += str;
  }
  return traceString + "\n";
}

// ****************************************
// ****************************************
/////////////////////////////////
// CBinary 类 的 JavaScript 包装类
/////////////////////////////////
function CBinary(values) {
  this.objPtr = null;
  if (values instanceof NativePointer) { // 参数是对象指针
    this.objPtr = values;
  } else if (typeof(values) == "number") {
    
    
  } else if (values instanceof Array) { // 参数是一个数组
    this.createObj();
    this.append(values);
  }
};

/////////////////////////////////
// CBinary 类的静态成员 和 静态函数
/////////////////////////////////
CBinary.__libName = "libPubFunctional.so",
CBinary.__constructor = getMyFunction(CBinary.__libName, "_ZN7CBinaryC2Ev", "pointer", ["pointer"]),
CBinary.__deconstructor = getMyFunction(CBinary.__libName, "_ZN7CBinaryD2Ev", "pointer", ["pointer"]),
CBinary.__setAt = getMyFunction(CBinary.__libName, "_ZN7CBinary5SetAtEsh", "int", ["pointer", "int", "int"]),
CBinary.__getAt = getMyFunction(CBinary.__libName, "_ZNK7CBinary5GetAtEs", "int", ["pointer", "int"]),
CBinary.__append = getMyFunction(CBinary.__libName, "_ZN7CBinary6AppendEPKhs", "int", ["pointer", "pointer", "int"]),
CBinary.__append1 = getMyFunction(CBinary.__libName, "_ZN7CBinary6AppendEPVKhs", "int", ["pointer", "pointer", "int"]),
CBinary.__isEmpty = getMyFunction(CBinary.__libName, "_ZNK7CBinary7IsEmptyEv", "int", ["pointer"]),
CBinary.__getSize = getMyFunction(CBinary.__libName, "_ZNK7CBinary7GetSizeEv", "int", ["pointer"]),
CBinary.__getBuffer = getMyFunction(CBinary.__libName, "_ZNK7CBinary9GetBufferEv", "pointer", ["pointer"]);
CBinary.__compare = getMyFunction(CBinary.__libName, "_ZN7CBinary7CompareERKS_", "int", ["pointer", "pointer"]);
CBinary.__operator_AddEq = getMyFunction(CBinary.__libName, "_ZN7CBinarypLEh", "int", ["pointer"]);

/////////////////////////////////
// CBinary 类的成员函数
/////////////////////////////////
CBinary.prototype.createObj = function () {
  var objPtr = null;
  objPtr = Memory.alloc(8);
  if (objPtr == null) {
    throw new ReferenceError("Frida: Memory.alloc() Failed for CBinary Object.");
  }
  this.objPtr = objPtr;
  CBinary.__constructor.nativeFunc(objPtr);
  return this;
},
CBinary.prototype.release = function () {
  CBinary.__deconstructor.nativeFunc(this.objPtr);
},
CBinary.prototype.getCounter = function () {
  var buf = Memory.readPointer(ptr(parseInt(this.objPtr) + 4));
  var ret = 0;
  if (parseInt(buf) != 0) {
    ret = Memory.readU16(ptr(parseInt(buf) + 0xA));
  }
  return ret;
},
CBinary.prototype.setAt = function (index, value) {
  return CBinary.__setAt.nativeFunc(this.objPtr, parseInt(index), parseInt(value));
},
CBinary.prototype.getAt = function (index) {
  return CBinary.__getAt.nativeFunc(this.objPtr, parseInt(index));
},
CBinary.prototype.append = function (ary) {
  var len = ary.length;
  if (len == 0) {
    return 0;
  }
  var bufView = new Uint8Array(new ArrayBuffer(len));
  for (i = 0; i < len; i++) {
    bufView[i] = ary[i] != null ? ary[i] : 0;
  }
  buf = Memory.alloc(len);
  Memory.writeByteArray(buf, bufView.buffer);
  return CBinary.__append.nativeFunc(this.objPtr, buf, len);
},
CBinary.prototype.getSize = function () {
  return parseInt(CBinary.__getSize.nativeFunc(this.objPtr));
},
CBinary.prototype.getBuffer = function () {
  return CBinary.__getBuffer.nativeFunc(this.objPtr);
},
CBinary.prototype.isEmpty = function () {
  return CBinary.__isEmpty.nativeFunc(this.objPtr) == 1;
},
CBinary.prototype.compare = function (otherObj) {
  return CBinary.__compare.nativeFunc(this.objPtr, otherObj.objPtr);
};

// ****************************************
// ****************************************

function ReadCBinary(objaddr) {
  ptr1 = parseInt(Memory.readPointer(ptr(objaddr+4)));
  used = Memory.readU16(ptr(ptr1+4));
  total = Memory.readU16(ptr(ptr1+6));
  space = Memory.readPointer(ptr(ptr1));
  buf = Memory.readByteArray(ptr(space), used);
  binary = new Object()
  binary["space"] = buf
  binary["total"] = total
  binary["used"] = used
  return binary
}

function DString(objaddr) {
  objaddr = parseInt(objaddr);
  var end = new NativePointer(objaddr + 0x10);
  var begin = new NativePointer(objaddr + 0x14);

  this.end = Memory.readPointer(end);
  this.begin = Memory.readPointer(begin);
  this.size = parseInt(end) - parseInt(begin);
  this.cstr = Memory.readCString(this.begin, this.size);
}

function CBinaryGroup(objaddr) {
  objaddr = parseInt(objaddr);
  var begin = new NativePointer(objaddr + 0x04);
  var end = new NativePointer(objaddr + 0x08);

  this.end = Memory.readPointer(end);
  this.begin = Memory.readPointer(begin);
}

libDiagBase = parseInt(Module.findBaseAddress("libDiag.so"));




/*
Interceptor.attach(ptr(libDiagBase + 0x0005A768 + 1), {
  onEnter: function(args) {
    console.log("\n-----------");
    console.log(args[1]);
    console.log(args[2]);
  },
  onLeave: function(retval) {
  }
});
*/

/*
Interceptor.attach(ptr(libDiagBase + 0x0005A4A0 + 1), {
  onEnter: function(args) {
    this.str_p2 = new DString(args[1]);
    this.binary = new CBinary(args[2]);
    console.log("\n-----------");
    console.log(hexdump(this.binary.getBuffer(), {
      offset: 0,
      length: this.binary.getSize(),
      header: true,
      ansi: true
    }));
    console.log(this.str_p2.cstr);
    
    //this.StackTraceString = GetStackTraceString(Thread.backtrace(this.context));
    
    //this.g_bgroups = new CBinaryGroup(libDiagBase+0x003DF0EC);
    //var begin = parseInt(this.g_bgroups.begin);
    //var end = parseInt(this.g_bgroups.end);
    //console.log("\n");
    //for (var i = begin; i != end; i += 8) {
    //  var thisBin = new CBinary(ptr(i));
    //  console.log(hexdump(thisBin.getBuffer(), {
    //    offset: 0,
    //    length: thisBin.getSize(),
    //    header: true,
    //    ansi: true
    //  }));
    //}
  },
  onLeave: function(retval) {
  }
});
*/


/*
// read tab content to std::string
// std::string XXX(TabContent, std::string section, std::string option);
Interceptor.attach(ptr(libDiagBase + 0x00120AB4 + 1), {
  onEnter: function(args) {
    this.str_p2 = new DString(args[2]);
    this.str_p3 = new DString(args[3]);
    this.StackTraceString = GetStackTraceString(Thread.backtrace(this.context));
  },
  onLeave: function(retval) {
    if (this.str_p2.cstr == "Netlayer" && this.str_p3.cstr == "EnterCondition") {
      retstr = new DString(retval);
      console.log("\"" + retstr.cstr + "\"\n" + this.StackTraceString);
    }
  }
});
*/

/*
// read tab content to CBinary, and append to CBinaryGroup
// void XXX(CBinaryGroup*, TabContent, std::string section, std::string option);
Interceptor.attach(ptr(libDiagBase + 0x00057F64 + 1), {
  onEnter: function(args) {
    this.str_p2 = new DString(args[2]);
    this.str_p3 = new DString(args[3]);
    this.StackTraceString = GetStackTraceString(Thread.backtrace(this.context));
  },
  onLeave: function(retval) {
    if (this.str_p2.cstr == "Netlayer" && this.str_p3.cstr == "EnterCondition") {
      bgroup = new CBinaryGroup(retval);
      var begin = parseInt(bgroup.begin);
      var end = parseInt(bgroup.end);
      console.log("\n" + this.StackTraceString + "CBinaryGroup size:" + (end - begin));
      for (var i = begin; i != end; i += 8) {
        var thisBin = new CBinary(ptr(i));
        console.log(hexdump(thisBin.getBuffer(), {
          offset: 0,
          length: thisBin.getSize(),
          header: true,
          ansi: true
        }));
      }
    }
  }
});
*/



// CBinary::~CBinary(), Hook 析构函数
//Interceptor.attach(CBinary.__deconstructor.funcPtr, {
//  onEnter: function(args) {
//    this.arg0 = parseInt(args[0]);
//    this.StackTraceString = GetStackTraceString(Thread.backtrace(this.context));
//    this.ctx = this.context;
//
//    if (this.arg0 != 0) {
//      var thisBin = new CBinary(ptr(this.arg0));
//      var thisBinSize = thisBin.getSize()
//      var at = thisBin.getAt(15);
//      console.log("size:" + thisBinSize + "\n" + hexdump(thisBin.getBuffer(), {
//        offset: 0,
//        length: thisBinSize,
//        header: true,
//        ansi: true
//      }) + "\n" + this.StackTraceString);
//    }
//  },
//  onLeave: function(retval) {
//  }
//});



Interceptor.attach(CBinary.__setAt.funcPtr, {
  onEnter: function(args) {
    this.arg0 = parseInt(args[0]);
    this.StackTraceString = GetStackTraceString(Thread.backtrace(this.context));
    this.ctx = this.context;
  },
  onLeave: function(retval) {
    if (this.arg0 != 0) {
      var thisBin = new CBinary(ptr(this.arg0));
      var thisBinSize = thisBin.getSize()
      var at = thisBin.getAt(0);
      //if (at == 0xEE)
        console.log("size:" + thisBinSize + "\n" + hexdump(thisBin.getBuffer(), {
          offset: 0,
          length: thisBinSize,
          header: true,
          ansi: true
        }) + "\n" + this.StackTraceString);

    }
  }
});


/*
Interceptor.attach(CBinary.__operator_AddEq.funcPtr, {
  onEnter: function(args) {
    this.arg0 = parseInt(args[0]);
    this.StackTraceString = GetStackTraceString(Thread.backtrace(this.context));
    this.ctx = this.context;
  },
  onLeave: function(retval) {
    if (this.arg0 != 0) {
      var thisBin = new CBinary(ptr(this.arg0));
      var thisBinSize = thisBin.getSize();
      var at = thisBin.getAt(15);
      console.log("size:" + thisBinSize + "\n" + hexdump(thisBin.getBuffer(), {
        offset: 0,
        length: thisBinSize,
        header: true,
        ansi: true
      }) + "\n" + this.StackTraceString);

    }
  }
});
*/

/*
Interceptor.attach(CBinary.__append.funcPtr, {
  onEnter: function(args) {
    this.arg0 = parseInt(args[0]);
    this.StackTraceString = GetStackTraceString(Thread.backtrace(this.context));
    this.ctx = this.context;
  },
  onLeave: function(retval) {
    if (this.arg0 != 0) {
      var thisBin = new CBinary(ptr(this.arg0));
      var thisBinSize = thisBin.getSize();
      var at = thisBin.getAt(15);
      console.log("size:" + thisBinSize + "\n" + hexdump(thisBin.getBuffer(), {
        offset: 0,
        length: thisBinSize,
        header: true,
        ansi: true
      }) + "\n" + this.StackTraceString);

    }
  }
});
*/


/*
Interceptor.attach(CBinary.__getAt.funcPtr, {
  onEnter: function(args) {
    this.arg0 = parseInt(args[0]);
    this.StackTraceString = GetStackTraceString(Thread.backtrace(this.context));
    this.ctx = this.context;
  },
  onLeave: function(retval) {
    if (this.arg0 != 0) {
      var thisBin = new CBinary(ptr(this.arg0));
      var thisBinSize = thisBin.getSize();
      var at = thisBin.getAt(15);
      console.log("size:" + thisBinSize + "\n" + hexdump(thisBin.getBuffer(), {
        offset: 0,
        length: thisBinSize,
        header: true,
        ansi: true
      }) + "\n" + this.StackTraceString);

    }
  }
});
*/