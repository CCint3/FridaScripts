function Reflect(className) {
  Java.perform(function() {
    // JavaScript wrapper Of Java Primitive Classes.
    Reflect.useBoolean = Java.use("java.lang.Boolean");
    Reflect.useCharacter = Java.use("java.lang.Character");
    Reflect.useByte = Java.use("java.lang.Byte");
    Reflect.useShort = Java.use("java.lang.Short");
    Reflect.useInteger = Java.use("java.lang.Integer");
    Reflect.useLong = Java.use("java.lang.Long");
    Reflect.useFloat = Java.use("java.lang.Float");
    Reflect.useDouble = Java.use("java.lang.Double");

    // boolean.class
    Reflect.boolean_class = Reflect.useBoolean["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Boolean();
    Reflect.newBoolean = function(val) { return Reflect.useBoolean.$new(val); };

    // char.class
    Reflect.char_class = Reflect.useCharacter["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Character();
    Reflect.newCharacter = function(val) { return Reflect.useCharacter.$new(val); };

    // byte.class
    Reflect.byte_class = Reflect.useByte["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Byte();
    Reflect.newByte = function(val) { return Reflect.useByte.$new(val); };

    // short.class
    Reflect.short_class = Reflect.useShort["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Short();
    Reflect.newShort = function(val) { return Reflect.useShort.$new(val); };

    // int.class
    Reflect.int_class = Reflect.useInteger["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Integer();
    Reflect.newInteger = function(val) { return Reflect.useInteger.$new(val); };

    // long.class
    Reflect.long_class = Reflect.useLong["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Long();
    Reflect.newLong = function(val) { return Reflect.useLong.$new(val); };

    // float.class
    Reflect.float_class = Reflect.useFloat["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Float();
    Reflect.newFloat = function(val) { return Reflect.useFloat.$new(val); };

    // double.class
    Reflect.double_class = Reflect.useDouble["class"].getDeclaredField("TYPE").get(null);
    // new java.lang.Double();
    Reflect.newDouble = function(val) { return Reflect.useDouble.$new(val); };
  });

  this.__className__ = className;
  this.__javaUse__ = Java.use(this.__className__);
  this.__clazz__ = this.__javaUse__["class"];

  this.field = new function(clazz) {
    this.__clazz__ = clazz;

    this.__proto__.find = function(name) {
      var field;
      try {
        field = this.__clazz__.getDeclaredField(name);
      } catch(e) {
        field = this.__clazz__.getField(name);
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
  } (this.__clazz__);

  this.method = new function(clazz) {
    this.__clazz__ = clazz;

    // find("get", [paramType1, paramType2]);
    this.__proto__.find = function(name, paramTypes) {
      var method;
      try {
        method = this.__clazz__.getDeclaredMethod(name, paramTypes);
      } catch(e) {
        method = this.__clazz__.getMethod(name, paramTypes);
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
  } (this.__clazz__);
};