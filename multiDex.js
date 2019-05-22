
//something from: https://bbs.pediy.com/thread-246767.htm

/******************************** Util begin ********************************/

// "%s and %d".format("string", 1);
String.prototype.format= function(){
    //将arguments转化为数组（ES5中并非严格的数组）
    var args = Array.prototype.slice.call(arguments);
    var count = 0;
    //通过正则替换%s
    return this.replace(/%s/g,function(s,i){
        return args[count++];
    });
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var Utils = {
    /**
     * trace
     * @param [int] [count=10]
     */
    trace: function (count) {
        var caller = arguments.callee.caller;
        var i = 0;
        count = count || 10;
        console.log("***----------------------------------------  ** " + (i + 1));
        while (caller && i < count) {
            console.log(caller.toString());
            caller = caller.caller;
            i++;
            console.log("***---------------------------------------- ** " + (i + 1));
        }
    },

    hook_RegisterNatives: function(){
        var env = Java.vm.getEnv();
        var handlePointer = Memory.readPointer(env.handle);
        console.log("handle: " + handlePointer);
        var nativePointer = Memory.readPointer(handlePointer.add(215 * Process.pointerSize))
        console.log("register: " + nativePointer);
        // send("JNI RegisterNatives:"+nativePointer);
    
        Interceptor.attach(nativePointer, {
            onEnter: function(args) {
                var native_methods     = args[2];
                var native_methods_cnt = args[3];
                console.log("register native : "+args[0]+",    "+args[1]+",    "+args[2]+","+args[3]);
                for (var i=0; i<native_methods_cnt; i++)
                {
                    var method_name      = Memory.readPointer(native_methods.add(12*i));
                    var methodName       = Memory.readCString(method_name);
                    var method_signature = Memory.readPointer(native_methods.add(12*i + 4));
                    var methodSignature  = Memory.readCString(method_signature);
                    var method_address   = Memory.readPointer(native_methods.add(12*i + 8));
                    console.log("address: " + method_address + ", name: " + methodName + ",    " + methodSignature);
                }
            }
        });
    },

    printDissambly: function (startAddr, line){
        try {
            var firstLine = Instruction.parse(startAddr);
            console.log(startAddr  + ": " + firstLine.toString());
            var curLine = firstLine;

            for(var i = 0; i < line ; i++){
                curLine = Instruction.parse(curLine.next);
                console.log(curLine.address + ": " + curLine.toString());
            }
        }
        catch (e) { 
            console.log("printDissambly execption!");
        }

        console.log(" ");
    },

    toFloat: function (value){
        var p = Memory.alloc(4);
        Memory.writeU32(p, parseInt(value));
        return Memory.readFloat(p);
        // return Memory.readFloat(p).toFixed(2);
    },

    toDouble: function (low, high){
        var p = Memory.alloc(8);
        Memory.writeU32(p, parseInt(low));
        Memory.writeU32(p.add(4), parseInt(high));
        return Memory.readDouble(p);
    },

    hexColour: function (c) {
        if (c < 256) {
            if (c < 0){c = 0xFF + c + 1;}
            var tmp = Number(c).toString(16);
            if(tmp.length < 2){tmp = "0" + tmp;}
            return tmp;
        }
        return 0;
    },

    getByteArray: function (arg0, length) {
        var buffer = Java.array('byte', arg0);
        // console.log(buffer.length);
        var result = "";
        if(length == undefined){
            length = buffer.length;
        }
        for(var i = 0; i < length; ++i){
            result += Utils.hexColour(buffer[i]);
        }
        return result;
    },

    // optimizedDirectory: 被 hook app 的私有目录(/data/data/com.xxx/cache)
    // load 成功之后可以使用 MyJavaUse 获取动态加载的类
    loadDex: function (dexPath, optimizedDirectory){  
        var cl = DexClassLoader.$new(dexPath, optimizedDirectory, null, Java.classFactory.loader);
        Java.classFactory.loader = cl;
    },

    // 必须 load ClassReflectionUtils 所在的 dex 才能调用
    getObjFieldAndValue: function (obj, privDir){  // privDir: /data/data/xxx/cache
        Utils.loadDex("/data/local/tmp/classes.dex", privDir);  // 需要最后 load 
        var ClassReflectionUtils = Utils.MyJavaUse("com.xxx.dynamicdex.ClassReflectionUtils");
        var array = Java.array("java.lang.String", []);
        return ClassReflectionUtils.getObjFieldAndValue(obj, array);
    }, 

    // 必须 load 所在的 dex 才能调用
    writeInputStreamToFile: function (ins, fileName, privDir){
        Utils.loadDex("/data/local/tmp/classes.dex", privDir);  // 需要最后 load 
        var StreamUtils = Utils.MyJavaUse("com.xxx.dynamicdex.StreamUtils");
        return StreamUtils.writeInputStreamToFile(ins, "/data/local/tmp/fridaf/StreamUtils/" + fileName);
    }, 

    strBase64: function (src, privDir){
        Utils.loadDex("/data/local/tmp/classes.dex", privDir);  // 需要最后 load 
        var StringUtils = Utils.MyJavaUse("com.xxx.dynamicdex.StringUtils");
        return StringUtils.strBase64(src);
    },

    // java: console.log(Log.$new().getStackTraceString(Throwabloe.$new()));
    PrintCallStack: function (context){
        console.log("called from:\n" +
            Thread.backtrace(context, Backtracer.FUZZY)
            .map(DebugSymbol.fromAddress).join("\n") + "\n");  
            // console.log("called from:\n" + Thread.backtrace(context, Backtracer.ACCURATE));   //FUZZY ACCURATE
    },

    MyJavaUse: function (className){
        return Java.classFactory.use(className);
    },

    randomFrom: function (lowerValue,upperValue){
        return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
    },

    WriteMemoryToFile: function (fileName, addr, length){
        var r3File = new File("/data/local/fridaf/" + fileName, "wb");
        r3File.write(Memory.readByteArray(addr, length));
        console.log("/data/local/fridaf/" + fileName + " saved.");
    },


    hookFuncByAddr: function (addr, callBack){
        Interceptor.attach(ptr(parseInt(addr)), callBack);
    },
    
    hookFuncByAddrS: function (addr, callBacks){
        for(var i = 0; i < addr.length; i++){
            Interceptor.attach(ptr(parseInt(addr[i])), callBacks[i]);
        }
    },
    
    hookFuncByName: function (soName, funcName, callBacks){
        var funcAddr = Module.findExportByName(soName, funcName);
    
        Utils.hookFuncByAddr(funcAddr, callBacks);
    },
    
    hookFuncByNameS: function (soName, funcNames, callBacks){
        for(var i = 0; i < funcNames.length; i++){
            var funcAddr = Module.findExportByName(soName, funcNames[i]);
            if(funcAddr == null){
                console.log("so: %s, func: %s get addr null.".format(soName, funcNames[i]));
                return;
            }
    
            Utils.hookFuncByAddr(funcAddr, callBacks[i]);
        }
    },

    
    hookSoWhenRun: function (libNames, hookFuncs){  // libNames: [libxxx.so, libyyy.so]
        //加载时 hook
        var dlopenAddr = Module.findExportByName("/system/bin/linker", "dlopen");
        console.log("dlopen addr: " + dlopenAddr);
        Interceptor.attach(ptr(parseInt(dlopenAddr)), {
            onEnter: function (args) {
                this.dlName = Memory.readCString(args[0]);
            },
            onLeave: function (retval) {
                console.log("dlopen so: " + this.dlName + ", and base: " + Module.findBaseAddress(this.dlName));

                for(var i = 0; i < libNames.length; i++){
                    if(this.dlName.indexOf(libNames[i]) >= 0){
                        hookFuncs[i]();
                    }
                }
            }
        });
    },

    HookSoImmediately: function (hookFuncs){
        for(var i = 0; i < hookFuncs.length; i++){
            hookFuncs[i]();
        }
    }
}
/**************************************************** Util end ****************************************************/


/************************************************* Framwork begin *************************************************/
var Log;
var Throwabloe;
var _String;
var btstream;
var DataOutputStream;
var Date;
var Base64;
var DexClassLoader;
var SecretKeySpec;
var privDir;

Java.perform(function () {
    
    // hookSo();
    hookJava();

    userFunc();
});

/************************************************* Framwork end ***************************************************/


/************************************************ Customized native begin ************************************************/

function hookSo(){
    var libNames = ["xx.so"];
    var hookFuncs = [xx]

    // hookSoWhenRun(libNames, hookFuncs);
    Utils.HookSoImmediately(hookFuncs);
}

/************************************************ Customized native end **************************************************/


/************************************************ Customized js begin ************************************************/

function userFunc(){
}

/************************************************ Customized js end **************************************************/



/************************************************ Customized java begin ************************************************/

function attachEndJavaHook (){
    var esw = Utils.MyJavaUse("esw"); //这里不能直接使用Java.use，因为java.use会检查在不在perform里面，不在就会失败
    
    esw.b.overload('java.lang.String', 'java.lang.String')
    .implementation = function (arg1, arg2) {
        console.log("esw.b() got called");
        esw.b();
    };

    // Java.perform(function () {
    //     // 可以使用 Java.use
    // });
}

function hookJava(){
    Log = Java.use("android.util.Log");
    Throwabloe = Java.use("java.lang.Throwable");
    _String = Java.use("java.lang.String");
    btstream = Java.use("java.io.ByteArrayOutputStream");
    DataOutputStream = Java.use("java.io.DataOutputStream");
    Date = Java.use("java.util.Date");
    Base64 = Java.use("android.util.Base64");
    DexClassLoader = Java.use("dalvik.system.DexClassLoader");
    SecretKeySpec = Java.use("javax.crypto.spec.SecretKeySpec");

    privDir = "/data/data/com.netflix.mediaclient/cache";

    // load ClassReflectionUtils 所在的 dex
    // loadDex("/data/local/tmp/classes.dex", "/data/data/com.xxx/cache");

    // var application = Java.use("android.app.Application");
    // console.log("application: " + application);

    // application.attach.overload('android.content.Context')
    // .implementation = function(context) {
    //     var result = this.attach(context); // 先执行原来的attach方法
    //     var classloader = context.getClassLoader(); // 获取classloader

    //     Java.classFactory.loader = classloader;  //替换 loader

    //     attachEndJavaHook();

    //     return result;
    // }

    // var b_u = MyJavaUse("com.d.a.b.u");  //socket recv
    // b_u.$init.overload('java.util.List', 'java.lang.String', 'int', 'int', 'com.d.a.b.p')
    // .implementation = function () {
    //     var ret = this["$init"].apply(this, arguments);
    //     console.log("b_u.$init called, args: ");
    //     for (var j = 0; j < arguments.length; j++) {
    //         console.log("arg[" + j + "]: " + arguments[j]);
    //     }
    //     console.log("called stack: " + Log.$new().getStackTraceString(Throwabloe.$new()) + "\r\n");

    //     return ret;
    // }

    // var Cipher = Java.use("javax.crypto.Cipher");
    // var overloadCount = Cipher.doFinal.overloads.length;
    // for (var i = 0; i < overloadCount; i++) {
    //     Cipher.doFinal.overloads[i]
    //     .implementation = function() {
    //         console.log("Cipher.doFinal called, arg0.");

    //         var ret = this.doFinal.apply(this, arguments);
    //         if(arguments[0] != null){
    //             console.log("Cipher.doFinal in: " + Base64.encodeToString(arguments[0], 1));
    //         }
    //         if(ret != null){
    //             console.log("Cipher.doFinal ret: " + Base64.encodeToString(ret, 1));
    //         }
    //         console.log("called stack: " + Log.$new().getStackTraceString(Throwabloe.$new()) + "\r\n");
    
    //         return ret;
    //     }
    // }

    // var overloadCount = Cipher.getInstance.overloads.length;
    // console.log("Cipher.getInstance overloads: " + overloadCount);
    // for (var i = 0; i < overloadCount; i++) {
    //     Cipher.getInstance.overloads[i]
    //     .implementation = function() {
    //         console.log("Cipher.getInstance called, and arg0: " + arguments[0]);
    //         var ret = this.getInstance.apply(this, arguments);
    
    //         return ret;
    //     }
    // }

    // var overloadCount = Cipher.init.overloads.length;
    // console.log("Cipher.init overloads: " + overloadCount);
    // for (var i = 0; i < overloadCount; i++) {
    //     Cipher.init.overloads[i]
    //     .implementation = function() {
    //         console.log("Cipher.init called. ");
    //         var ret = this.init.apply(this, arguments);
    
    //         return ret;
    //     }
    // }

    // var overloadCount = Cipher.update.overloads.length;
    // console.log("Cipher.update overloads: " + overloadCount);
    // for (var i = 0; i < overloadCount; i++) {
    //     Cipher.update.overloads[i]
    //     .implementation = function() {
    //         console.log("Cipher.update called. ");
    //         var ret = this.update.apply(this, arguments);
    
    //         return ret;
    //     }
    // }

    // var NfLog = Java.use("o.cN");
    // var methods = NfLog.class.getDeclaredMethods();

    // for (var i in methods) {
    //     (methods[i])["setAccessible"](true);

    //     var func = NfLog[methods[i].getName()];
    //     var overloadCount = func.overloads.length;
    //     for (var j = 0; j < overloadCount; j++) {
    //         func.overloads[j]
    //         .implementation = function() {
    //             console.log(methods[i].getName() + " called, and : " + Utils.getArgumentsStr(arguments));
    //             // var ret = this[methods[i].getName()].apply(this, arguments);
        
    //             // return ret;
    //         }
    //     }
    // }

    Utils.hook_RegisterNatives();
}

/************************************************ Customized java end **************************************************/

