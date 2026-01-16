/**
 * 从 queueSystem-server 复制已编译的原生模块
 * 避免重新编译（需要 Visual Studio Build Tools）
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../queueSystem-server/node_modules');
const targetDir = path.join(__dirname, 'node_modules');

// 需要复制的原生模块
const nativeModules = [
  'ffi-napi',
  'ref-napi',
  'ref-struct-napi',
  'ref-array-napi',
  'sqlite3'
];

console.log('========================================');
console.log('复制已编译的原生模块');
console.log('========================================\n');

// 检查源目录
if (!fs.existsSync(sourceDir)) {
  console.log('⚠ 警告: queueSystem-server/node_modules 不存在');
  console.log('   将尝试正常安装（可能需要 Visual Studio Build Tools）\n');
  process.exit(0); // 退出，让 npm 正常安装
}

let copiedCount = 0;
let missingCount = 0;

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 复制每个模块
for (const moduleName of nativeModules) {
  const srcPath = path.join(sourceDir, moduleName);
  const dstPath = path.join(targetDir, moduleName);
  
  if (fs.existsSync(srcPath)) {
    try {
      // 直接复制整个模块（包含 prebuilds 或 build）
      // 删除目标目录（如果存在）
      if (fs.existsSync(dstPath)) {
        fs.rmSync(dstPath, { recursive: true, force: true });
      }
      
      // 复制整个模块
      copyDir(srcPath, dstPath);
      copiedCount++;
      console.log(`✓ ${moduleName} 复制成功`);
    } catch (error) {
      console.log(`✗ ${moduleName} 复制失败: ${error.message}`);
      missingCount++;
    }
  } else {
    console.log(`⚠ ${moduleName} 不存在于 queueSystem-server`);
    missingCount++;
  }
}

console.log('\n========================================');
if (copiedCount === nativeModules.length) {
  console.log('✓ 所有原生模块已成功复制');
  console.log('\n现在可以运行: npm start');
} else {
  console.log(`⚠ 部分模块复制失败 (${copiedCount}/${nativeModules.length})`);
  console.log('\n如果缺少模块，请:');
  console.log('  1. 确保 queueSystem-server 已安装依赖: cd ../queueSystem-server && npm install');
  console.log('  2. 或安装 Visual Studio Build Tools（包含 Windows SDK）');
  console.log('  3. 然后运行: npm install');
}
console.log('========================================\n');

// 递归复制目录
function copyDir(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}
