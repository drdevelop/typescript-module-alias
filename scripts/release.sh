#!/bin/bash

RELEASE_DIR="release"

# run tsc
npm run dist
wait;

if [ `dirname $0` != "." ]; then
# when exec npm run build and cd self dir
cd scripts;
fi;

# common utils
# shell fn - 0 ==> true, other for example 1 ==> false
compareIsNotTsFile() {
  fileName=$1
  replaceFileName=`echo $fileName | sed 's/\([a-z]*\)\.ts/\1/g'`
  if [ "$replaceFileName" == "$fileName" ];
  then
    return 0
  else
    return 1
  fi;
}

# clear package.json field devDependencies to dir release and change version

# copy dir lib、dist and file CHANGELOG.md、index.js、README.md to dir release
RELEASE_DIR_LIST=();
# copy dir file exclude *.ts
RELEASE_DIR_LIST_EXCLUDE_TS=("../bin");
RELEASE_FILE_LIST=("../index.js" "../package.json" "../README.md")

if [ ! -d "../release" ]; then
mkdir ../$RELEASE_DIR
fi

for dir in ${RELEASE_DIR_LIST_EXCLUDE_TS[@]}
do
  outputDir=`echo $dir | sed 's/\.\.\///'`
  fileList=`ls $dir`
  for file in ${fileList}
  do
    if (compareIsNotTsFile $file); then
    cp "$dir/$file" "../$RELEASE_DIR/$outputDir/"
    fi;
  done
done

# copy dir list
for dir in ${RELEASE_DIR_LIST[@]}
do
  # replace str '../' of path
  outputDir=`echo $dir | sed 's/\.\.\///'`
  outputPath=../$RELEASE_DIR/$outputDir
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
  cp $file ../$RELEASE_DIR
  echo -e "\033[34mcp file\033[0m: $file"
done
echo -e "\033[32mcp file done\033[0m \n"

# npm publish release/*
npm run build