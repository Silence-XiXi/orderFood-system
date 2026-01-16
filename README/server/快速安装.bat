@echo off
chcp 65001 >nul
echo ========================================
echo 快速安装 orderFood-server 依赖
echo ========================================
echo.

echo 步骤 1: 从 queueSystem-server 复制已编译的原生模块...
echo.

if not exist "..\queueSystem-server\node_modules" (
    echo 错误: 找不到 queueSystem-server\node_modules 目录
    echo 请先运行: cd ..\queueSystem-server ^&^& npm install
    pause
    exit /b 1
)

if not exist "node_modules" mkdir node_modules

echo 复制 ffi-napi...
xcopy /E /I /Y "..\queueSystem-server\node_modules\ffi-napi" "node_modules\ffi-napi\" >nul 2>&1
if %errorlevel%==0 (echo   ✓ ffi-napi 复制成功) else (echo   ✗ ffi-napi 复制失败)

echo 复制 ref-napi...
xcopy /E /I /Y "..\queueSystem-server\node_modules\ref-napi" "node_modules\ref-napi\" >nul 2>&1
if %errorlevel%==0 (echo   ✓ ref-napi 复制成功) else (echo   ✗ ref-napi 复制失败)

echo 复制 ref-struct-napi...
xcopy /E /I /Y "..\queueSystem-server\node_modules\ref-struct-napi" "node_modules\ref-struct-napi\" >nul 2>&1
if %errorlevel%==0 (echo   ✓ ref-struct-napi 复制成功) else (echo   ✗ ref-struct-napi 复制失败)

echo 复制 ref-array-napi...
xcopy /E /I /Y "..\queueSystem-server\node_modules\ref-array-napi" "node_modules\ref-array-napi\" >nul 2>&1
if %errorlevel%==0 (echo   ✓ ref-array-napi 复制成功) else (echo   ✗ ref-array-napi 复制失败)

echo 复制 sqlite3...
xcopy /E /I /Y "..\queueSystem-server\node_modules\sqlite3" "node_modules\sqlite3\" >nul 2>&1
if %errorlevel%==0 (echo   ✓ sqlite3 复制成功) else (echo   ✗ sqlite3 复制失败)

echo.
echo 步骤 2: 安装其他依赖...
echo.

call npm install cors express iconv-lite sequelize --no-save

echo.
echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 现在可以运行:
echo   npm start
echo.
pause
