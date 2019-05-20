
var mod = Process.findModuleByName('libDiag.so');
Interceptor.attach(ptr(parseInt(mod.base)+0x23404+1), {
  onEnter: function(args) {
    console.log(args[0] + " _ " + args[1] + " _ " + args[2]);
    var strBegin = Memory.readPointer(ptr(parseInt(args[2])+0x14));
    var strEnd = Memory.readPointer(ptr(parseInt(args[2])+0x10));
    var buf = Memory.readByteArray(strBegin, parseInt(strEnd)-parseInt(strBegin));
    console.log(hexdump(buf, {
      offset: 0,
      length: parseInt(strEnd)-parseInt(strBegin),
      header: true,
      ansi: true
    }) + "\n");
  },
  onLeave: function(retval) {
  }
});




Interceptor.attach(ptr(parseInt(mod.base)+0x21CD6+1), {
  onEnter: function(args) {
    console.log(args[0] + " _ " + args[1] + " _ " + args[2] + " _ " + args[3]);
    var buf = Memory.readByteArray(ptr(args[0]), 4);
    console.log(hexdump(buf, {
      offset: 0,
      length: 4,
      header: true,
      ansi: true
    }) + "\n");
    buf = Memory.readByteArray(ptr(args[2]), 4);
    console.log(hexdump(buf, {
      offset: 0,
      length: 4,
      header: true,
      ansi: true
    }) + "\n");
  },
  onLeave: function(retval) {
  }
});

//var buf = Memory.readByteArray(ptr(parseInt(mod.base)+0xF53B8), 8);
//console.log(hexdump(buf, {
//  offset: 0,
//  length: 8,
//  header: true,
//  ansi: true
//}) + "\n");


