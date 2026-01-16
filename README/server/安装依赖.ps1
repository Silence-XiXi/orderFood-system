# 自助点单系统依赖安装脚本
# 从 queueSystem-server 复制已编译的原生模块

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "安装 orderFood-server 依赖" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$serverDir = "queueSystem-server"
$targetDir = "orderFood-server"

# 检查源目录是否存在
if (-not (Test-Path $serverDir)) {
    Write-Host "错误: 找不到 $serverDir 目录" -ForegroundColor Red
    Write-Host "请确保 queueSystem-server 已安装依赖" -ForegroundColor Yellow
    exit 1
}

# 需要复制的原生模块
$nativeModules = @(
    'ffi-napi',
    'ref-napi',
    'ref-struct-napi',
    'ref-array-napi',
    'sqlite3'
)

Write-Host "步骤 1: 安装基础依赖（不包含原生模块）..." -ForegroundColor Yellow
Write-Host ""

# 先安装非原生模块
$basicDeps = @(
    'cors',
    'express',
    'iconv-lite',
    'sequelize'
)

foreach ($dep in $basicDeps) {
    Write-Host "安装 $dep..." -ForegroundColor Gray
    npm install $dep --prefix $targetDir --no-save 2>&1 | Out-Null
}

Write-Host ""
Write-Host "步骤 2: 从 queueSystem-server 复制已编译的原生模块..." -ForegroundColor Yellow
Write-Host ""

$copiedCount = 0
$missingCount = 0

foreach ($moduleName in $nativeModules) {
    $srcPath = Join-Path $serverDir "node_modules\$moduleName"
    $dstPath = Join-Path $targetDir "node_modules\$moduleName"
    
    if (Test-Path $srcPath) {
        Write-Host "复制 $moduleName..." -ForegroundColor Gray
        
        # 确保目标目录的 node_modules 存在
        $nodeModulesDir = Join-Path $targetDir "node_modules"
        if (-not (Test-Path $nodeModulesDir)) {
            New-Item -ItemType Directory -Path $nodeModulesDir -Force | Out-Null
        }
        
        # 删除目标目录（如果存在）
        if (Test-Path $dstPath) {
            Remove-Item -Path $dstPath -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        # 复制模块
        try {
            Copy-Item -Path $srcPath -Destination $dstPath -Recurse -Force
            $copiedCount++
            Write-Host "  ✓ $moduleName 复制成功" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ $moduleName 复制失败: $_" -ForegroundColor Red
            $missingCount++
        }
    } else {
        Write-Host "  ⚠ $moduleName 不存在于 $serverDir" -ForegroundColor Yellow
        $missingCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "安装完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($copiedCount -eq $nativeModules.Count) {
    Write-Host "✓ 所有原生模块已成功复制" -ForegroundColor Green
    Write-Host ""
    Write-Host "现在可以运行:" -ForegroundColor Yellow
    Write-Host "  cd orderFood-server" -ForegroundColor White
    Write-Host "  npm start" -ForegroundColor White
} else {
    Write-Host "⚠ 部分模块复制失败" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "如果缺少模块，请尝试以下方法:" -ForegroundColor Yellow
    Write-Host "  1. 确保 queueSystem-server 已安装依赖:" -ForegroundColor White
    Write-Host "     cd queueSystem-server" -ForegroundColor Gray
    Write-Host "     npm install" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. 或手动安装原生模块（需要 Visual Studio Build Tools）:" -ForegroundColor White
    Write-Host "     cd orderFood-server" -ForegroundColor Gray
    Write-Host "     npm install ffi-napi ref-napi ref-struct-napi ref-array-napi sqlite3" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. 安装 Visual Studio Build Tools（包含 Windows SDK）" -ForegroundColor White
    Write-Host "     下载地址: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022" -ForegroundColor Gray
}
