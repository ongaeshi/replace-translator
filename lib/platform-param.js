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
    replace: "[TM] Replace translate　　　⌘+Ctrl+R",
    insert:  "[TM] Insert translate　　　　⌘+Ctrl+i",
    text:    "[TM] Text translate",
    setting: "[TM} Settings"
  }
};

const paramOther = {
  keycombo: {
    replace: "alt-shift-r",
    insert:  "alt-shift-i"
  },

  context_label: {
    replace: "[TM] Replace translate　　　Alt+Shift+R",
    insert:  "[TM] Insert translate　　　　　Alt+Shift+i",
    text:    "[TM] Text translate",
    setting: "[TM} Settings"
  }
};

exports.getParam = function() {
  if (platform.isMac())
    return paramMac;
  else
    return paramOther;
};

