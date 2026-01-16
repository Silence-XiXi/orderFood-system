/**
 * 动态加载 SQLite3 模块
 * 用于解决 pkg 打包时原生模块无法正确加载的问题
 */

function loadSqlite3() {
  const isPacked = typeof process.pkg !== 'undefined';
  const path = require('path');
  const fs = require('fs');
  
  if (isPacked) {
    // 打包环境：优先从打包内的快照目录加载
    const attempts = [];
    
    // 方法1: 从快照目录加载（打包内的 sqlite3）
    try {
      const snapshotPaths = [
        path.join(__dirname, '../node_modules/sqlite3'),
        path.join(process.cwd(), 'node_modules/sqlite3'),
      ];
      
      for (const sqlite3Path of snapshotPaths) {
        if (fs.existsSync(sqlite3Path)) {
          try {
            // 直接 require 完整路径
            const sqlite3 = require(sqlite3Path);
            console.log(`✓ 从打包内快照目录加载 sqlite3: ${sqlite3Path}`);
            return sqlite3;
          } catch (e) {
            attempts.push(`快照路径 ${sqlite3Path} 加载失败: ${e.message}`);
          }
        }
      }
    } catch (error) {
      attempts.push('快照目录加载失败: ' + error.message);
    }
    
    // 方法2: 直接 require（如果 pkg 已正确包含）
    try {
      const sqlite3 = require('sqlite3');
      console.log('✓ 从模块路径直接加载 sqlite3');
      return sqlite3;
    } catch (error) {
      attempts.push('直接 require 失败: ' + error.message);
    }
    
    // 方法3: 从可执行文件同目录的 node_modules 加载（外部 node_modules，备用方案）
    // 这是最可靠的方案，因为原生模块的二进制文件可以正确加载
    try {
      const execPath = process.execPath;
      const execDir = path.dirname(execPath);
      const externalNodeModulesPath = path.join(execDir, 'node_modules');
      const externalSqlite3Path = path.join(externalNodeModulesPath, 'sqlite3');
      
      if (fs.existsSync(externalSqlite3Path)) {
        // 临时修改 module.paths 以包含外部 node_modules
        const originalPaths = module.paths.slice();
        module.paths.unshift(externalNodeModulesPath);
        try {
          // 尝试直接 require
          const sqlite3 = require('sqlite3');
          module.paths = originalPaths; // 恢复原始路径
          console.log('✓ 从外部 node_modules 加载 sqlite3（推荐方案）');
          console.log(`  路径: ${externalSqlite3Path}`);
          return sqlite3;
        } catch (e) {
          // 如果直接 require 失败，尝试 require 完整路径
          try {
            const sqlite3 = require(externalSqlite3Path);
            module.paths = originalPaths; // 恢复原始路径
            console.log('✓ 从外部 node_modules 加载 sqlite3（使用完整路径）');
            return sqlite3;
          } catch (e2) {
            module.paths = originalPaths; // 恢复原始路径
            attempts.push(`外部 node_modules 加载失败: ${e.message} (完整路径: ${e2.message})`);
          }
        }
      } else {
        attempts.push(`外部 node_modules 不存在: ${externalSqlite3Path}`);
      }
    } catch (error) {
      attempts.push('外部 node_modules 检查失败: ' + error.message);
    }
    
    // 所有方法都失败
    console.error('❌ 无法加载 sqlite3 模块');
    console.error('   尝试的方法:');
    attempts.forEach((attempt, index) => {
      console.error(`   ${index + 1}. ${attempt}`);
    });
    console.error('\n解决方法:');
    console.error('   1. 确保 sqlite3 已正确安装: npm install sqlite3');
    console.error('   2. 重新构建原生模块: npm rebuild sqlite3');
    console.error('   3. 将 queueSystem-server/node_modules/sqlite3 复制到 dist/node_modules/sqlite3');
    console.error('   4. 或考虑使用 PM2 直接运行 Node.js 代码（推荐）');
    throw new Error('无法加载 sqlite3 模块，所有尝试的方法都失败了');
  } else {
    // 开发环境：直接 require
    try {
      return require('sqlite3');
    } catch (error) {
      console.error('❌ 无法加载 sqlite3 模块:', error.message);
      throw error;
    }
  }
}

module.exports = { loadSqlite3 };

