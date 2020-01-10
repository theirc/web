#!/bin/bash

NPM_CMD="npm"

echo "Building CSS."
eval $NPM_CMD run build-css


echo "Copying config folder."
cp -R "./src/config" "./webserver/"

echo "Building Server."
eval $NPM_CMD run build-server

echo "Building Client code."
eval $NPM_CMD run build


echo "Finished successfully."
