#!/bin/bash

# This script will download/update and generate files containing our various
# dependencies.

# A function to ensure that a file exists. If the file is not present, it is
# downloaded.
function ensure() {
  if [ ! -f $1 ]
  then
    (set -x; curl $2 > $1)
  fi
}


mkdir -p deps

# Install our dependencies locally.
ensure deps/jquery.min.js https://raw2.github.com/components/jquery/master/jquery.min.js
ensure deps/yaml.min.js https://raw2.github.com/jeremyfa/yaml.js/master/bin/yaml.min.js
ensure deps/ace.js https://raw2.github.com/ajaxorg/ace-builds/master/src-noconflict/ace.js
ensure deps/mode-yaml.js https://raw2.github.com/ajaxorg/ace-builds/master/src-noconflict/mode-yaml.js
ensure deps/FileSaver.js https://raw2.github.com/eligrey/FileSaver.js/master/FileSaver.js

# Install our testing files into the src tree so they can be executed.
ensure src/qunit-1.14.0.js http://code.jquery.com/qunit/qunit-1.14.0.js
ensure src/qunit-1.14.0.css http://code.jquery.com/qunit/qunit-1.14.0.css

# Dump the js file contents into our dep file.
# TODO: we should probably version the deps file.
echo "building src/index-deps.js"
(
  set -x
  cat deps/jquery.min.js > src/index-deps.js
  cat deps/ace.js >> src/index-deps.js
  cat deps/mode-yaml.js >> src/index-deps.js
  cat deps/yaml.min.js >> src/index-deps.js
  cat deps/FileSaver.js >> src/index-deps.js
)


# Unpack dependencies for the rendering code.
ensure deps/paperjs-v0.9.18.zip http://paperjs.org/download/paperjs-v0.9.18.zip
mkdir -p deps/paperjs
unzip -d deps/paperjs/ deps/paperjs-v0.9.18.zip dist/paper-core.min.js

echo "building src/render-deps.js"
(
  set -x
  cat deps/jquery.min.js > src/render-deps.js
  cat deps/yaml.min.js >> src/render-deps.js
  cat deps/FileSaver.js >> src/render-deps.js
  cat deps/paperjs/dist/paper-core.min.js >> src/render-deps.js
)
