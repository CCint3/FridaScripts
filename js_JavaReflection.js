
function Reflection(className) {
  Java.perform(function() {
    // JavaScript wrapper Of Java Reflection.
    Reflection.useAccessibleObject = Java.use("java.lang.reflect.AccessibleObject");
    Reflection.useArray = Java.use("java.lang.reflect.Array");
    Reflection.useField = Java.use("java.lang.reflect.Field");
    Reflection.useMethod = Java.use("java.lang.reflect.Method");

    // JavaScript wrapper Of Java Primitive Classes.
    Reflection.useBoolean = Java.use("java.lang.Boolean");
    Reflection.useCharacter = Java.use("java.lang.Character");
    Reflection.useByte = Java.use("java.lang.Byte");
    Reflection.useShort = Java.use("java.lang.Short");
    Reflection.useInteger = Java.use("java.lang.Integer");
    Reflection.useLong = Java.use("java.lang.Long");
    Reflection.useFloat = Java.use("java.lang.Float");
    Reflection.useDouble = Java.use("java.lang.Double");

    // boolean.class
    Reflection.boolean_class = Reflection.useBoolean["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Boolean();
    Reflection.newBoolean = function(val) { return Reflection.useBoolean.$new(val); };

    // char.class
    Reflection.char_class = Reflection.useCharacter["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Character();
    Reflection.newCharacter = function(val) { return Reflection.useCharacter.$new(val); };

    // byte.class
    Reflection.byte_class = Reflection.useByte["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Byte();
    Reflection.newByte = function(val) { return Reflection.useByte.$new(val); };

    // short.class
    Reflection.short_class = Reflection.useShort["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Short();
    Reflection.newShort = function(val) { return Reflection.useShort.$new(val); };

    // int.class
    Reflection.int_class = Reflection.useInteger["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Integer();
    Reflection.newInteger = function(val) { return Reflection.useInteger.$new(val); };

    // long.class
    Reflection.long_class = Reflection.useLong["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Long();
    Reflection.newLong = function(val) { return Reflection.useLong.$new(val); };

    // float.class
    Reflection.float_class = Reflection.useFloat["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Float();
    Reflection.newFloat = function(val) { return Reflection.useFloat.$new(val); };

    // double.class
    Reflection.double_class = Reflection.useDouble["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Double();
    Reflection.newDouble = function(val) { return Reflection.useDouble.$new(val); };
  });

  this.__className__ = className;
  this.__javaUse__ = Java.use(this.__className__);
  this.clazz = this.__javaUse__["class"];

  this.field = new function(clazz) {
    this.clazz = clazz;

    this.__proto__.find = function(name) {
      var field;
      try {
        field = this.clazz.getDeclaredField(name);
      } catch(e) {
        field = this.clazz.getField(name);
      }
      return field;
    };

    this.__proto__.getObj = function(name, obj) {
      var isAccessible = true;
      var retval;
      var field = this.find(name);
      isAccessible = field.isAccessible();
      if (!isAccessible) field.setAccessible(true);
      retval = field.get(obj);
      if (!isAccessible) field.setAccessible(false);
      return retval;
    };

    this.__proto__.set = function(name, obj, val) {
      var isAccessible = true;
      var field = this.find(name);
      isAccessible = field.isAccessible();
      if (!isAccessible) field.setAccessible(true);
      field.set.overload('java.lang.Object', 'java.lang.Object').call(field, obj, val);
      if (!isAccessible) field.setAccessible(false);
    };

    this.__proto__.setBoolean = function(name, obj, bool) {
      var isAccessible = true;
      var field = this.find(name);
      isAccessible = field.isAccessible();
      if (!isAccessible) field.setAccessible(true);
      field.setBoolean.overload('java.lang.Object', 'boolean').call(field, obj, bool);
      if (!isAccessible) field.setAccessible(false);
    };

    this.__proto__.setInt = function(name, obj, i) {
      var isAccessible = true;
      var field = this.find(name);
      isAccessible = field.isAccessible();
      if (!isAccessible) field.setAccessible(true);
      field.setInt.overload('java.lang.Object', 'int').call(field, obj, i);
      if (!isAccessible) field.setAccessible(false);
    };
  } (this.clazz);

  this.method = new function(clazz) {
    this.clazz = clazz;

    // find("get", [paramType1, paramType2]);
    this.__proto__.find = function(name, paramTypes) {
      var method;
      try {
        method = this.clazz.getDeclaredMethod(name, paramTypes);
      } catch(e) {
        method = this.clazz.getMethod(name, paramTypes);
      }
      return method;
    };

    // invoke("get", [paramType1, paramType2], instance, [param1, param2]);
    this.__proto__.invoke = function(name, paramTypes, obj, params) {
      var isAccessible = true;
      var retval;
      var method = this.find(name, paramTypes);
      isAccessible = method.isAccessible();
      if (!isAccessible) method.setAccessible(true);
      retval = method.invoke(obj, params);
      if (!isAccessible) method.setAccessible(false);
      return retval;
    };
  } (this.clazz);
};
