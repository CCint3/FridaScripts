var module_base_linker = Module.findBaseAddress("linker");

var func_offset_relocate = 0x1468;
var func_ptr_relocate = ptr(parseInt(module_base_linker) + func_offset_relocate + 1);
var func_relocate = new NativeFunction(func_ptr_relocate, 'int', ['pointer', 'pointer', 'uint32', 'pointer']);
Interceptor.replace(func_ptr_relocate, new NativeCallback(function (si, rel, count, needed) {
    var txt_log = "relocate:\n";
    var library_name = Memory.readCString(si);
    var ret_val = 0;
    txt_log += "  relocating library name: " + library_name + "\n";
    if (library_name == "libDiag.so") {
      txt_log += "  the libDiag.so relocate is ignored.\n";
    } else {
      ret_val = func_relocate(si, rel, count, needed);
    }
    txt_log += "  return value: " + ret_val + "\n";
    console.log(txt_log);
    return ret_val;
}, 'int', ['pointer', 'pointer', 'uint32', 'pointer']));

var func_offset_CallFunction = 0x2744;
var func_ptr_CallFunction = ptr(parseInt(module_base_linker) + func_offset_CallFunction + 1);
var func_CallFunction = new NativeFunction(func_ptr_CallFunction, 'void', ['pointer', 'pointer', 'pointer']);
Interceptor.replace(func_ptr_CallFunction, new NativeCallback(function (si, func_name, func_ptr) {
    var txt_log = "CallFunction:\n";
    var library_name = Memory.readCString(si);
    var calling_func_name = Memory.readCString(func_name);

    txt_log += "  calling " + calling_func_name + " in library " + library_name + "\n";
    func_CallFunction(si, func_name, func_ptr);

    if (library_name == "libDiag.so" && calling_func_name == "DT_INIT") {
      var so_base = Memory.readPointer(ptr(parseInt(si) + 0x8C)); // read soinfo::base;
      var so_size = Memory.readU32(ptr(parseInt(si) + 0x90));     // read soinfo::size;
      txt_log += "  begin dump libDiag.so --------------------------------------\n";
      txt_log += "  soinfo.base: " + so_base + ", soinfo.size: " + so_size + "\n";

      Memory.protect(so_base, so_size, "rwx");

      send("dump_end", Memory.readByteArray(so_base, so_size));
      
      txt_log += "  thread sleep for send data to python.\n";
      Thread.sleep(1)
      txt_log += "  end dump libDiag.so ----------------------------------------\n";
    }

    console.log(txt_log);
}, 'void', ['pointer', 'pointer', 'pointer']));