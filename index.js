const fs = require("fs");
const path = require("path");
const config = require("./config");
const toy = require("./toy");
const entry = config.entry;
const output = config.output;

watch(entry);

walk(entry);

// 监听目录
function watch(entry) {
  console.info(`正在监听${entry}`);
  fs.watch(entry, {recursive : true}, (eventType, filename ) => {
    walk(entry);
  });
}

// 遍历指定目录内容
function walk(entry) {
  fs.readdir(entry, (err, files) => {
    if (err) return console.err(err);

    if (!files || !files.length) return;

    files.forEach(file => {
      // 生成每一个文件路径
      let filePath = path.resolve(entry, file);

      fs.stat(filePath, (err, stats) => {
        //判断读取的是文件夹
        if (stats.isDirectory()) {
          return createDir(path.resolve(output, file), () => {
            walk(filePath);
          });
        }

        fs.readFile(filePath, "utf-8", (err, data) => {
          if (err) return console.warn(err);

          toy.toyHandler(data).then(AST => {
            let outputPath = creatBuildPath(filePath, output);

            // 生成文件
            creatFile(outputPath, "html", AST.template);
            creatFile(outputPath, "js", AST.script);
            creatFile(outputPath, "css", AST.style);
          });
        });
      });
    });
  });
}

// 获取到文件名
function getFilename(file, ext) {
  return path.basename(file, `.${ext}`);
}

// 获取到路径
function getPath(pahtName) {
  return path.dirname(pahtName);
}

// 生成 输出路径
function creatBuildPath(srcPath, distPath) {
  let filename = getFilename(srcPath, config.ext);

  let relativePath = path.relative(entry, srcPath);

  relativePath = getPath(relativePath);
  return path.resolve(distPath, relativePath, filename);
}

//生成文件
function creatFile(filePath, fileExt, data) {
  if (!data) return;
  fs.writeFile(filePath + "." + fileExt, data, err => {
    if (err) return console.error(err);
    console.log(`创建${filePath}.${fileExt}文件`);
  });
}

// 生成文件夹
function createDir(dirPath, callback) {
  fs.mkdir(dirPath, err => {
    if (err) {
      if (err.code === "EEXIST") {
        return callback();
      }
      return console.error(err);
    }
    console.log(`创建文件夹${dirPath}`);
    callback();
  });
}
