#!/bin/bash
set -e
# get runtime path for run this shell script，
# for example，if you run this script in your project，
# that will get your project root path
root=`pwd`
echo $root
# user set entry file
echo $1
# replace ./test/a.ts as test/a.ts
entry=${1//\.\//}
entry="${root}/${entry}"
echo "The entry file is $entry"

# get default babel config file path in module "typescript-module-alias"
binDir=$(cd "$(dirname "$0")"; pwd)
nodeModulesDir=$(dirname $binDir)
babelConfigFilePath="${nodeModulesDir}/typescript-module-alias/babel.config.js"

outDir=$3
if [ ! $3 ];then
  outDir="dist"
fi

babel --extensions .ts,.js $entry --config-file $babelConfigFilePath --out-dir $outDir
