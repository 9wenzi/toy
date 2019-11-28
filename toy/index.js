const parser = require("./toyParser");
const htmlCompiler = require("./toyHtmlCompiler");
const scriptCompiler = require("./toyScriptCompiler");
const styleCompiler = require("./toyStyleCompiler");

// AST 树 节点 生成 字符串
async function toyHandler(data) {
  let AST = parser.parseData(data);

  if (AST.template && AST.template.children.length === 1) {
    AST.template = htmlCompiler.compile(AST.template.children[0]);
  }

  if (AST.script) {
    AST.script = scriptCompiler.compile(AST.script.children[0].data);
  }

  // 此处默认使用 less 处理器
  if (AST.style) {
    AST.style = await styleCompiler.compile(AST.style.children[0].data);
    AST.style = AST.style.css;
  }
  return AST;
}





module.exports = {
  toyHandler
};
