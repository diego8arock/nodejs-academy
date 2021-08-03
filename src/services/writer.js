const fs = require('fs');

function writeToFile(fileSource, fileDest) {
  const data = fs.readFileSync(fileSource, 'utf8');

  if (fs.existsSync(fileDest)) {
    fs.appendFile(fileDest, data, (err) => {
      if (err) throw err;
      console.log('Data appended to file!');
    });
  } else {
    fs.writeFile(fileDest, data, (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
  }
}

module.exports.writeToFile = writeToFile;
