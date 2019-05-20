'use strict';

var ptr_linker = Module.findBaseAddress("linker");

var offset_linker_CallFunction = 0x2744;
var offset_linker_dlopen       = 0x29CC;
var offset_linker_relocate     = 0x1468;

var ptr_linker_CallFunction = ptr_linker.add(offset_linker_CallFunction+1);
var ptr_linker_dlopen       = ptr_linker.add(offset_linker_dlopen+1);
var ptr_linker_relocate     = ptr_linker.add(offset_linker_relocate+1);

var dumpLibName = "libDiag.so"


var func_relocate = new NativeFunction(ptr_linker_relocate, 'int', ['pointer', 'pointer', 'uint32', 'pointer']);
Interceptor.replace(func_relocate, new NativeCallback(function (si, rel, count, needed) {
  var logd = false;
    var log = "linker.relocate:\n";
    var libName = Memory.readCString(si);
    var retval = 0;
    log += "  lib name: \"" + libName + "\"\n";
    if (libName.indexOf(dumpLibName) != -1) {
      log += "  the \"" + libName + "\" relocate is ignored.\n";
      logd = true
    } else {
      retval = func_relocate(si, rel, count, needed);
    }
    if (logd) console.log(log + "\n");
    return retval;
}, 'int', ['pointer', 'pointer', 'uint32', 'pointer']));



var func_linker_CallFunction = new NativeFunction(ptr_linker_CallFunction, 'void', ['pointer', 'pointer', 'pointer']);
Interceptor.replace(func_linker_CallFunction, new NativeCallback(function (soinfo, func_name, func_ptr) {
  var libName = Memory.readCString(soinfo);
  var fucName = Memory.readCString(func_name);
  var log = "";

  // linker.CallFunction onEnter

  func_linker_CallFunction(soinfo, func_name, func_ptr);

  // linker.CallFunction onLeave

  if (libName == dumpLibName && fucName == "DT_INIT") {
    var so_base = Memory.readPointer(soinfo.add(0x8C)); // read soinfo::base;
    var so_size = Memory.readU32(soinfo.add(0x90));     // read soinfo::size;
    var dumpfilepath = "/sdcard/" + libName + ".dump";
    log = "\n======\ndump " + libName + "\n";
    log += "save to: " + dumpfilepath + "\n";
    log += "address: " + so_base + ", size: 0x" + so_size.toString(16) + "\n";
    console.log(log + "======\n");
    Memory.protect(so_base, so_size, "rwx");
    var dumpfile = new File(dumpfilepath, "wb");
    dumpfile.write(Memory.readByteArray(so_base, so_size));
    dumpfile.flush();
    dumpfile.close();
    Thread.sleep(10)
  }

}, 'void', ['pointer', 'pointer', 'pointer']));


