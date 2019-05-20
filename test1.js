

function HookObj(wrapper, clazz, fields, methods, constructors) {
  this.wrapper = wrapper;
  this.clazz = clazz;
  this.fields = fields;
  this.methods = methods;
  this.constructors = constructors;

  this.hook = function (funcName, func) {
    if (wrapper == null || wrapper[funcName] == null) {
      return false;
    }
    wrapper[funcName].implementation = func;
    return true;
  }
}

function HookJava() {
  this.hookObjects = {};

  this.loadClass = function (className) {
    var hookObj = null;
    var wrapper = null;
    var clazz = null;
    var fields = null;
    var methods = null;
    var constructors = null;

    hookObj = this.hookObjects[className];
    if (hookObj != null) {
      return hookObj;
    }
    try {
      // 通过 Frida 获取该类名的 JS 包装: wrapper
      wrapper = Java.use(className);

      // 获取该类名的 java.lang.class 对象
      clazz = wrapper.class;
      
      // 获取该类定义的成员
      fields = clazz.getDeclaredFields();
      for (var i in fields) {
        // 设置每个成员的可访问属性
        fields[i].setAccessible(true);
      }
      
      // 获取该类定义的方法
      methods = clazz.getDeclaredMethods();
      for (var i in methods) {
        // 设置每个方法的可访问属性
        methods[i].setAccessible(true);
      }
    } catch (e) {
      console.log(e);
    }

    if (wrapper == null) {
      return null
    }
    hookObj = new HookObj(wrapper, clazz, fields, methods, constructors);
    this.hookObjects[className] = hookObj;
    return hookObj;
  }
}

var hook = new HookJava();
var classesName = [
  "java.util.ArrayList",
  "java.lang.ClassLoader",
  "java.lang.Byte",
  "java.lang.Thread",
  "java.lang.Object",
  "java.lang.String",
  "java.lang.Integer",
  "java.lang.Exception",
  "java.lang.reflect.Array",
  "java.io.ByteArrayInputStream",
  "android.widget.TextView",
  "java.lang.CharSequence",
  "android.widget.TextView$BufferType",
  // ----------------------------------
  "com.illuminate.texaspoker.utils.NetworkUtil"
];

Java.perform(function () {
  //console.log(".");
  //console.log("begin load class!");
  //for (var i in classesName) {
  //  var hookObj = hook.loadClass(classesName[i]);
  //  if (hookObj == null) {
  //    console.log(classesName[i] + " load failed!");
  //  }
  //}
  //console.log("end load class!");
  
  var URLClassLoaderWrapper = Java.use("java.net.URLClassLoader");
  
  var URLWrapper = Java.use("java.net.URL");
  var URLObject = URLWrapper.$new('file:/data/local/tmp/reflections-0.9.11.jar');
  
  console.log(URLObject);
  
  //for (var i in URLnew) {
  //  console.log(i + ": " + URLnew[i]);
  //}
  //console.log("---------");
  //for (var i in URLnew.argumentTypes[0]) {
  //  console.log(i + ": " + URLnew.argumentTypes[0][i]);
  //}
  //console.log(URLnew.argumentTypes);
  //URLClassLoaderWrapper.$new().overload("[java.net.URL")([URLObj]);
  //var ClasspathHelperWrapper = Java.use("org.reflections.util.ClasspathHelper");
  //console.log(ClasspathHelperWrapper.contextClassLoader);
  
  //var PackageWrapper = Java.use("java.lang.Package");
  //console.log(PackageWrapper.getPackages());
  //var PackageClass = PackageWrapper.class;
  //var PackageMethods = PackageClass.getDeclaredMethods();
  //for (var i in PackageMethods) {
  //  PackageMethods[i].setAccessible(true);
  //}
  
  //var ClassLoaderWrapper = Java.use("java.lang.ClassLoader");
  //var ClassLoaderClass = ClassLoaderWrapper.class;
  //var ClassLoaderMethods = ClassLoaderClass.getDeclaredMethods();
  //for (var i in ClassLoaderMethods) {
  //  ClassLoaderMethods[i].setAccessible(true);
  //}
  //var systemClassLoaderObj = ClassLoaderWrapper.getSystemClassLoader();
  //var systemClassLoaderClass = systemClassLoaderObj.class;
  //var systemClassLoaderClassMethods = systemClassLoaderClass.getDeclaredMethods();
  //for (var i in systemClassLoaderClassMethods) {
  //  systemClassLoaderClassMethods[i].setAccessible(true);
  //  //console.log(i + ": " + systemClassLoaderClassMethods[i]);
  //}
  //console.log(systemClassLoaderObj.getParent().getParent());
  
  //var packages = systemClassLoaderObj.getPackages();
  //for (var i in packages) {
  //  console.log(i + ": " + packages[i]);
  //}

  //var NetworkUtil = hook.hookObjects["com.illuminate.texaspoker.utils.NetworkUtil"];
  ////for (var i in NetworkUtil.methods) {
  ////  console.log(NetworkUtil.methods[i]);
  ////}
  //
  //// Hook NetworkUtil.login == NetworkUtil.a('java.lang.String','java.lang.String','java.lang.String')
  //NetworkUtil.wrapper.a.overload('java.lang.String','java.lang.String','java.lang.String').implementation = function(arg1, arg2, arg3) {
  //  var log = "NetworkUtil.login:\n";
  //  log += "  strID: " + arg1 + "\n";
  //  log += "  strPWD: " + arg2 + "\n";
  //  log += "  strCountryCode: " + arg3 + "\n";
  //  var ret = this.a(arg1, arg2, arg3);
  //  log += "  ret: " + ret + "\n";
  //  console.log(log);
  //  return ret;
  //};
});
