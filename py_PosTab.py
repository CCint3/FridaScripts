import sys
import struct


def main():
  argc = len(sys.argv)
  if argc < 2:
    print "please input file name."
    return
  
  filename = "E:\\Vehicle\\Europe\\Porsche\\0/000133D9C5826FA632BD02941C43912"
  filename = sys.argv[1]#"E:\\Vehicle\\Europe\\Porsche\\0/000133D9C5826FA632BD02941C43912"
  tabmagic = ""
  tabver = 0
  tablan = ""
  tabidlen = 0
  tabreserve = 0
  try:
    with open(filename, "rb") as fd:
      tabmagic = struct.unpack("<2s", fd.read(2))[0]
      if tabmagic != "AT":
        return
      tabver = struct.unpack("<H", fd.read(2))[0]
      tablan = struct.unpack("<2s", fd.read(2))[0]
      tabidlen = struct.unpack("<B", fd.read(1))[0]
      tabreserve = struct.unpack("<B", fd.read(1))[0]
      h6_7 = tabreserve >> 6
      h2_5 = tabreserve >> 2 & 0xF
      if h6_7 == 1:
        print "py_____    " + filename
      return
  except:
    pass

if __name__ == "__main__":
  main()