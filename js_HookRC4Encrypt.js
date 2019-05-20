
function main() {

  if (Frida.version != "12.4.4") {
    return;
  }
  
  libcocos2djsBase = parseInt(Module.findBaseAddress('libcocos2djs.so'));
  
  
  Interceptor.attach(ptr(libcocos2djsBase+0x0116DABC), {
    onEnter: function(args) {
      console.log(args[0] + " _ " + args[1] + " _ " + args[2] + " _ " + args[3] + " _ ");
    },
    onLeave: function(retval) {
  
    }
  });
  
}

main()