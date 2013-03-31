//
// @brief
// @author ongaeshi
// @date   2011/10/25

const platform = require("platform");

const paramMac = {
  keycombo: {
    replace: "meta-ctrl-r",
    insert:  "meta-ctrl-i"
  },

  context_label: {
    replace: "Replace translate　　　⌘+Ctrl+R",
    insert:  "Insert translate　　　　⌘+Ctrl+i",
    text:    "Text translate",
    setting: "Settings"
  }
};

const paramOther = {
  keycombo: {
    replace: "alt-shift-r",
    insert:  "alt-shift-i"
  },

  context_label: {
    replace: "Replace translate　　　Alt+Shift+R",
    insert:  "Insert translate　　　　　Alt+Shift+i",
    text:    "Text translate",
    setting: "Settings"
  }
};

exports.getParam = function() {
  if (platform.isMac())
    return paramMac;
  else
    return paramOther;
};

