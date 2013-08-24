//
// @brief
// @author ongaeshi
// @date   2011/10/24
//
// Reference:
//   addon-sdk-1.1/packages/api-utils/lib/keyboard/utils.js
//   addon-sdk-1.1/packages/api-utils/lib/runtime.js
//

const { Cc, Ci } = require("chrome");
const runtime = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);

exports.isMac = function() {
  return runtime.OS === "Darwin";
}
