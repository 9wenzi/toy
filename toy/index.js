const fs = require("fs");
const path = require("path");

const { Hash } = require("./util/hash");
const { isCache, isChange, makeCache } = require("./util/cache");

// 解析器
const parser = require("./toyParser");

// 编辑器
const htmlCompiler = require("./toyHtmlCompiler");
const scriptCompiler = require("./toyScriptCompiler");
const styleCompiler = require("./toyStyleCompiler");

// 用户定义
const config = require("../config");
const output = config.output;
const entry = config.entry;

// 初始化
function toyInit(entry) {
  watch(entry);
  walk(entry);
}

// 监听目录
function watch(entry) {
  console.info(`正在监听${entry}`);
  fs.watch(entry, { recursive: true }, (eventType, filename) => {
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

        // 若是文件 则生成文件
        fs.readFile(filePath, "utf-8", (err, data) => {
          if (err) return console.warn(err);

          // 缓存文件hash
          let hash = Hash(data);
          if (isCache(filePath) && !isChange(filePath, hash)) return;
          makeCache(filePath, hash);

          toyCompiler(data).then(AST => {
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

// 生成 输出绝对路径
function creatBuildPath(srcPath, distPath) {
  let filename = getFilename(srcPath, config.ext);

  // 入口的相对路径
  let relativePath = path.relative(entry, srcPath);

  // 获取到路径
  relativePath = getPath(relativePath);

  // 生成输出路径的绝对路径
  return path.resolve(distPath, relativePath, filename);
}

//生成文件
function creatFile(filePath, fileExt, data) {
  if (!data) return;
  fs.writeFile(filePath + "." + fileExt, data, err => {
    if (err) return console.error(err);
    console.log(`生成${filePath}.${fileExt}文件`);
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
    console.log(`生成文件夹${dirPath}`);
    callback();
  });
}

// AST 树 数据 处理
// 这里是 用户定义 插件 的 流水线 处理 config.plugin  todo
async function toyCompiler(data) {
  let AST = parser.parseData(data);

  // 对 template 处理 json -> string
  if (AST.template && AST.template.children.length === 1) {
    AST.template = htmlCompiler.compile(AST.template.children[0]);
  }

  // 对 script 内容 处理
  if (AST.script) {
    AST.script = scriptCompiler.compile(AST.script.children[0].data);
  }

  //对 style 内容处理 此处默认使用 less 处理器
  if (AST.style) {
    AST.style = await styleCompiler.compile(AST.style.children[0].data);
    AST.style = AST.style.css;
  }
  return AST;
}

toyInit(entry);
