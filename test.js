
function JavaStackTraceToString(stackTrace, tabSize) {
  var str = "";
  var tab = "";
  for (var i = 0; i < tabSize*2; i++) {
    tab += " ";
  }
  for (var i in stackTrace) {
    str += tab + i + ":" + stackTrace[i] + "\n";
  }
  return str
}


Java.perform(function () {
  var wrapperThread = Java.use("java.lang.Thread");
  var wrapperPhonePassLoginView = Java.use("com.ss.android.ugc.aweme.account.login.ui.PhonePassLoginView");
  var wrapperai = Java.use("com.ss.android.ugc.aweme.account.login.ui.ai");
  
  wrapperai.o.implementation = function() {
    var ret;
    var log = "ai.o\n";
    log += "  thread trace:\n";
    log += JavaStackTraceToString(wrapperThread.currentThread().getStackTrace(), 2);
    
    ret = this.o();
    log += "  return value: " + ret + "\n";
    console.log(log + "\n\n");
    return ret;
  }

  wrapperPhonePassLoginView.setLoginListener.implementation = function(arg) {
    var log = "PhonePassLoginView.setLoginListener\n";
    log += "  param1: " + arg.getClass() + "\n";
    log += "\n";
    log += "  thread trace:\n";
    log += JavaStackTraceToString(wrapperThread.currentThread().getStackTrace(), 2);
    console.log(log + "\n\n");
    this.setLoginListener(arg);
  }
});

