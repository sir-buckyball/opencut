#!/bin/bash

# Create a zip file to upload to the Chrome Web Store.
(
	set -x
	zip opencut_editor.zip \
	  $(find src -name "*.css") \
	  $(find src -name "*.eot") \
	  $(find src -name "*.html") \
	  $(find src -name "*.js") \
	  $(find src -name "*.json") \
	  $(find src -name "*.png") \
	  $(find src -name "*.svg") \
	  $(find src -name "*.tff") \
	  $(find src -name "*.woff")
)
