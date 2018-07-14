#!/bin/bash
echo 'Downloading plugins from https://github.com/skreenplay/plugins'

if [ -d "_plugins/" ]; then
  # Control will enter here if $DIRECTORY exists.
  rm -rf _plugins/
fi

git clone https://github.com/skreenplay/plugins _plugins/

if [ -d "resources/plugins" ];
then
  echo "Plugins directory exists"
else
  mkdir "resources/plugins"
fi

for D in `find _plugins -type d`
do
  if [[ "${D}" == */src ]]; then
    echo -e "\033[1;32mFound a plugin in '${D}' \033[0m"
    echo -e "\033[1;36mBuilding the plugin \033[0m"
    replacePath="resources/plugins"
    outputPath="${D/_plugins/$replacePath}"
    outputPathTwo="${outputPath/\/src/}"
    echo ${outputPathTwo}
    binpath="$(npm bin)";
    node ${binpath}/skripto-plugin build ${D} ${outputPathTwo}
  fi
done

if [ -d "_plugins/" ]; then
  echo -e "\033[1;32mDeleting the _plugins/ folder \033[0m"
  # Control will enter here if $DIRECTORY exists.
  rm -rf _plugins/
fi
