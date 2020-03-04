# CONSTANT = {
#     "number": "$number",
#     "string": "$string",
#     "function": "$function",
#     "selected": "$selected",
# }


class Commands:
    def __init__(self):
        self.commanKeyDict = {
            "open": {
                "tags": ["open"],
                "attributes": {
                    "name": ["file", "folder", "workspace", ""],
                    "parameter": ["", "", "", ""],
                    "command": [
                        "open_file",
                        "open_folder",
                        "open_workspace",
                        "open_file",
                    ],
                    "wordlen": [(2, 3), (2, 3), (2, 3), (1, 1)],
                },
            },
            "go": {
                "tags": ["go to", "goto", "navigate to", "move to"],
                "attributes": {
                    "name": ["line", "definition", "class", "file"],
                    "parameter": ["number", "", "string", ""],
                    "command": [
                        "navigate_line",
                        "navigate_definition",
                        "navigate_class",
                        "navigate_file",
                    ],
                    "wordlen": [(4, 7), (3, 5), (3, 6), (2, 4)],
                },
            },
            "close": {
                "tags": ["close"],
                "attributes": {
                    "name": [
                        "current file",
                        "this file",
                        "all files",
                        "files to the right",
                        "file to the right",
                        "files to the left",
                        "file to the left",
                        "window",
                    ],
                    "parameter": ["", "", "", "", "", ""],
                    "command": [
                        "close_current_file",
                        "close_current_file",
                        "close_all_files",
                        "close_to_the_right",
                        "close_to_the_right",
                        "close_to_the_left",
                        "close_to_the_left",
                        "close_window",
                    ],
                    "wordlen": [
                        (3, 4),
                        (3, 4),
                        (3, 5),
                        (3, 6),
                        (3, 6),
                        (3, 6),
                        (3, 6),
                        (2, 3),
                    ],
                },
            },
        }
        transcript = ""
        self.original = ""
        self.transcript = ""
        self.transcriptLength = 0

    def getParams(self, param, argName):
        if param == "number":
            numbers = [int(s) for s in self.transcript if s.isdigit()]
            if len(numbers) == 1:
                return numbers[0]
            else:
                return None

        if param == "string":
            argIndex = self.transcript.index(argName)
            if argIndex < (len(self.transcript) - 1):
                nextword = self.transcript[argIndex + 1]
                return nextword
            else:
                return None
        return param

    def getCommand(self, transcript):

        self.transcript = transcript.lower().split()
        self.original = self.transcript
        self.transcriptLength = len(self.transcript)
        attributes = self.getCommandKeyAttributes()
        response = "fallback"
        command = transcript
        paramValue = ""
        if attributes is not None:
            idx = -1
            names = attributes.get("name")
            for i in range(len(names)):
                index = self.subfinder(self.transcript, names[i].split())
                # index = self.transcript.find(names[i])
                if index > -1:
                    idx = i
                    break

            if idx > -1:
                (minLen, maxLen) = attributes["wordlen"][idx]
                if minLen <= len(self.original) <= maxLen:
                    paramValue = self.getParams(
                        attributes.get("parameter")[idx], attributes.get("name")[idx]
                    )
                    response = "success"
                    command = attributes.get("command")[idx]
                    if paramValue is None:
                        response = "fallback"
                        command = transcript

        print(response, command, paramValue, flush=True)
        return
        # return {"response": response, "command": command, "parameter": paramValue}

    def getCommandKeyAttributes(self):
        commandKeys = self.commanKeyDict.keys()
        for key in commandKeys:
            tags = self.commanKeyDict[key].get("tags")
            for tag in tags:
                index = self.subfinder(self.transcript, tag.split())
                if index > -1:
                    self.transcript = self.transcript[index:]
                    return self.commanKeyDict[key].get("attributes")

        return None

    def subfinder(self, mylist, pattern):
        for i in range(len(mylist)):
            if mylist[i] == pattern[0] and mylist[i : i + len(pattern)] == pattern:
                return i
        return -1


# def main():
#     commandObj = Commands()
#     commandObj.getCommand("Please go to line number 28 as as")


# if __name__ == "__main__":
#     main()
