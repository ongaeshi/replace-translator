//
// @brief Bing! Translator
// @author ongaeshi
// @date   2011/10/04

const xhr = require("sdk/net/xhr");
const request = require("sdk/request");

const APP_ID = '9D3E63A82743F70EE2ED00D952E1B06F68E61A40';

exports.translateGet = function (text, from, to, onComplete) {
  let req = request.Request({
    url: "http://api.microsofttranslator.com/V2/Ajax.svc/Translate",
    content: {
      appId: APP_ID,
      text: text,
      from:  from,
      to:    to
    },
    onComplete: function (response) {
      onComplete(response.json);
    }
  });
  req.get();
}

exports.translateArrayGet = function (texts, from, to, onComplete) {
  let req = request.Request({
    url: "http://api.microsofttranslator.com/V2/Ajax.svc/TranslateArray",
    content: {
      appId: APP_ID,
      texts: JSON.stringify(texts),
      from:  from,
      to:    to
    },
    onComplete: function (response) {
      onComplete(response.json);
    }
  });
  req.get();
}

function escapeHTML(str) str.replace(/[&"'<>]/g, function (m) "&" + ({ "&": "amp", '"': "quot", "'": "apos", "<": "lt", ">": "gt" })[m] + ";");

function textsWrapXml (texts) {
  return '<Texts>' + texts.map(function(v){return '<string xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' + escapeHTML(v) + '</string>';}).join('') + '</Texts>';
}

exports.translatePost = function (text, from, to, onComplete) {
  let body  = '<TranslateArrayRequest>' +
              '<AppId>' + APP_ID + '</AppId>' +
              textsWrapXml([text]) + 
              '<From>' + from + '</From>' +
              '<To>'   + to + '</To>' +
              '</TranslateArrayRequest>',
      req  = new xhr.XMLHttpRequest();

  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      var nodes = req.responseXML.getElementsByTagName('TranslatedText');
      onComplete(nodes[0].textContent);
    }
  };  

  req.open("POST", "http://api.microsofttranslator.com/v2/Http.svc/TranslateArray", true);
  req.setRequestHeader("Content-Type", "text/xml");
  req.setRequestHeader("Content-Length", body.length);
  req.send(body);
}

exports.translateArrayPost = function (texts, from, to, onComplete) {
  //   console.p(texts);
  //   console.p(texts.length);
  
  let body  = '<TranslateArrayRequest>' +
              '<AppId>' + APP_ID + '</AppId>' +
              textsWrapXml(texts) + 
              '<From>' + from + '</From>' +
              '<To>'   + to + '</To>' +
              '</TranslateArrayRequest>',
      req  = new xhr.XMLHttpRequest();

  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      var nodes = req.responseXML.getElementsByTagName('TranslatedText'),
          result = [];

      for (var i = 0; i < nodes.length; i++) {
        result.push({TranslatedText: nodes[i].textContent});
      }

      onComplete(result);
    }
  };  

  req.open("POST", "http://api.microsofttranslator.com/v2/Http.svc/TranslateArray", true);
  req.setRequestHeader("Content-Type", "text/xml");
  req.setRequestHeader("Content-Length", body.length);
  req.send(body);
}


