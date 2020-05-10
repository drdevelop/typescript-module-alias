#!/bin/bash

# run tsc
npm run dist
wait;

if [ `dirname $0` != "." ]; then
# when exec npm run build and cd self dir
cd scripts;
fi;

# clear package.json field devDependencies to dir release and change version

# copy dir lib、dist and file CHANGELOG.md、index.js、README.md to dir release
RELEASE_DIR_LIST=("../lib" "../dist");
RELEASE_FILE_LIST=("../index.js" "../package.json" "../README.md")

if [ ! -d "../release" ]; then
mkdir ../release
fi

# copy dir list
for dir in ${RELEASE_DIR_LIST[@]}
do
  # replace str '../' of path
  outputDir=`echo $dir | sed 's/\.\.\///'`
  outputPath=../release/$outputDir
  if [ ! -d "$outputPath" ]; then
  mkdir $outputPath
  fi
  cp $dir/* $outputPath
  echo -e "\033[34mcp dir\033[0m: $dir"
done
echo -e "\033[32mcp dir done\033[0m \n"

# copy file list
for fiel in ${RELEASE_FILE_LIST[@]}
do
  cp $file ../release
  echo -e "\033[34mcp file\033[0m: $file"
done
echo -e "\033[32mcp file done\033[0m \n"

# npm publish release/*
npm run build