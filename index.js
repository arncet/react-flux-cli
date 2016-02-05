#!/usr/bin/env node

/**
 * Default component structure based on https://github.com/reactjs/sublime-react
 * Default flux files structure base on http://facebook.github.io/flux/docs/todo-list.html#content
 * To use your own file structure, you can edit ~/.rfcli.json
 * To transform your code into one line, you can use : http://www.freeformatter.com/javascript-escape.html  
 **/

var program = require('commander');
var fs      = require('fs-extra');
var path    = require('path');
var findup  = require('findup-sync');
var chalk   = require('chalk');

/**
 * The default confoguration :
 * <FileType>_PATH : [String] The path to store files according to the file type
 * SUFFIX : [Boolean] Enable/Disable the suffix file name (e.g : Home => HomeComponent, HomeActions ...)
 * filesContent : [Object] Store the files's structure (compared to "component", "advancedComponent" has some functions to comply the flux structure)
 **/
var config = {
    COMPONENT_PATH : 'components',  
    ACTIONS_PATH   : 'actions',  
    STORE_PATH     : 'stores',  
    CONSTANTS_PATH : 'constants',
    SUFFIX         : true,
    filesContent   : {
        component         : "var React = require('react');\r\rvar <fileName>Component = React.createClass({\r\trender: function() {\r\t\treturn (\r\t\t\t<div />\r\t\t);\r\t}\r});\r\rmodule.exports = <fileName>Component;",
        advancedComponent : "var React = require(\'react\');\r\nvar <fileName>Actions = require(\'<actionsPath>\');\r\nvar <fileName>Store = require(\'<storePath>\');\r\n\r\nfunction get<fileName>State() {\r\n  return {\r\n    <fileNameLow>: <fileName>Store.get()\r\n  };\r\n}\r\n\r\nvar <fileName>Component = React.createClass({\r\n\r\n  getInitialState: function() {\r\n    return get<fileName>State();\r\n  },\r\n\r\n  componentDidMount: function() {\r\n    <fileName>Store.addChangeListener(this._onChange);\r\n  },\r\n\r\n  componentWillUnmount: function() {\r\n    <fileName>Store.removeChangeListener(this._onChange);\r\n  },\r\n\r\n  \/**\r\n   * @return {object}\r\n   *\/\r\n  render: function() {\r\n    return (\r\n      <div\/>\r\n    );\r\n  },\r\n\r\n  _onChange: function() {\r\n    this.setState(get<fileName>State());\r\n  }\r\n\r\n});\r\n\r\nmodule.exports = <fileName>Component;",
        actions           : "var AppDispatcher = require('../dispatcher/AppDispatcher');\rvar <fileName>Constants = require('<constantsPath>');\r\rvar <fileName>Actions = {\r\r\tfoo: function(bar) {\r\t\tAppDispatcher.handleViewAction({\r\t\t\tactionType: <fileName>Constants.FOO,\r\t\t\tbar: bar\r\t\t});\r\t}\r\r};\r\rmodule.exports = <fileName>Actions;",
        store             : "var AppDispatcher = require('../dispatcher/AppDispatcher');\rvar EventEmitter = require('events').EventEmitter;\rvar <fileName>Constants = require('<constantsPath>');\rvar assign = require('object-assign');\r\rvar CHANGE_EVENT = 'change';\r\rvar _<fileNameLow> = {};\r\rfunction foo(){\r\tconsole.log('Foo');\r}\r\rvar <fileName>Store = assign({}, EventEmitter.prototype, {\r\r\tget<fileName>: function() {\r\t\treturn _<fileNameLow>;\r\t},\r\r\temitChange: function() {\r\t\tthis.emit(CHANGE_EVENT);\r\t},\r\r\taddChangeListener: function(callback) {\r\t\tthis.on(CHANGE_EVENT, callback);\r\t},\r\r\tremoveChangeListener: function(callback) {\r\t\tthis.removeListener(CHANGE_EVENT, callback);\r\t},\r\r\tdispatcherIndex: AppDispatcher.register(function(payload) {\r\t\tvar action = payload.action;\r\r\t\tswitch(action.actionType) {\r\t\t\tcase <fileName>Constants.FOO:\r\t\t\tfoo(action.bar);\r\t\t\t<fileName>Store.emitChange();\r\t\t\tbreak;\r\t\t}\r\r\t\t\treturn true;\r\t})\r\r});\r\rmodule.exports = <fileName>Store;",
        constants         : "var keyMirror = require('keymirror');\r\rmodule.exports = {\r\r\tActionTypes: keyMirror({\r\t\tFOO: 'foo'\r\t})\r\r};"
    }
};

/**
 * Get the Home Directory path
 **/
function getHomeDirectory() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

/**
 * Get the config file
 **/
function getConfigFilePath(){
    return path.join(getHomeDirectory(), '.rfcli.json');
}

/**
 * Create the config file
 **/
function createConfigFile(){
    fs.outputJson(getConfigFilePath(), config, function (err) {
        if(err) return console.log(chalk.bold.red(`${err}`));
        console.log(chalk.green('Config file created at'), chalk.blue(getConfigFilePath()));
    });
}

/**
 * Find the config file
 **/
function findConfigFile(){
    return findup('.rfcli.json', {cwd: getHomeDirectory()});
}

/**
 * Initialization
 * Create the config file if it does not exist, else use it
 **/
function init(){
    var configFile = findConfigFile();
    if(!configFile) {
        createConfigFile();
    }
    else {
        var configFileContent = fs.readJsonSync(configFile, {throws: false});
        if(!configFileContent) return console.log(chalk.bold.red('The config file structure is invalid'));
        config = configFileContent;
    }
}

/**
 * Get the full file name
 * Add the suffix according to the config
 **/
function getFullFileName(fileName, suffix){
    return config.SUFFIX ? fileName + suffix : fileName;
}

/**
 * Get the content file
 **/
function getFileContent(fileName, type){
    var actionsFullPath = path.join(process.env.PWD, config.ACTIONS_PATH);
    var storeFullPath = path.join(process.env.PWD, config.STORE_PATH);
    var constantsFullPath = path.join(process.env.PWD, config.CONSTANTS_PATH);
    
    var fileFullPath = path.join(process.env.PWD, config[type.toUpperCase()+'_PATH']);
    
    var actionsRelativePath = path.relative(fileFullPath, actionsFullPath);
    var storeRelativePath = path.relative(fileFullPath, storeFullPath);
    var constantsRelativePath = path.relative(fileFullPath, constantsFullPath);
    
    var fileContent = config.filesContent[type.toLowerCase()];
    //Generate a advanced component file if there is --all option 
    //or if there is --jsx options and at least a flux option (--action, --store, --constants)
    if(type === 'Component' && (allFilesOption() || (program.actions || program.stores || program.constants))){
        fileContent = config.filesContent.advancedComponent;
    }
    return fileContent
                .replace(/<fileName>/g, fileName)
                .replace(/<fileNameLow>/g, fileName.toLowerCase())
                .replace(/<actionsPath>/g, path.join(actionsRelativePath, getFullFileName(fileName, 'Actions')))
                .replace(/<storePath>/g, path.join(storeRelativePath, getFullFileName(fileName, 'Store')))
                .replace(/<constantsPath>/g, path.join(constantsRelativePath, getFullFileName(fileName, 'Constants')));
}

/**
 * Check if a specific direcotry/file exist
 **/
function checkIfExist(path, callback){
    fs.access(path, fs.R_OK | fs.W_OK, function (err) {
        return callback(err);
    });
}

/**
 * Create a file
 **/
function createFile(fileName, type, ext, success){
    if(!ext) ext = '.js';
    var fullFileName = getFullFileName(fileName, type);
    var folderPath = config[type.toUpperCase()+'_PATH'];
    var filePath = path.join(folderPath, fullFileName + ext);
    var content = getFileContent(fileName, type);
    checkIfExist(folderPath, function(err){
        if(!err || (err && program.force)){
            checkIfExist(filePath, function(err){
                if(err || (!err && program.force)){
                    fs.outputFile(filePath, content, function (err) {
                        if(err) return console.log(chalk.bold.red(`${err}`));
                        success();
                    });
                }else{
                    console.log(chalk.bold.red('Error: ' + fullFileName + ' is already exist.'));
                    console.log(chalk.red("To force the file edition use -f  (--force) option"));
                }
            });
        }else{
            console.log(chalk.bold.red(`${err}`));
            console.log(chalk.red("To force the folder creation use -f  (--force) option"));
        }
    });
}

/**
 * Display the creation informations
 **/
function createFileSuccess(type, fileName){
    console.log(chalk.green(type), chalk.blue(getFullFileName(fileName, type)), chalk.green('created.'));
}

/**
 * Check if all files must be generate
 **/
function allFilesOption(){
    //If there is on options, if there is -a option or if there is only -f option
    return (process.argv.length === 3 || program.all || (process.argv.length === 4 && program.force));
}

program
    .version('1.0.3')
    .arguments('<fileName>')
    .option('-j, --jsx', 'Create component file (.jsx)')
    .option('-a, --actions', 'Create an actions file')
    .option('-s, --store', 'Create a store file')
    .option('-c, --constants', 'Create a constants file')
    .option('-A, --all', 'Create all files (component, actions, store and constants)')
    .option('-f, --force', 'Force the creation (e.g If the destination folder does not exist)')
    .action(function(fileName) {
        init();
        if(allFilesOption()){
            createFile(fileName, 'Component', '.jsx', createFileSuccess.bind(this, 'Component', fileName));
            createFile(fileName, 'Actions', null, createFileSuccess.bind(this, 'Actions', fileName));
            createFile(fileName, 'Store', null, createFileSuccess.bind(this, 'Store', fileName));
            createFile(fileName, 'Constants', null, createFileSuccess.bind(this, 'Constants', fileName));
        } else {
            if(program.jsx) createFile(fileName, 'Component', '.jsx', createFileSuccess.bind(this, 'Component', fileName));
            if(program.actions) createFile(fileName, 'Actions', null, createFileSuccess.bind(this, 'Actions', fileName));
            if(program.store) createFile(fileName, 'Store', null, createFileSuccess.bind(this, 'Store', fileName));
            if(program.constants) createFile(fileName, 'Constants', null, createFileSuccess.bind(this, 'Constants', fileName));
        }
    })
    .parse(process.argv);