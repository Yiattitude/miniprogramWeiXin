// 复制静态资源到编译输出目录
const fs = require('fs')
const path = require('path')

const sourceFile = path.join(__dirname, '../src/static/default-avatar.png')
const targetFile = path.join(__dirname, '../dist/dev/mp-weixin/static/default-avatar.png')

if (fs.existsSync(sourceFile)) {
  // 确保目标目录存在
  const targetDir = path.dirname(targetFile)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }
  
  // 复制文件
  fs.copyFileSync(sourceFile, targetFile)
  console.log('✓ 默认头像已复制到输出目录')
} else {
  console.warn('⚠ 默认头像源文件不存在')
}
