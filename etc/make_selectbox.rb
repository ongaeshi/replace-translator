# -*- coding: utf-8 -*-
#
# @file 
# @brief
# @author ongaeshi
# @date   2011/10/23

def make_selectbox(filename)
  array = File.read(filename).split("\n")
  array = array.map{|v| v.split }

  txt = array.map{|v|
    "<option value=\"#{v[0]}\">#{v[1]}</option>"
  }.join("")

  <<EOF
<div id="from-lang">From: <select id="from-lang-select" name="from"><option value="">Auto</option>#{txt}</select></div>
<div id="to-lang">To: <select id="to-lang-select" name="to"><option value="">Auto</option>#{txt}</select></div>
EOF
end

puts make_selectbox(ARGV[0])
