
var fun_libc_dlopen = Module.findExportByName("libc.so", "dlopen");
var fun_libz_inflate = NULL;

Interceptor.attach(fun_libc_dlopen, {
  onEnter: function (args) {
  },
  onLeave: function (retval) {
    if (fun_libz_inflate == NULL) {
      fun_libz_inflate = Module.findExportByName("libz.so", "inflate");
      if (fun_libz_inflate != NULL) {
        Interceptor.attach(fun_libz_inflate, {
          onEnter: function (args) {
            this.thisPtr = parseInt(args[0]);
            //console.log(ptr(this.thisPtr));
          },
          onLeave: function (retval) {
            //console.log(ptr(this.thisPtr) + " __");
            var next_out =  Memory.readPointer(ptr(this.thisPtr+0x0C));
            var avail_out = Memory.readU32(ptr(this.thisPtr+0x10));
            console.log(next_out + " __ " + avail_out);
            //var buf = Memory.readByteArray(next_out, avail_out);
            //console.log(hexdump(buf, {
            //  offset: next_out,
            //  length: avail_out,
            //  header: true,
            //  ansi: true
            //}));
          }
        });
      }
    }
  }
});
