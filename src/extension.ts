import { spawn } from "child_process";
import { join } from "path";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const fs = require("fs");
var HashMap = require("hashmap");
var map: {
  set: (arg0: any, arg1: any) => void;
  has: (arg0: string) => any;
  get: (arg0: string) => string;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "extension" is now active!');

  // Temporary blank command used to activate the extension through the command palette
  let disposable = vscode.commands.registerCommand(
    "extension.activateSpeak",
    () => {}
  );

  context.subscriptions.push(disposable);
  new SpeechListener(context);
  map = new HashMap();
  var filePath = "/Users/udikshasingh/Projects/vspeak/out/commands.json";
  var data = JSON.parse(fs.readFileSync(filePath));
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    map.set(data[i].command, data[i].exec);
  }
}

class SpeechListener {
  private execFile: any;
  private child: any;

  constructor(context: vscode.ExtensionContext) {
    this.execFile = spawn;
    this.run();
  }

  run() {
    print("Trying to run speech detection");
    this.child = this.execFile("python3", [
      join(__dirname, "tts.py")
    ]).on("error", (error: any) => print(error));
    this.child.stdout.on("data", (data: Buffer) => {
      //print(data);
      let commandRunner = new CommandRunner();
      commandRunner.runCommand(data.toString().trim());
    });

    this.child.stderr.on("data", (data: any) => print(data));
  }
}

class CommandRunner {
  runCommand(receivedString: string) {
    print("Command received: " + receivedString);
    let activeTextEditor;
    const words = receivedString.split(" ");
    const status = words[0] === "success";
    var result = receivedString.substr(receivedString.indexOf(" ") + 1);
    print(result.trim());
    if (map.has(result)) {
      print("executing command...");
      vscode.commands.executeCommand(map.get(result));
    }
    if (status) {
      const commandWords = words.slice(1);
      switch (commandWords[0]) {
        case "navigate_line":
          const lineNumber = parseInt(commandWords[1]);
          activeTextEditor = vscode.window.activeTextEditor;
          if (activeTextEditor) {
            const range = activeTextEditor.document.lineAt(lineNumber - 1)
              .range;
            activeTextEditor.selection = new vscode.Selection(
              range.start,
              range.start
            );
            activeTextEditor.revealRange(range);
          }
          break;
        case "navigate_definition":
          vscode.commands.executeCommand("editor.action.revealDefinition");
          break;
        case "navigate_file":
          vscode.commands.executeCommand("workbench.action.quickOpen");
          //   vscode.window.showQuickPick();
          // console.debug(vscode.workspace.);
          // console.debug(vscode.workspace.asRelativePath("."));
          // vscode.workspace.fs
          //   .readDirectory(
          //     vscode.Uri.file(vscode.workspace.asRelativePath("."))
          //   )
          //   .then(files => {
          //     let filenames: string[] = files.map(
          //       (filename, filetype) => filename[0]
          //     );
          //     vscode.window.showQuickPick(filenames);
          //   });
          break;
        case "copy":
          activeTextEditor = vscode.window.activeTextEditor;
          if (activeTextEditor) {
            const text = activeTextEditor.document.getText(
              activeTextEditor.selection
            );
            vscode.env.clipboard.writeText(text);
          }
          break;

        case "format_document":
          vscode.commands.executeCommand("editor.action.formatDocument");
          break;
        case "format_selection":
          vscode.commands.executeCommand("editor.action.formatSelection");
          break;
        case "navigate_terminal":
          vscode.commands.executeCommand("workbench.action.terminal.focus");
          break;
        case "open_terminal":
          vscode.commands.executeCommand("workbench.action.terminal.new");
          break;
        case "navigate_class":
          let className = commandWords[1];
          // TODO: implement functionality
          break;
        case "run_file":
          activeTextEditor = vscode.window.activeTextEditor;
          if (activeTextEditor) {
            activeTextEditor.document.save(); //should probably save all files
            const currentFileName = activeTextEditor.document.fileName;
            const activeTerminal = vscode.window.activeTerminal;
            if (activeTerminal) {
              // TODO: implement functionality for other languages
              activeTerminal.sendText("python " + currentFileName);
            }
          }
          break;
        case "copy_file":
          // TODO: implement functionality
          break;
        case "close_current_file":
          vscode.commands.executeCommand("workbench.action.closeActiveEditor");
          break;
        case "close_all_files":
          vscode.commands.executeCommand("workbench.action.closeAllEditors");
          break;
        case "close_to_the_right":
          vscode.commands.executeCommand(
            "workbench.action.closeEditorsToTheRight"
          );
          break;
        case "close_to_the_left":
          vscode.commands.executeCommand(
            "workbench.action.closeEditorsToTheLeft"
          );
          break;
        case "close_window":
          vscode.commands.executeCommand("workbench.action.closeWindow");
          break;
      }
    }
  }
}

// helper method for printing to console
function print(data: any) {
  console.log("Vspeak Debug: " + data.toString());
}

// this method is called when your extension is deactivated
export function deactivate() {}
