Skripto Desktop App
=====

A scripwriting app built with [Electron](https://electronjs.org/) and [React Native](https://reactjs.org/).

This is pretty much a template right now, so you might want to use it as a boilerplate for your app.

My goal is to build this app to understand how scriptwriting works. Then it's cool if some of you like this project and want to contribute, but frankly there are alternatives, like [Fountain](https://fountain.io). Though the code is quite old. My aim is to, first, write complete .skripto files and give the ability to save as .fountain project or .celtx (perhaps event .fdx).

Check out the [file.skripto](https://github.com/skreenplay/file.skripto) repo to what's being made.


## Install :

1. Install dependencies
    ```
    npm install

    ```
    (Uses React, Electron, `electron-builder`, `foreman` )

1. Run - developer mode
    ```
    npm run dev
    ```

3. Build - package  

    ```
    npm run package

    ```


## Tasks to achieve a workable desktop app :

* Config file storing user-set UI data, or general settings.
* Refine script writing ui (fatal bugs)
* Add complete list of script items
* Export to PDF & Word documents & eventually .fountain
