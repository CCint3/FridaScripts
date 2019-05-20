

function GetStackTraceString(traces, tab) {
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
  var tabstr = "";
  for (var i = 0; i != tab; i++) {
    tabstr += "  ";
  }
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
    traceString += tabstr + str;
  }
  return traceString;
}

var MaxiDasBase = Module.findBaseAddress("libMaxiDas.so");
/*
Interceptor.attach(ptr(parseInt(MaxiDasBase) + 0xA2455), {
  onEnter: function (args) {
    this.log = "libMaxiDas.so.sub_A2454:\n";
    this.log += "  trace:\n" + GetStackTraceString(Thread.backtrace(this.context), 2);
  },
  onLeave: function (retval) {
    this.log += "  ret: " + retval + "\n";
    console.log(this.log + "\n");
  }
});
*/

Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
  onEnter: function (args) {
    this.log = "libc.fopen:\n";
    this.log += "  pathname: " + Memory.readCString(args[0]) + "\n";
    this.log += "  mode: " + Memory.readCString(args[1]) + "\n";
    this.log += "  trace:\n" + GetStackTraceString(Thread.backtrace(this.context), 2);
  },
  onLeave: function (retval) {
    this.log += "  ret: " + retval + "\n";
    console.log(this.log + "\n");
  }
});
