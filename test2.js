
Java.perform(function () {
  var ThreadWrapper = Java.use("java.lang.Thread");
  //var f4Wrapper = Java.use("com.illuminate.texaspoker.net.a.f$4");
  var f4Wrapper = Java.use("com.illuminate.texaspoker.e.b.f$5");
  var f5Methods = f4Wrapper.class.getDeclaredMethods();
  for (var i in f5Methods) {
    f5Methods[i].setAccessible(true);
    console.log(i + ": " + f5Methods[i]);
  }
  var f5Methods = f4Wrapper.class.getMethods();
  for (var i in f5Methods) {
    f5Methods[i].setAccessible(true);
    console.log(i + ": " + f5Methods[i]);
  }
  f4Wrapper.call.implementation = function() {
    console.log("--------------")
    var stackTrace = ThreadWrapper.currentThread().getStackTrace();
    for (var i in stackTrace) {
      console.log(i + ": " + stackTrace[i]);
    }
    
    var ret = this.call();
    console.log(ret);
    return ret;
  }
  
  //var fWrapper = Java.use("com.illuminate.texaspoker.net.a.f");
  var fWrapper = Java.use("com.illuminate.texaspoker.e.b.f");
  var PackageWrapper = Java.use("com.texaspoker.moment.TexasPokerCommon$Package");
  
  var ExecutorServiceWrapper = Java.use("java.util.concurrent.ExecutorService");
  var ExecutorsMethods = ExecutorServiceWrapper.class.getDeclaredMethods();
  console.log(ExecutorServiceWrapper.class);
  for (var i in ExecutorsMethods) {
    ExecutorsMethods[i].setAccessible(true);
    console.log(i + ": " + ExecutorsMethods[i].getName());
  }
  var ExecutorsMethods = ExecutorServiceWrapper.class.getMethods();
  console.log(ExecutorServiceWrapper.class);
  for (var i in ExecutorsMethods) {
    ExecutorsMethods[i].setAccessible(true);
    console.log(i + ": " + ExecutorsMethods[i].getName());
  }
  
  fWrapper.a.overload('com.texaspoker.moment.TexasPokerCommon$Package').implementation = function(arg1) {
    //var resolver = new ApiResolver('module');
    //resolver.enumerateMatches('exports:*!*call*', {
    //  onMatch: function (match) {
    //    /*
    //     * Where `match` contains an object like this one:
    //     *
    //     * {
    //     *     name: '/usr/lib/libSystem.B.dylib!opendir$INODE64',
    //     *     address: ptr('0x7fff870135c9')
    //     * }
    //     */
    //     console.log(match.name);
    //  },
    //  onComplete: function () {
    //  }
    //});
    
    console.log("--------------")
    console.log(arg1)
    var stackTrace = ThreadWrapper.currentThread().getStackTrace();
    for (var i in stackTrace) {
      console.log(i + ": " + stackTrace[i]);
    }
    
    var ret = this.a.overload('com.texaspoker.moment.TexasPokerCommon$Package').call(this, arg1);
    console.log(ret);
    //return ret;
    return true;
  }
  
  
  
  
  //
  //
  //var ClassLoaderWrapper = Java.use("java.lang.ClassLoader");
  //var ClassLoaderClass = ClassLoaderWrapper.class;
  //var ClassLoaderMethods = ClassLoaderClass.getDeclaredMethods();
  //for (var i in ClassLoaderMethods) {
  //  ClassLoaderMethods[i].setAccessible(true);
  //  //console.log(i + ": " + ClassLoaderMethods[i]);
  //}
  //console.log("---------");
  //
  //var URLClassLoaderWrapper = Java.use("java.net.URLClassLoader");
  //var URLClassLoaderClass = URLClassLoaderWrapper.class;
  //var URLClassLoaderMethods = URLClassLoaderClass.getDeclaredMethods();
  //for (var i in URLClassLoaderMethods) {
  //  URLClassLoaderMethods[i].setAccessible(true);
  //  //console.log(i + ": " + URLClassLoaderMethods[i].getName());
  //}
  //URLClassLoaderMethods = URLClassLoaderClass.getMethods();
  //for (var i in URLClassLoaderMethods) {
  //  URLClassLoaderMethods[i].setAccessible(true);
  //  //console.log(i + ": " + URLClassLoaderMethods[i].getName());
  //}
  //console.log(URLClassLoaderMethods[15]);
  //console.log("---------");
  //
  //
  //var URLWrapper = Java.use("java.net.URL");
  //
  //// 对于 $new 是不需要 .overload 去选择重载的，Frida会根据 参数类型 和 参数数量 自动选择一个合适的重载。
  //// 在这里，自动选用 .overload('java.lang.String')
  //var URLObject = URLWrapper.$new('file:/data/local/tmp/reflections-0.9.11.jar');
  //
  //// 在这里，自动选用 .overload('[java.net.URL')
  ////var URLClassLoaderObject = URLClassLoaderWrapper.$new([URLObject]);
  ////URLClassLoaderMethods[15].invoke(URLClassLoaderObject, ["org.reflections.util.ClasspathHelper"]);
  //
});
