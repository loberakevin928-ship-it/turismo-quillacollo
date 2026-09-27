@echo off
echo.
echo  ============================================
echo   DETENER SISTEMA TURISMO QUILLACOLLO
echo  ============================================
echo.
echo  Esta ventana va a esperar mientras se detienen
echo  los servicios. Selecciona un puerto si es necesario.
echo.

REM ---- Detener Backend (puerto 5000) ----
echo  Deteniendo Backend (localhost:5000)...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":5000 .*LISTENING"') do (
    echo      Matando proceso PID %%p...
    taskkill /F /PID %%p >nul 2>&1
)

REM ---- Detener Frontend (puerto 5173) ----
echo  Deteniendo Frontend (localhost:5173)...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":5173 .*LISTENING"') do (
    echo      Matando proceso PID %%p...
    taskkill /F /PID %%p >nul 2>&1
)

echo.
echo  Servicios detenidos:
echo    - Backend  (5000): detenido
echo    - Frontend (5173): detenido
echo.
echo  Nota: MariaDB se deja corriendo (la base de datos).
echo  Para detener MariaDB usa XAMPP Control Panel.
echo.
pause
