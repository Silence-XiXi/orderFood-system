# 依赖安装说明

## 问题说明

`ffi-napi`、`ref-napi` 等原生模块需要编译，需要 Visual Studio Build Tools 和 Windows SDK。

## 解决方案：从 queueSystem-server 复制已编译模块

### 方法一：使用快速安装脚本（推荐）

1. **确保 queueSystem-server 已安装依赖：**
   ```powershell
   cd ..\queueSystem-server
   npm install
   ```

2. **运行快速安装脚本：**
   ```powershell
   cd orderFood-server
   .\快速安装.bat
   ```

### 方法二：手动复制（如果脚本失败）

```powershell
# 1. 确保 node_modules 目录存在
cd orderFood-server
if (-not (Test-Path "node_modules")) {
    New-Item -ItemType Directory -Path "node_modules" -Force
}

# 2. 复制原生模块
$modules = @('ffi-napi', 'ref-napi', 'ref-struct-napi', 'ref-array-napi', 'sqlite3')
foreach ($mod in $modules) {
    $src = "..\queueSystem-server\node_modules\$mod"
    $dst = "node_modules\$mod"
    if (Test-Path $src) {
        Write-Host "复制 $mod..."
        Copy-Item -Path $src -Destination $dst -Recurse -Force
        Write-Host "  ✓ 完成"
    }
}

# 3. 安装其他依赖（使用 --ignore-scripts 避免重新编译）
npm install cors express iconv-lite sequelize --ignore-scripts
```

### 方法三：安装 Visual Studio Build Tools（如果无法复制）

1. **下载 Visual Studio Build Tools：**
   - 访问：https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   - 下载 "Build Tools for Visual Studio 2022"

2. **安装时选择：**
   - ✅ C++ 生成工具
   - ✅ Windows 10/11 SDK（最新版本）

3. **然后运行：**
   ```powershell
   cd orderFood-server
   npm install
   ```

## 验证安装

检查模块是否已正确安装：

```powershell
# 检查 ffi-napi
Test-Path "node_modules\ffi-napi\build\Release\*.node"

# 检查 sqlite3
Test-Path "node_modules\sqlite3\build\Release\node_sqlite3.node"
```

如果返回 `True`，说明安装成功。

## 启动服务器

安装完成后：

```powershell
npm start
```

如果看到 "打印机功能未启用（DLL未加载或已禁用）" 是正常的，系统会以模拟模式运行，不影响订单创建功能。
