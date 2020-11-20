(function() {
    window.nodestorage = {};

    var fs = require('fs');
    var path = require('path');

    var currentlyWriting = {};

    var saveFilePath = path.join(nw.App.dataPath, "saves");

    if (! fs.existsSync(saveFilePath)) {
        fs.mkdirSync(saveFilePath);
    }

    window.nodestorage.getItem = function(key, onSuccess, itemEncoding) {
        fs.readFile(path.join(saveFilePath, key + ".sav"), {encoding: itemEncoding}, (err, dat) => {
            if (err) {
                if (onSuccess != null)
                    onSuccess(err, undefined);
                return;
            }
            if (onSuccess != null) {
                if (itemEncoding == null)
                    onSuccess(undefined, dat);
                else
                    onSuccess(undefined, JSON.parse(dat));
            }
        });
    };

    window.nodestorage.getItemParsed = function(key, onSuccess) {
        window.nodestorage.getItem(key, onSuccess, "utf8");
    }

    window.nodestorage.getItemBuffer = function(key, onSuccess) {
        window.nodestorage.getItem(key, onSuccess, null);
    }

    window.nodestorage.setItem = function(key, value, onSuccess) {
        var castValue = value;
        if (!(value instanceof Uint8Array))
            castValue = JSON.stringify(value);

        var fileName = path.join(saveFilePath, key + ".sav");

        if (currentlyWriting[fileName] == undefined) {
            currentlyWriting[fileName] = {thenWriteContent: null};

            fs.writeFile(fileName, castValue, (err) => {
                if (currentlyWriting[fileName] != undefined) {
                    if (currentlyWriting[fileName].thenWriteContent != null) {
                        window.nodestorage.setItem(key + ".sav", currentlyWriting[fileName].thenWriteContent, null);
                    }
                    currentlyWriting[fileName] = undefined;
                }

                if (!err && onSuccess != null)
                    onSuccess();
            });
        } else {
            currentlyWriting[fileName].thenWriteContent = value;
        }
    };

    window.nodestorage.removeItem = function(key, onSuccess) {
        fs.unlink(path.join(saveFilePath, key+ ".sav"), (err) => {
            if (err) return;
            
            if (onSuccess != null)
                onSuccess();
        })
    };

    window.nodestorage.clear = function(onSuccess) {
        fs.readdir(saveFilePath, (err, files) => {
            if (err) throw err;
          
            for (const file of files) {
                fs.unlink(path.join(saveFilePath, file), err => {
                    if (err) throw err;
                });
            }
        });
    };

    //Always ready
    window.nodestorage.ready = function() {
        return new Promise((resolve, reject) => {
            resolve();
        });
    };
})();