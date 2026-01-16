@echo off
chcp 65001 >nul
echo ========================================
echo 清理 dist 目录
echo ========================================
echo.

cd /d "%~dp0\.."

if exist "dist\queue-system.exe" (
    echo 正在尝试删除 queue-system.exe...
    
    REM 尝试结束可能正在运行的进程
    taskkill /F /IM queue-system.exe >nul 2>&1
    
    REM 等待一下
    timeout /t 1 /nobreak >nul
    
    REM 尝试删除文件
    del /F /Q "dist\queue-system.exe" >nul 2>&1
    
    if exist "dist\queue-system.exe" (
        echo [错误] 无法删除 queue-system.exe
        echo 请手动关闭所有相关进程，然后删除文件
        echo 文件路径: %cd%\dist\queue-system.exe
        pause
        exit /b 1
    ) else (
        echo [成功] queue-system.exe 已删除
    )
) else (
    echo [信息] queue-system.exe 不存在，无需删除
)

echo.
echo ========================================
echo 清理完成
echo ========================================
pause

