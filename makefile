
ifdef dbg_server_path
  DBG_SERVER_PATH := $(dbg_server_path)
else
  DBG_SERVER_PATH := /data/local/tmp/a_s
endif

ifdef need_su
  NEED_SU := su -c
else
  NEED_SU :=
endif

DBG_FORWARD_PORT := 12345

FRD_CLIENT_PATH := frida
FRD_CMD = $(FRD_CLIENT_PATH)

NEW_ADB := 

# frida server 路径
ifdef frida_server_path
  FRD_SERVER_PATH = $(frida_server_path)
else
  FRD_SERVER_PATH := /system/xbin/f_s_12.0.8
endif

# frida server ip
ifdef frida_server_ip
  FRD_SERVER_IP = $(frida_server_ip)
else
  FRD_SERVER_IP := 127.0.0.1
endif

# frida server 本地端口
ifdef local_port
  FRD_SER_LOC_PORT = $(local_port)
else
  FRD_SER_LOC_PORT := 10089
endif

# frida server 远程端口，为了转发端口，使本地和设备能够通讯，默认情况下两个端口是相同的。
ifdef remote_port
  FRD_SER_RMT_PORT = $(remote_port)
else
  FRD_SER_RMT_PORT := $(FRD_SER_LOC_PORT)
endif

ifdef host
  FRD_CMD += --host=$(host)
else
  FRD_CMD += --host=$(FRD_SERVER_IP):$(FRD_SER_LOC_PORT)
endif

# 为了确保每次本地可以正常连接到设备，在执行adb前先关闭adb进程或者移除已经转发的端口
ifdef newadb
  NEW_ADB = -adb kill-server
else
  NEW_ADB = -adb forward --remove tcp:$(FRD_SER_LOC_PORT)
endif

ifdef script
  FRD_CMD += --load=$(script)
endif

ifdef log
  FRD_CMD += --output=$(log)
endif

ifdef nopause
  FRD_CMD += --no-pause
endif

# target 和 file 任意指定其中一个即可。
ifdef target
  FRD_CMD += $(target)
else
ifdef file
  FRD_CMD += --file=$(file)
else
ifdef pid
  FRD_CMD += --attach-pid=$(pid)
else
# 必须指定 target 或 file。
endif
endif
endif


kill:
	adb kill-server

dbg:
	-adb forward --remove tcp:12345
	adb forward tcp:$(DBG_FORWARD_PORT) tcp:$(DBG_FORWARD_PORT)
	adb shell $(NEED_SU) $(DBG_SERVER_PATH) -p$(DBG_FORWARD_PORT)

# frida server
# 在远程设备上启动frida server并创建网络连接，以被frida client连接。
# 默认监听端口是27042
# -l, --listen=ADDRESS：指定地址和端口进行监听。例：-l 127.0.0.1:11556
# -D, --daemonize     ：表示进程运行在后台。
# 在设备上使用 netstat 查看地址和端口使用情况
frida_server:
	-adb forward --remove tcp:$(FRD_SER_RMT_PORT)
	adb shell $(FRD_SERVER_PATH) --daemonize --listen=$(FRD_SERVER_IP):$(FRD_SER_RMT_PORT)

# frida client
# 在本地连接设备的frida server前，请先用adb forward tcp:xxxx tcp:xxxx转发自己指定的监听端口或者默认监听端口
# -D --device=：使用给定的设备ID连接到设备
# -U --usb=   ：连接到Usb设备。
# -R --remote=：连接到远程frida服务。
# -H --host=  ：使用给定的ip:port连接到远程frida服务。例：-H 127.0.0.1:10086，--host=127.0.0.1:10086
# 以上4种连接方式，只有-H选项可以指定地址和端口，其他选项都是使用默认端口27042连接到设备上的frida server

# -l SCRIPT, --load=SCRIPT：自动执行js脚本
# --no-pause：启动目标进程之后自动开始主线程。如果不指定该选项，启动目标进程后进程处于暂停状态。
#             需要使用 %resume 来唤醒进程主线程。
# -o LOGFILE, --output=LOGFILE：写日志到指定文件。
frida_client:
	$(NEW_ADB)
	adb forward tcp:$(FRD_SER_LOC_PORT) tcp:$(FRD_SER_RMT_PORT)
	$(FRD_CMD)
