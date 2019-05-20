
function GetStackTraceString(lr, tab) {
  var module;
  var str;
  var tabstr = "";
  if (tab == undefined) {
    tab = 1;
  }
  for (var i = 0; i != tab; i++) {
    tabstr += "  ";
  }

  var moduleName = "unknown";
  var moduleBase = 0;
  module = Process.findModuleByAddress(lr);
  if (module) {
    moduleName = module.name;
    moduleBase = parseInt(module.base);
  }
  lr = parseInt(lr);
  var off = (lr - moduleBase).toString(16).toUpperCase();
  str = "lr: { module: " + moduleName + ", address: 0x" + lr.toString(16).toUpperCase() + ", offset: 0x" + off + " }";
  return tabstr + str;
}

var libDiagBase = Module.findBaseAddress("libDiag.so");


Interceptor.attach(libDiagBase.add(0x196F49), {
  onEnter: function(args) {
    
    this.log = "  arg: 0x" + parseInt(args[1]).toString(16) + "\n";
    this.log = "  arg: 0x" + parseInt(args[2]).toString(16) + "\n";
    this.log += "  trace " + GetStackTraceString(this.context.lr, 0) + "\n";
  },
  onLeave: function(retval) {
    this.log += "  ret: "+ retval;
    console.log(this.log);
  }
});