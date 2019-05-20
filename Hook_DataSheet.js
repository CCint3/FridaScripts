'use strict';

var offset_linker_CallFunction = 0x2744;
var offset_linker_dlopen       = 0x29CC;

var ptr_linker_CallFunction = Module.findBaseAddress("linker").add(offset_linker_CallFunction+1);
var ptr_linker_dlopen       = Module.findBaseAddress("linker").add(offset_linker_dlopen+1);;

function GetStackTraceString(lr, tab) {
  var module;
  var str;
  var tabstr = "";
  if (tab == undefined) {
    tab = 1;
  }
  for (var i = 0; i != tab; i++) {
    tabstr += "  ";
  }

  var moduleName = "unknown";
  var moduleBase = 0;
  module = Process.findModuleByAddress(lr);
  if (module) {
    moduleName = module.name;
    moduleBase = parseInt(module.base);
  }
  lr = parseInt(lr);
  var off = (lr - moduleBase).toString(16).toUpperCase();
  str = "lr: { module: " + moduleName + ", address: 0x" + lr.toString(16).toUpperCase() + ", offset: 0x" + off + " }";
  return tabstr + str;
}

function MyFunction(moduleName, funcName, retType, paramsType) {
  var funcPtr = null;
  funcPtr = Module.findExportByName(moduleName, funcName);
  if (funcPtr == null) {
    throw new ReferenceError("zwp: Can't found function [" + funcName + "] in module [" + moduleName + "]");
  }
  this.retType = retType,
  this.paramsType = paramsType,
  this.nativeFunc = new NativeFunction(funcPtr, retType, paramsType);
}

function Array2UInt64(ary) {
  var len = ary.length;
  if (len > 8) {
    throw new ReferenceError("zwp: Can't convert to number.");
  }
  var str = "0x";
  for (var i = 0; i != len; i++) {
    var dig = parseInt(ary[i]).toString(16);
    if (dig.length<2) {
      dig = "0" + dig;
    }
    str += dig.toUpperCase();
  }
  return uint64(str);
}

function UInt642Array(num) {
  var ret = []
  while (!num.equals(0)) {
    ret.push(num.and(0xFF).toNumber());
    num = num.shr(8);
  }
  return ret.reverse();
}

function BString(args) {
  this.objPtr = NULL;
  this.createInstance(args);
}
BString.sizeof = 0x18;
BString.prototype.createInstance = function(args) {
  if (args instanceof NativePointer) {
    this.objPtr = args;
    return this;
  }
  this.objPtr = Memory.alloc(BString.sizeof);
  if (this.objPtr == NULL) {
    throw new ReferenceError("zwp: Memory.alloc(" + BString.sizeof + ") failed.");
  }
  return this;
}

BString.prototype.c_str = function() {
  return Memory.readCString(Memory.readPointer(this.objPtr.add(0x14)));
}

function CBinary(args) {
  this.objPtr = NULL;
  this.createInstance(args);
};
CBinary.libName = "libPubFunctional.so";
CBinary.sizeof = 0x18;
CBinary.init = function(libName) {
  if (libName.indexOf(CBinary.libName) == -1) {
    return;
  }
  console.log("CBinary.init");

  // this CBinary::CBinary(this)
  CBinary.C2Ev = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinaryC2Ev"),
    "pointer",
    ["pointer"]);

  // this CBinary::CBinary(this, CBinary* right)
  CBinary.C2ERKS_ = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinaryC2ERKS_"),
    "pointer",
    ["pointer", "pointer"]);

  // this CBinary::CBinary(this, uint8* buffer, int length)
  CBinary.C2EPKhs = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinaryC2EPKhs"),
    "pointer",
    ["pointer", "pointer", "int"]);

  // this CBinary::CBinary(this, char* buffer, int length)
  CBinary.C2EPKcs = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinaryC2EPKcs"),
    "pointer",
    ["pointer", "pointer", "int"]);

  // this CBinary::~CBinary(this)
  CBinary.D2Ev = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinaryD2Ev"),
    "pointer",
    ["pointer"]);

  // this CBinary::~CBinary(this)
  CBinary.D0Ev = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinaryD0Ev"),
    "pointer",
    ["pointer"]);

  // int CBinary::WriteBuffer(this, uint8* buf, int len)
  CBinary.WriteBufferEPcs = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinary11WriteBufferEPcs"),
    "int",
    ["pointer", "pointer", "int"]);

  // int CBinary::SetAt(this, int idx, uint8 val)
  CBinary.SetAtEsh = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinary5SetAtEsh"),
    "int",
    ["pointer", "int", "uint8"]);

  // bool CBinary::IsEmpty(this)
  CBinary.IsEmptyEv = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZNK7CBinary7IsEmptyEv"),
    "bool",
    ["pointer"]);

  // int CBinary::GetSize(this)
  CBinary.GetSizeEv = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZNK7CBinary7GetSizeEv"),
    "int",
    ["pointer"]);

  // uint8* CBinary::GetBuffer(this)
  CBinary.GetBufferEv = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZNK7CBinary9GetBufferEv"),
    "pointer",
    ["pointer"]);

  // uint8 CBinary::GetAt(this, int idx)
  CBinary.GetAtEs = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZNK7CBinary5GetAtEs"),
    "uint8",
    ["pointer", "int"]);

  // uint8 CBinary::operator [](this, int idx)
  CBinary.KixEi = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZNK7CBinaryixEi"),
    "uint8",
    ["pointer", "int"]);

  // uint8 CBinary::operator [](this, int idx)
  CBinary.ixEi = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinaryixEi"),
    "uint8",
    ["pointer", "int"]);


  // int CBinary::Find(this, uint8 val, int start)
  CBinary.FindEhs = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinary4FindEhs"),
    "int",
    ["pointer", "uint8", "int"]);

  // int CBinary::Delete(this, int idx)
  CBinary.DeleteEs = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinary6DeleteEs"),
    "int",
    ["pointer", "int"]);

  // int CBinary::Compare(this, uint8* buffer, int length)
  CBinary.CompareEPKhs = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinary7CompareEPKhs"),
    "int",
    ["pointer", "pointer", "int"]);

  // int CBinary::Compare(this, CBinary* right)
  CBinary.CompareERKS_ = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinary7CompareERKS_"),
    "int",
    ["pointer", "pointer"]);

  // int CBinary::Append(this, uint8* buffer, int length)
  CBinary.AppendEPKhs = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinary6AppendEPKhs"),
    "int",
    ["pointer", "pointer", "int"]);

  // int CBinary::Append(this, uint8* buffer, int length)
  CBinary.AppendEPVKhs = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinary6AppendEPVKhs"),
    "int",
    ["pointer", "pointer", "int"]);

  // int CBinary::operator +=(this, uint8 val)
  CBinary.pLEh = new NativeFunction(
    Module.findExportByName(CBinary.libName, "_ZN7CBinarypLEh"),
    "int",
    ["pointer", "uint8"]);
    
    

  CBinary.prototype.createInstance = function(args) {
    if (args instanceof NativePointer) {
      this.objPtr = args;
      return this;
    }
    this.objPtr = Memory.alloc(CBinary.sizeof);
    if (this.objPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + CBinary.sizeof + ") failed.");
    }
    if (args instanceof CBinary) {
      CBinary.C2ERKS_(this.objPtr, args[0].objPtr);
      return this;
    }
    if (args instanceof Array) {
      var arylen = args.length;
      var bufPtr = Memory.alloc(arylen);
      if (bufPtr == NULL) {
        throw new ReferenceError("zwp: Memory.alloc(" + arylen + ") failed.");
      }
      Memory.writeByteArray(bufPtr, args);
      CBinary.C2EPKhs(this.objPtr, bufPtr, arylen);
      return this;
    }
    CBinary.C2Ev(this.objPtr);
    return this;
  };
  CBinary.prototype.releaseInstance = function(del) {
    if (del) {
      CBinary.D0Ev(this.objPtr); 
    } else {
      CBinary.D2Ev(this.objPtr); 
    }
    this.objPtr = NULL;
    return this;
  };
  CBinary.prototype.WriteBuffer = function(ary) {
    var len = ary.length;
    var bufPtr = Memory.alloc(len);
    if (bufPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + len + ") failed.");
    }
    Memory.writeByteArray(bufPtr, ary);
    return CBinary.WriteBufferEPcs(this.objPtr, bufPtr, len);
  };
  CBinary.prototype.SetAt = function(index, value) {
    return CBinary.SetAtEsh(this.objPtr, index, value);
  };
  CBinary.prototype.IsEmpty = function() {
    return CBinary.IsEmptyEv(this.objPtr);
  };
  CBinary.prototype.GetSize = function() {
    return CBinary.GetSizeEv(this.objPtr);
  };
  CBinary.prototype.GetBuffer = function() {
    return CBinary.GetBufferEv(this.objPtr);
  };
  CBinary.prototype.GetAt = function(idx) {
    return CBinary.GetAtEs(this.objPtr, idx);
  };
  CBinary.prototype.Find = function(val, start) {
    return CBinary.FindEhs(this.objPtr, val, start);
  };
  CBinary.prototype.Delete = function(idx) {
    return CBinary.DeleteEs(this.objPtr, idx);
  };
  CBinary.prototype.Compare = function(ary) {
    var len = ary.length;
    var bufPtr = Memory.alloc(len);
    if (bufPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + args[1] + ") failed.");
    }
    Memory.writeByteArray(bufPtr, ary);
    return CBinary.CompareEPKhs(this.objPtr, bufPtr, len);
  };
  CBinary.prototype.Append = function(ary) {
    var len = ary.length;
    var bufPtr = Memory.alloc(len);
    if (bufPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + args[1] + ") failed.");
    }
    Memory.writeByteArray(bufPtr, ary);
    return CBinary.AppendEPKhs(this.objPtr, bufPtr, len);
  };
}

// wrapper CBinaryGroup
/*
// sizeof == 0x10
typedef struct {
  std::vector<CBinary> vct; // +00
} CBinaryGroup;
*/
function CBinaryGroup(args) {
  this.objPtr = NULL;
  this.createInstance(args);
}
CBinaryGroup.libName = "libPubFunctional.so";
CBinaryGroup.sizeof = 0x10;
CBinaryGroup.init = function(libName) {
  if (libName.indexOf(CBinaryGroup.libName) == -1) {
    return;
  }
  console.log("CBinaryGroup.init");

  // this CBinaryGroup::CBinaryGroup(this)
  CBinaryGroup.C2Ev = new NativeFunction(
    Module.findExportByName(CBinaryGroup.libName, "_ZN12CBinaryGroupC2Ev"),
    "pointer",
    ["pointer"]);

  // this CBinaryGroup::CBinaryGroup(this, CBinaryGroup* right)
  CBinaryGroup.C2ERKS_ = new NativeFunction(
    Module.findExportByName(CBinaryGroup.libName, "_ZN12CBinaryGroupC2ERKS_"),
    "pointer",
    ["pointer", "pointer"]);

  // this CBinaryGroup::~CBinaryGroup(this)
  CBinaryGroup.D2Ev = new NativeFunction(
    Module.findExportByName(CBinaryGroup.libName, "_ZN12CBinaryGroupD2Ev"),
    "pointer",
    ["pointer"]);

  // this CBinaryGroup::~CBinaryGroup(this)
  CBinaryGroup.D0Ev = new NativeFunction(
    Module.findExportByName(CBinaryGroup.libName, "_ZN12CBinaryGroupD0Ev"),
    "pointer",
    ["pointer"]);

  // int CBinaryGroup::Append(this, CBinary*)
  CBinaryGroup.AppendE7CBinary = new NativeFunction(
    Module.findExportByName(CBinaryGroup.libName, "_ZN12CBinaryGroup6AppendE7CBinary"),
    "int",
    ["pointer", "pointer"]);

  // int CBinaryGroup::Clear(this)
  CBinaryGroup.ClearEv = new NativeFunction(
    Module.findExportByName(CBinaryGroup.libName, "_ZN12CBinaryGroup5ClearEv"),
    "int",
    ["pointer"]);

  // int CBinaryGroup::GetSize(this)
  CBinaryGroup.GetSizeEv = new NativeFunction(
    Module.findExportByName(CBinaryGroup.libName, "_ZN12CBinaryGroup7GetSizeEv"),
    "int",
    ["pointer"]);

  // int CBinaryGroup::SetAt(this, int idx, CBinary* val)
  CBinaryGroup.SetAtEs7CBinary = new NativeFunction(
    Module.findExportByName(CBinaryGroup.libName, "_ZN12CBinaryGroup5SetAtEs7CBinary"),
    "int",
    ["pointer", "int", "pointer"]);

  // CBinary* CBinaryGroup::GetAt(CBinary* ret, this, int idx)
  CBinaryGroup.GetAtEs = new NativeFunction(
    Module.findExportByName(CBinaryGroup.libName, "_ZN12CBinaryGroup5GetAtEs"),
    "pointer",
    ["pointer", "pointer", "int"]);

  CBinaryGroup.prototype.createInstance = function(args) {
    if (args instanceof NativePointer) {
      this.objPtr = args;
      return this;
    }
    this.objPtr = Memory.alloc(CBinaryGroup.sizeof);
    if (this.objPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + CBinaryGroup.sizeof + ") failed.");
    }
    CBinaryGroup.C2Ev(this.objPtr);
    return this;
  };
  CBinaryGroup.prototype.GetSize = function() {
    return CBinaryGroup.GetSizeEv(this.objPtr);
  };
  CBinaryGroup.prototype.GetAt = function(idx) {
    var bin = new CBinary();
    CBinaryGroup.GetAtEs(bin.objPtr, this.objPtr, idx);
    return bin;
  };
  CBinaryGroup.prototype.SetAt = function(idx, bin) {
    return CBinaryGroup.SetAtEs7CBinary(this.objPtr, idx, bin.objPtr);
  };
  CBinaryGroup.prototype.Append = function(bin) {
    return CBinaryGroup.AppendE7CBinary(this.objPtr, bin.objPtr);
  };
};


// wrapper CDataSheet
/*
typedef struct {
  CReadOnlyFileEx* mRoFile; // +08
  uint16_t mVer;        // +0C
  uint8_t mIdSize;      // +10
  uint8_t mH6_7;        // +18
  uint8_t mH2_5;        // +19
  uint32_t mIdCount;    // +20
  uint32_t mIdOffset;   // +30
  CBinary mBin;         // +3C
  uint8_t m50;          // +50
} CDataSheet;
*/
function CDataSheet(args) {
  this.objPtr = NULL;
  this.createInstance(args);
};
CDataSheet.libName = "libMaxiDas.so";
CDataSheet.sizeof = 0x58;
CDataSheet.init = function(libName) {
  if (libName.indexOf(CDataSheet.libName) == -1) {
    return;
  }
  console.log("CDataSheet.init");

  // this CDataSheet::CDataSheet(this)
  CDataSheet.C2Ev = new NativeFunction(
    Module.findExportByName(CDataSheet.libName, "_ZN10CDataSheetC2Ev"),
    "pointer",
    ["pointer"]);

  // this CDataSheet::~CDataSheet(this)
  CDataSheet.D2Ev = new NativeFunction(
    Module.findExportByName(CDataSheet.libName, "_ZN10CDataSheetD2Ev"),
    "pointer",
    ["pointer"]);

  // bool CDataSheet::OpenFile(this, bstring* filename)
  CDataSheet.OpenFileERKSs = new NativeFunction(
    Module.findExportByName(CDataSheet.libName, "_ZN10CDataSheet8OpenFileERKSs"),
    "bool",
    ["pointer", "pointer"]);

  // CBinaryGroup* CDataSheet::SearchId(CBinaryGroup* ret, this, CBinary* id)
  CDataSheet.SearchIdE7CBinary = new NativeFunction(
    Module.findExportByName(CDataSheet.libName, "_ZN10CDataSheet8SearchIdE7CBinary"),
    "pointer",
    ["pointer", "pointer", "pointer"]);

  // BString* CDataSheet::GetText(BString* ret, this, CBinary* id)
  CDataSheet.GetTextE7CBinary = new NativeFunction(
    Module.findExportByName(CDataSheet.libName, "_ZN10CDataSheet7GetTextE7CBinary"),
    "pointer",
    ["pointer", "pointer", "pointer"]);

  // void CDataSheet::DecrypText(this, uint8* buf, int len)
  CDataSheet.DecrypTextEPhi = new NativeFunction(
    Module.findExportByName(CDataSheet.libName, "_ZN10CDataSheet10DecrypTextEPhi"),
    "void",
    ["pointer", "pointer", "int"]);

  // int CDataSheet::MySeek(this, int off, uint whence)
  CDataSheet.MySeekEij = new NativeFunction(
    Module.findExportByName(CDataSheet.libName, "_ZN10CDataSheet6MySeekEij"),
    "int",
    ["pointer", "int", "uint"]);

  // bool CDataSheet::MyRead(this, uint8* buf, uint len)
  CDataSheet.MyReadEPvj = new NativeFunction(
    Module.findExportByName(CDataSheet.libName, "_ZN10CDataSheet6MyReadEPvj"),
    "bool",
    ["pointer", "pointer", "uint"]);


  CDataSheet.prototype.createInstance = function(args) {
    if (args instanceof NativePointer) {
      this.objPtr = args;
      return this;
    }
    var sizeof = CDataSheet.sizeof;
    this.objPtr = Memory.alloc(sizeof);
    if (this.objPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + sizeof + ") failed.");
    }
    CDataSheet.C2Ev(this.objPtr);
    return this;
  };
  CDataSheet.prototype.releaseInstance = function() {
    CDataSheet.D2Ev(this.objPtr);
    this.objPtr = NULL;
    return this;
  };
  CDataSheet.prototype.SearchId = function(ary) {
    var bin = null;
    if (ary instanceof Array) {
      bin = new CBinary(ary);
    } else if (ary instanceof CBinary) {
      bin = ary;
    } else {
      throw new ReferenceError("zwp: unknown params.");
    }
    var bingroup = new CBinaryGroup();
    CDataSheet.SearchIdE7CBinary(bingroup.objPtr, this.objPtr, bin.objPtr);
    return bingroup;
  };
  CDataSheet.prototype.GetText = function(ary) {
    var bin = null;
    if (ary instanceof Array) {
      bin = new CBinary(ary);
    } else if (ary instanceof CBinary) {
      bin = ary;
    } else {
      throw new ReferenceError("zwp: unknown params.");
    }
    var bstr = new BString();
    CDataSheet.GetTextE7CBinary(bstr.objPtr, this.objPtr, bin.objPtr);
    return bstr.c_str();
  };
  CDataSheet.prototype.DecrypText = function(ary) {
    var len = ary.length;
    var bufPtr = Memory.alloc(len);
    if (bufPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + len + ") failed.");
    }
    Memory.writeByteArray(bufPtr, ary);
    CDataSheet.DecrypTextEPhi(this.objPtr, bufPtr, len);
    var ret = Memory.readByteArray(bufPtr, len);
    ret = new Uint8Array(ret);
    return [].slice.call(ret);
  };
  CDataSheet.prototype.GetIdSize = function() {
    return Memory.readU8(this.objPtr.add(0x10));
  };
  CDataSheet.prototype.GetIdCount = function() {
    return Memory.readU32(this.objPtr.add(0x20));
  };
  CDataSheet.prototype.GetIdOffset = function() {
    return Memory.readU32(this.objPtr.add(0x30));
  };
  CDataSheet.prototype.GetId = function(idx) {
    if (idx < 0 || idx >= this.GetIdCount) {
      return 0;
    }
    var idsize = this.GetIdSize();
    var offset = this.GetIdOffset() + idx*(idsize+4)
    this.MySeek(offset, 0);
    var ary = this.MyRead(idsize);
    if (this.GetTabVer() > 0x100) {
      ary = this.DecrypText(ary);
    }
    return Array2UInt64(ary);
  };
  CDataSheet.prototype.GetTabVer = function() {
    return Memory.readU16(this.objPtr.add(0xC));
  };
  CDataSheet.prototype.MySeek = function(off, whence) {
    return CDataSheet.MySeekEij(this.objPtr, off, whence);
  };
  CDataSheet.prototype.MyRead = function(len) {
    var bufPtr = Memory.alloc(len);
    if (bufPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + len + ") failed.");
    }
    CDataSheet.MyReadEPvj(this.objPtr, bufPtr, len);
    var ret = Memory.readByteArray(bufPtr, len);
    ret = new Uint8Array(ret);
    return [].slice.call(ret);
  };
  CDataSheet.prototype.GetMinId = function() {
    var idcount = this.GetIdCount();
    var idoffset = this.GetIdOffset();
    var idsize = this.GetIdSize();
    var tabVer = this.GetTabVer();
    var left = 0;
    var right = idcount - 1;
    var ary;
    while (left <= right) {
      var idx = parseInt((left + right) / 2);
      var off = idx * (idsize + 4) + idoffset;
      this.MySeek(off, 0);
      ary = this.MyRead(idsize);
      if (tabVer > 0x100) {
        ary = this.DecrypText(ary);
      }
      right = idx - 1;
    }
    return ary;
  };
  CDataSheet.prototype.GetMaxId = function() {
    var idcount = this.GetIdCount();
    var idoffset = this.GetIdOffset();
    var idsize = this.GetIdSize();
    var tabVer = this.GetTabVer();
    var left = 0;
    var right = idcount - 1;
    var ary;
    while (left <= right) {
      var idx = parseInt((left + right) / 2);
      var off = idx * (idsize + 4) + idoffset;
      this.MySeek(off, 0);
      ary = this.MyRead(idsize);
      if (tabVer > 0x100) {
        ary = this.DecrypText(ary);
      }
      left = idx + 1;
    }
    return ary;
  };

  CDataSheet.hook_OpenFileERKSs = {
    onEnter: function(args) {
      var bstr = new BString(args[1]);
      this.log = "bool CDataSheet::OpenFile(this, bstring* filename)\n";
      this.log += "  filename: \"" + bstr.c_str() + "\"\n";
      this.trace_str = "  trace:\n" + GetStackTraceString(this.context.lr, 2) + "\n";
    },
    onLeave: function(retval) {
      this.log += "  retval: " + retval + "\n";
      this.log += this.trace_str;
      //console.log(this.log + "\n");
    }
  };
};

// wrapper JString
function JString(args) {
  this.objPtr = NULL;
  this.createInstance(args);
};
JString.libName = "libPDTPublic.so";
JString.sizeof = 0xC;
JString.init = function(libName) {
  if (libName.indexOf(JString.libName) == -1) {
    return;
  }
  console.log("JString.init");

  // JString::JString()
  JString.C2Ev = new NativeFunction(
    Module.findExportByName(JString.libName, "_ZN3pdt7JStringC2Ev"),
    "pointer",
    ["pointer"]);

  // JString::JString(const char* str)
  JString.C2EPKc = new NativeFunction(
    Module.findExportByName(JString.libName, "_ZN3pdt7JStringC2EPKc"),
    "pointer",
    ["pointer", "pointer"]);

  // JString::JString(const char* str, int strlen)
  JString.C2EPKci = new NativeFunction(
    Module.findExportByName(JString.libName, "_ZN3pdt7JStringC2EPKci"),
    "pointer",
    ["pointer", "pointer", "int"]);

  // JString::JString(int strlen, const char* src)
  JString.C2Eic = new NativeFunction(
    Module.findExportByName(JString.libName, "_ZN3pdt7JStringC2Eic"),
    "pointer",
    ["pointer", "int", "pointer"]);

  // JString::JString(const JString* src)
  JString.C2ERKS0_ = new NativeFunction(
    Module.findExportByName(JString.libName, "_ZN3pdt7JStringC2ERKS0_"),
    "pointer",
    ["pointer", "pointer"]);

  // JString::~JString()
  JString.D0Ev = new NativeFunction(
    Module.findExportByName(JString.libName, "_ZN3pdt7JStringD0Ev"),
    "pointer",
    ["pointer"]);

  // JString::~JString()
  JString.D2Ev = new NativeFunction(
    Module.findExportByName(JString.libName, "_ZN3pdt7JStringD2Ev"),
    "pointer",
    ["pointer"]);

  JString.prototype.createInstance = function(args) {
    if (args instanceof NativePointer) {
      this.objPtr = args;
      return this;
    }
    this.objPtr = Memory.alloc(JString.sizeof);
    if (this.objPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + JString.sizeof + ") failed.");
    }
    if (typeof(args) == "string") {
        JString.C2EPKc(this.objPtr, Memory.allocUtf8String(args));
        return this;
    }
    JString.C2Ev(this.objPtr);
    return this;
  };
  JString.prototype.releaseInstance = function() {
    JString.D2Ev(this.objPtr);
    this.objPtr = NULL;
    return this;
  };
  JString.prototype.size = function() {
    return Memory.readU32(this.objPtr.add(8));
  };
  JString.prototype.c_str = function() {
    var bufPtr = Memory.readPointer(this.objPtr.add(4));
    return Memory.readCString(bufPtr, this.size());
  };
};


// wrapper JMd5
function JMd5(args) {
  this.objPtr = NULL;
  this.createInstance(args);
};
JMd5.libName = "libPDTPublic.so";
JMd5.sizeof = 0x6C;
JMd5.init = function(libName) {
  if (libName.indexOf(JMd5.libName) == -1) {
    return;
  }
  console.log("JMd5.init");

  // this JMd5::JMd5(this)
  JMd5.C2Ev = new NativeFunction(
    Module.findExportByName(JMd5.libName, "_ZN3pdt4JMd5C2Ev"),
    "pointer",
    ["pointer"]);

  // this JMd5::JMd5(this, JString* msg)
  JMd5.C2ERKNS_7JStringE = new NativeFunction(
    Module.findExportByName(JMd5.libName, "_ZN3pdt4JMd5C2ERKNS_7JStringE"),
    "pointer",
    ["pointer", "pointer"]);

  // this JMd5::JMd5(this, uint8* msg, int len)
  JMd5.C2EPKvj = new NativeFunction(
    Module.findExportByName(JMd5.libName, "_ZN3pdt4JMd5C2EPKvj"),
    "pointer",
    ["pointer", "pointer", "int"]);

  // JString* JMd5::toString(JString* ret, this)
  JMd5.toStringEv = new NativeFunction(
    Module.findExportByName(JMd5.libName, "_ZN3pdt4JMd58toStringEv"),
    "pointer",
    ["pointer", "pointer"]);
  JMd5.hook_toStringEv = {
    onEnter: function(args) {
      var jstr = new JString(args[1]);
      this.log = "JString* JMd5::toString(JString* ret, this)\n";
      this.trace_str = "  trace:\n" + GetStackTraceString(this.context.lr, 2) + "\n";
    },
    onLeave: function(retval) {
      var jstr = new JString(retval);
      jstr.releaseInstance();
      jstr = new JString("00B2DC71634053F520746C2E57288CFD");
      retval.replace(jstr.objPtr);
      this.log += "  retval: \"" + jstr.c_str() + "\"\n";
      this.log += this.trace_str;
      //console.log(this.log + "\n");
    }
  };

  JMd5.prototype.createInstance = function(args) {
    if (args instanceof NativePointer) {
      this.objPtr = args;
      return this;
    }
    this.objPtr = Memory.alloc(JMd5.sizeof);
    if (this.objPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + JMd5.sizeof + ") failed.");
    }
    JMd5.C2Ev(this.objPtr);
    return this;
  }
}


// wrapper CPorshceDataSheet
/*
typedef struct {
  void* vftable;             +00
  CDataSheet* dataSheet;     +04
} CPorshceDataSheet;
*/
function CPorshceDataSheet(args) {
  this.objPtr = NULL;
  this.createInstance(args);
};
CPorshceDataSheet.libName = "libPorschePublic.so";
CPorshceDataSheet.sizeof = 0x18;
CPorshceDataSheet.init = function(libName) {
  if (libName.indexOf(CPorshceDataSheet.libName) == -1) {
    return;
  }
  console.log("CPorshceDataSheet.init");

  // this CPorshceDataSheet::CPorshceDataSheet(this)
  CPorshceDataSheet.C2Ev = new NativeFunction(
    Module.findExportByName(CPorshceDataSheet.libName, "_ZN3pdt17CPorshceDataSheetC2Ev"),
    "pointer",
    ["pointer"]);

  // this CPorshceDataSheet::~CPorshceDataSheet(this)
  CPorshceDataSheet.D0Ev = new NativeFunction(
    Module.findExportByName(CPorshceDataSheet.libName, "_ZN3pdt17CPorshceDataSheetD0Ev"),
    "pointer",
    ["pointer"]);

  // this CPorshceDataSheet::~CPorshceDataSheet(this)
  CPorshceDataSheet.D2Ev = new NativeFunction(
    Module.findExportByName(CPorshceDataSheet.libName, "_ZN3pdt17CPorshceDataSheetD2Ev"),
    "pointer",
    ["pointer"]);

  // int CPorshceDataSheet::GetBinayrIDCount(this)
  CPorshceDataSheet.GetBinayrIDCountEv = new NativeFunction(
    Module.findExportByName(CPorshceDataSheet.libName, "_ZN3pdt17CPorshceDataSheet16GetBinayrIDCountEv"),
    "int",
    ["pointer"]);

  // JString* CPorshceDataSheet::GetText(JString* ret, this, CBinary* id)
  CPorshceDataSheet.GetTextERK7CBinary = new NativeFunction(
    Module.findExportByName(CPorshceDataSheet.libName, "_ZN3pdt17CPorshceDataSheet7GetTextERK7CBinary"),
    "pointer",
    ["pointer", "pointer", "pointer"]);

  // JString* CPorshceDataSheet::GetText(JString* ret, this, JByteArray* id)
  CPorshceDataSheet.GetTextERKNS_10JByteArrayE = new NativeFunction(
    Module.findExportByName(CPorshceDataSheet.libName, "_ZN3pdt17CPorshceDataSheet7GetTextERKNS_10JByteArrayE"),
    "pointer",
    ["pointer", "pointer", "pointer"]);

  // bool CPorshceDataSheet::OpenFile(this, JString* filename)
  CPorshceDataSheet.OpenFileERKNS_7JStringE = new NativeFunction(
    Module.findExportByName(CPorshceDataSheet.libName, "_ZN3pdt17CPorshceDataSheet8OpenFileERKNS_7JStringE"),
    "bool",
    ["pointer", "pointer"]);
  CPorshceDataSheet.hook_OpenFileERKNS_7JStringE = {
    onEnter: function(args) {
      var jstr = new JString(args[1]);
      this.log = "bool CPorshceDataSheet::OpenFile(this, JString* filename)\n";
      this.log += "  filename: \"" + jstr.c_str() + "\"\n";
      this.trace_str = "  trace:\n" + GetStackTraceString(this.context.lr, 2) + "\n";
    },
    onLeave: function(retval) {
      this.log += "  retval: " + retval  + "\n";
      this.log += this.trace_str;
      //console.log(this.log + "\n");
    }
  };

  // int CPorshceDataSheet::SetAddAppPath(bool)
  CPorshceDataSheet.SetAddAppPathEb = new NativeFunction(
    Module.findExportByName(CPorshceDataSheet.libName, "_ZN3pdt17CPorshceDataSheet13SetAddAppPathEb"),
    "int",
    ["pointer", "bool"]);

  // int CPorshceDataSheet::SetReadFileToMemery(bool)
  CPorshceDataSheet.SetReadFileToMemeryEv = new NativeFunction(
    Module.findExportByName(CPorshceDataSheet.libName, "_ZN3pdt17CPorshceDataSheet19SetReadFileToMemeryEv"),
    "int",
    ["pointer"]);

  // static JString* CPorshceDataSheet::getCurrentPach(JString* ret)
  CPorshceDataSheet.getCurrentPachEv = new NativeFunction(
    Module.findExportByName(CPorshceDataSheet.libName, "_ZN3pdt17CPorshceDataSheet14getCurrentPachEv"),
    "pointer",
    ["pointer"]);

  CPorshceDataSheet.prototype.createInstance = function(args) {
    if (args instanceof NativePointer) {
      this.objPtr = args;
      return this;
    }

    this.objPtr = Memory.alloc(CPorshceDataSheet.sizeof);
    if (this.objPtr == NULL) {
      throw new ReferenceError("zwp: Memory.alloc(" + CPorshceDataSheet.sizeof + ") failed.");
    }
    CPorshceDataSheet.C2Ev(this.objPtr);
    return this;
  };
  CPorshceDataSheet.prototype.releaseInstance = function() {
    CPorshceDataSheet.D2Ev(this.objPtr);
    this.objPtr = NULL;
    return this;
  };
  CPorshceDataSheet.prototype.GetDataSheet = function(){
    return new CDataSheet(Memory.readPointer(this.objPtr.add(4)));
  };
  CPorshceDataSheet.prototype.SearchId = function(bin) {
    return this.GetDataSheet().SearchId(bin);
  };
  CPorshceDataSheet.prototype.getCurrentPach = function(jstr) {
    CPorshceDataSheet.getCurrentPachEv(jstr.objPtr);
    return jstr;
  };
  CPorshceDataSheet.prototype.OpenFile = function(arg) {
    var jstr;
    if (typeof(arg) == "string") {
      jstr = new JString(arg);
    } else if (arg instanceof JString) {
      jstr = arg;
    }
    return CPorshceDataSheet.OpenFileERKNS_7JStringE(this.objPtr, jstr.objPtr);
  };
  CPorshceDataSheet.prototype.GetBinayrIDCount = function() {
    return CPorshceDataSheet.GetBinayrIDCountEv(this.objPtr);
  }
  CPorshceDataSheet.prototype.GetText = function(ary) {
    var bin = new CBinary(ary);
    var jstr = new JString();
    CPorshceDataSheet.GetTextERK7CBinary(jstr.objPtr, this.objPtr, bin.objPtr);
    return jstr.c_str();
  }
};


// wrapper JPorscheUtil
function JPorscheUtil() {
};
JPorscheUtil.libName = "libPorschePublic.so";
JPorscheUtil.init = function (libName) {
  if (libName.indexOf(JPorscheUtil.libName) == -1) {
    return;
  }
  console.log("JPorscheUtil.init");

  // static JString* JPorscheUtil::GetRealString(JString* ret, uint id)
  JPorscheUtil.GetRealStringEj = new NativeFunction(
    Module.findExportByName(JPorscheUtil.libName, "_ZN12JPorscheUtil13GetRealStringEj"),
    "pointer",
    ["pointer", "uint"]);

  // static JString* JPorscheUtil::GetRealString(JString* ret, JString* id)
  JPorscheUtil.GetRealStringERKN3pdt7JStringE = new NativeFunction(
    Module.findExportByName(JPorscheUtil.libName, "_ZN12JPorscheUtil13GetRealStringERKN3pdt7JStringE"),
    "pointer",
    ["pointer", "pointer"]);

  // static JString* JPorscheUtil::GetRealString(JString* ret, JString* jstr)
  JPorscheUtil.decodeStringERKN3pdt7JStringE = new NativeFunction(
    Module.findExportByName(JPorscheUtil.libName, "_ZN12JPorscheUtil12decodeStringERKN3pdt7JStringE"),
    "pointer",
    ["pointer", "pointer"]);

  JPorscheUtil.decodeString = function(str) {
    var jstr = null;
    if (typeof(str) == "string") {
      jstr = new JString(str);
    } else if (str instanceof JString) {
      jstr = str;
    }
    if (!jstr) {
      throw new ReferenceError("zwp: params unknown.");
    }
    var ret = new JString();
    JPorscheUtil.decodeStringERKN3pdt7JStringE(ret.objPtr, jstr.objPtr);
    return ret;
  };
  JPorscheUtil.GetRealString = function(arg) {
    var jstr = new JString();
    if (arg instanceof JString) {
      JPorscheUtil.GetRealStringERKN3pdt7JStringE(jstr.objPtr, arg.objPtr);
    } else if (typeof(arg) == "number") {
      JPorscheUtil.GetRealStringEj(jstr.objPtr, arg);
    } else if (typeof(arg) == "string") {
      var p = new JString(arg);
      JPorscheUtil.GetRealStringERKN3pdt7JStringE(jstr.objPtr, p.objPtr);
    }
    return jstr;
  }

  JPorscheUtil.hook_GetRealStringEj = {
    onEnter: function (args) {
      this.log = "static JString* JPorscheUtil::GetRealString(JString* ret, uint id)\n";
      this.log += "  id: 0x" + parseInt(args[1]).toString(16).toUpperCase() + "\n";
    },
    onLeave: function (retval) {
      var jstr = new JString(ptr(retval));
      this.log += "  ret: [length: " + jstr.size() + "] str: \"" + jstr.c_str() + "\"\n";
      console.log(this.log + "\n");
    }
  };

  JPorscheUtil.hook_GetRealStringERKN3pdt7JStringE = {
    onEnter: function (args) {
      this.log = "static JString* JPorscheUtil::GetRealString(JString* ret, const JString* id)\n";
      this.log += "  id: \"" + new JString(args[1]).c_str() + "\"\n";
    },
    onLeave: function (retval) {
      var jstr = new JString(retval);
      this.log += "  ret: [length: " + jstr.size() + "] str: \"" + jstr.c_str() + "\"\n";
      console.log(this.log + "\n");
    }
  };
};


/*
CBinary.init(CBinary.libName);
CBinaryGroup.init(CBinaryGroup.libName);
CDataSheet.init(CDataSheet.libName);
JString.init(JString.libName);
JMd5.init(JMd5.libName);
CPorshceDataSheet.init(CPorshceDataSheet.libName);
JPorscheUtil.init(JPorscheUtil.libName);
*/

var hookor_CBinarySetAt = {
  onEnter: function(args) {
    this.log = "int CBinary::SetAt(this, int idx, uint8 val)\n";
    this.arg0 = args[0];
    this.log += "  idx: " + parseInt(args[1]) + "\n";
    this.log += "  val: 0x" + parseInt(args[2]).toString(16).toUpperCase() + "\n";
    this.log += "  trace " + GetStackTraceString(this.context.lr, 0) + "\n";
  },
  onLeave: function(retval) {
    var thisBin = new CBinary(this.arg0);
    var thisBuffer = thisBin.GetBuffer();
    var thisBinSize = thisBin.GetSize();
    console.log(this.log + hexdump(thisBuffer, {offset:0, length:thisBinSize, header:true, ansi: true}));
    console.log("\n\n");
  }
};

// Hook linker.CallFunction
Interceptor.attach(ptr_linker_CallFunction, {
  onEnter: function (args) {
    this.libName = Memory.readCString(args[0]);
    this.fucName = Memory.readCString(args[1]);
  },
  onLeave: function (retval) {
    if (this.fucName.indexOf("DT_INIT") != -1) {
      if (this.libName.indexOf("libPorschePublic.so") != -1 ||
      this.libName.indexOf("libPDTPublic.so") != -1 ||
      this.libName.indexOf("libMaxiDas.so") != -1 ||
      this.libName.indexOf("libPubFunctional.so") != -1) {
        CBinary.init(this.libName);
        CBinaryGroup.init(this.libName);
        CDataSheet.init(this.libName);
        JString.init(this.libName);
        JMd5.init(this.libName);
        CPorshceDataSheet.init(this.libName);
        JPorscheUtil.init(this.libName);
      }

      if (this.libName.indexOf("libPorschePublic.so") != -1) {
        //Interceptor.attach(CPorshceDataSheet.OpenFileERKNS_7JStringE, CPorshceDataSheet.hook_OpenFileERKNS_7JStringE);
        //Interceptor.attach(JPorscheUtil.GetRealStringERKN3pdt7JStringE, JPorscheUtil.hook_GetRealStringERKN3pdt7JStringE);
      } else if (this.libName.indexOf("libPDTPublic.so") != -1) {
        //Interceptor.attach(JMd5.toStringEv, JMd5.hook_toStringEv);
      } else if (this.libName.indexOf(CBinary.libName) != -1) {  
        Interceptor.attach(CBinary.SetAtEsh, hookor_CBinarySetAt);
	  }

    }
  }
});

var func_DecodePorscheTab = function(fileName) {
  var pds = new CPorshceDataSheet();
  if (pds.OpenFile(fileName) != 1) {
    console.log("can't open file: " + fileName);
    return;
  }
  var dataSheet = pds.GetDataSheet();
  if (dataSheet.GetIdSize() > 8) {
    console.log("can't convert the id to number.");
    return;
  }
  console.log("begin " + fileName);
  var idcount = dataSheet.GetIdCount();
  for (var idx = 0; idx != idcount; idx++) {
    var id = dataSheet.GetId(idx);
    //var dg = dataSheet.SearchId(UInt642Array(id));
    var jstr = JPorscheUtil.GetRealString(id.and(0xFFFFFFFF).toNumber());
    var jsondata = { "id" : id.toNumber(), "jstr" : jstr.c_str() };
    //console.log(id.toNumber().toString(16).toUpperCase() + ": " + jstr.c_str())
    send(jsondata);
  }
  console.log("end " + fileName);
}



/*
Interceptor.attach(CBinary.AppendEPKhs, {
  onEnter: function(args) {
    this.log = "int CBinary::Append(this, uint8* buffer, int length)\n";
    this.arg0 = args[0];
    this.log += "  buffer: " + args[1] + "\n";
    this.log += "  length: " + args[2] + "\n";
    this.log += "  trace " + GetStackTraceString(this.context.lr, 0) + "\n";
  },
  onLeave: function(retval) {
    var thisBin = new CBinary(this.arg0);
    var thisBuffer = thisBin.GetBuffer();
    var thisBinSize = thisBin.GetSize();
    console.log(this.log + hexdump(thisBuffer, {offset:0, length:thisBinSize, header:true, ansi: true}));
    console.log("\n\n");
  }
});
*/
/*
JPorscheUtil.init(JPorscheUtil.libName);
JString.init(JString.libName);
Interceptor.attach(JPorscheUtil.decodeStringERKN3pdt7JStringE, {
  onEnter: function(args) {
    this.log = "pdt::JString* JPorscheUtil::decodeString(pdt::JString *dest, const pdt::JString *src)\n";
    this.log += "  src: \"" + new JString(args[1]).c_str() + "\"\n";
    this.log += "  trace " + GetStackTraceString(this.context.lr, 0) + "\n";
  },
  onLeave: function(retval) {
    this.log += "  retval: \"" + new JString(retval).c_str() + "\"\n";
    console.log(this.log + "\n\n");
  }
});
*/