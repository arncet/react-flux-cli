# react-flux-cli

A simple CLI to generate the basic structure of React and Flux files.

React-flux-cli help you to generate some React/Flux files.

Based on the configuration file, react-flux-cli automatically resolves all relative paths to the dependences of the generated files.

A configuration file is generated at ~/.rfcli.json

## Installation :

```
npm install -g react-flux-cli
```

## Example :

### Create a single file :

All directory can be modified in the config file.

React-flux-cli does not modify existing files and does not create non-existent folder. To force the writing or editing you can use the -f option ( --force )


```
rfcli -j Home
// => Create HomeComponent file in ./components 

rfcli -a Home
// => Create HomeActions file in ./actions 

rfcli -s Home
// => Create HomeStore file in ./stores 

rfcli -c Home
// => Create HomeConstants file in ./constants 
```

### Create all files :

Execute rfcli without option will generate all files.

```
rfcli -A Home
// => Create HomeComponent file in ./components
// => Create HomeActions file in ./actions 
// => Create HomeStore file in ./stores 
// => Create HomeConstants file in ./constants 
```

## Configuration :

The default component structure based on [sublime-react](https://github.com/reactjs/sublime-react).

Defaults flux files structure based on [Flux Todo list](http://facebook.github.io/flux/docs/todo-list.html#content).

To use your own file structure, you can edit ~/.rfcli.json.

To transform your code into one line, you can use : [FreeFormatter](http://www.freeformatter.com/javascript-escape.html).


* \<FileType\>_PATH : [String] The path to store files according to the file type
* SUFFIX : [Boolean] Enable/Disable the suffix file name (e.g : Home => HomeComponent, HomeActions ...)
* filesContent : [Object] Store the files's structure (compared to "component", "advancedComponent" has some functions to comply the flux structure)

```javascript
//~/.rfcli.json
{
  "COMPONENT_PATH": "components",
  "ACTIONS_PATH": "actions",
  "STORE_PATH": "stores",
  "CONSTANTS_PATH": "constants",
  "SUFFIX": true,
  "filesContent": {
    "component": "var React = require('react'); ...",
    "advancedComponent": "var React = require('react'); ...",
    "actions": "var AppDispatcher = require('../dispatcher/AppDispatcher'); ...",
    "store": "var AppDispatcher = require('../dispatcher/AppDispatcher'); ...;",
    "constants": "var keyMirror = require('keymirror'); ..."
  }
}
```

## License

MIT
