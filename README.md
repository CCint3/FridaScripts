# Frida JavaScript.

[TOC]

[ js_JavaReflect.js](./js_JavaReflect.js)

## js_JavaReflect.js

这是一个简单封装了 `Java Reflect` 机制的 `Frida` 脚本；

它可以让你在 `Frida JavaScript` 中使用`Java Reflect`；

一个简单的示例：

```javascript
// 通过反射获取某类的静态字段和成员字段；
// 通过反射调用某类的静态方法和成员方法；
// 通过反射获取 Java 基础数据类型的 class; 例如： int.class, boolean.class；
// 通过 Frida 提供的 API 创建 Java 对象；
Java.perform(function () {
  var rList = new Reflect("java.util.List");
  var rList = new Reflect("java.util.List");
  var rF = new Reflect("com.ishumei.a.f");
  var rF$d = new Reflect("com.ishumei.a.f$d");

  // com.ishumei.a.f instance = com.ishumei.a.f.getInstance();
  var instance = rF.method.invoke("a", null, null, null);

  var smidForm = rF.field.getObj("c", instance);
  console.log("smidForm: " + smidForm);

  // String genSmid = instance.genSmid();
  var genSmid = rF.method.invoke("e", null, instance, null);
  console.log("genSmid: " + genSmid);

  // List<SaveMethod> saveMethodList = instance.saveMethodList;
  var saveMethodList = rF.field.getObj("e", instance);

  // int saveMethodListSize = saveMethodList.size();
  var saveMethodListSize = rList.method.invoke("size", null, saveMethodList, null);

  // iterator saveMethodList.
  for(var i = 0; i < saveMethodListSize; i++) {
    // 需要注意的是，List.get 方法的参数类型是 int.class 而不是 java.lang.Integer.class
    // 反射调用 Java 方法时，如果参数类型是基础类型，那么需要创建它的包装类对象传递给该方法；
    // Reflect已经对八种基础数据类型进行了封装:
    //   Reflect.int_class 等效于 int.class
    //   Reflect.newInteger(val) 等效于 new java.lang.Integer(val)
    //   对于其他基础类型和它的包装类，请替换 int_class 和 newInteger 即可；
    // SaveMethod saveMethod = saveMethodList.get(i);
    var saveMethod = rList.method.invoke("get", [Reflect.int_class], saveMethodList, [Reflect.newInteger(i)]);

    // String saveMethodName = saveMethod.name;
    var saveMethodName = rF$d.field.getObj("c", saveMethod)

    // String smid = saveMethod.smid();
    var smid = rF$d.method.invoke("a", null, saveMethod, null);
    console.log(saveMethodName + ": " + smid);
  }
});
```