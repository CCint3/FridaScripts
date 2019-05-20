# -*- coding: UTF-8 -*-

import sys
import os
import struct
import frida


def decodeall(script):
  filenames = []
  rootdir = "E:\\Vehicle\\Europe\\Porsche"
  contentlist = os.listdir(rootdir)
  for content in contentlist:
    if len(content) != 1:
      continue
    path = os.path.join(rootdir, content)
    if not os.path.isdir(path):
      continue
    subcontentlist = os.listdir(path)
    for subcontent in subcontentlist:
      if subcontent.find(".so") != -1:
        continue
      subpath = os.path.join(path, subcontent)
      with open(subpath, "rb") as fd:
        tabflag = struct.unpack("<2s", fd.read(2))[0]
        if tabflag != 'AT':
          continue
      #print subpath
      postdata = "%s/%s" %(content, subcontent)
      #print "py: " + postdata
      #script.post(postdata)
      filenames.append(postdata)
  script.post(filenames)


def on_message(message, data):
  if message['type'] == 'send':
    msg = message['payload']
    if msg.has_key("id"):
      with open("./testsss.txt", "a+") as fd:
        fd.write("id: 0x%08X, msg: %s\n" %(msg["id"], msg["jstr"]))

script = None
jscode = ""
with open("Hook_DataSheet.js") as fd:
  for line in fd:
    jscode += line

def main():
  devices = None
  try:
    devices = frida.enumerate_devices()
  except:
    pass
  if devices == None:
    print "frida can't enumerate devices. please check the frida connect."
    return

  autel_device = None
  for device in devices:
    print device
    if device.name.find("Autel") != -1:
      autel_device = frida.get_device(device.id)
      print "\nuse: %s" %autel_device
      break
  if autel_device == None:
    print "frida not found autel device."
    return

  autel_app = None
  try:
    apps = autel_device.enumerate_applications()
    for app in apps:
      if app.identifier == "com.Autel.maxi":
        autel_app = app
        print autel_app
        break
  except BaseException as e:
    print e
  if autel_app == None:
    print "frida not found autel app."
    return

  process = autel_device.attach('com.Autel.maxi')
  script = process.create_script(jscode)
  script.on('message', on_message)
  print('[*] Running Python Script.')
  script.load()
  decodeall(script)
  sys.stdin.read()

if __name__ == "__main__":
  try:
    main()
  except BaseException as e:
    print e
  finally:
    print "script end."