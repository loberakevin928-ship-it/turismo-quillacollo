@echo off
setlocal enabledelayedexpansion

title Sistema Turismo Quillacollo - INICIO

REM ============================================================
REM  CONFIGURACION (edita aqui si cambian las rutas)
REM ============================================================
REM La ruta del proyecto se detecta sola (carpeta donde esta este .bat)
set "PROYECTO=%~dp0"
if "%PROYECTO:~-1%"=="\" set "PROYECTO=%PROYECTO:~0,-1%"

set "XAMPP=C:\xampp"
if not exist "%XAMPP%\mysql\bin\mysqld.exe" if exist "%ProgramFiles%\xampp\mysql\bin\mysqld.exe" set "XAMPP=%ProgramFiles%\xampp"
if not exist "%XAMPP%\mysql\bin\mysqld.exe" if exist "%ProgramFiles(x86)%\xampp\mysql\bin\mysqld.exe" set "XAMPP=%ProgramFiles(x86)%\xampp"
set "MYSQL=%XAMPP%\mysql\bin\mysql.exe"
set "RUTA_BACKEND=%PROYECTO%\backend"
set "RUTA_FRONTEND=%PROYECTO%\frontend"
set "URL_BACKEND=http://localhost:5000"
set "URL_FRONTEND=http://localhost:5173"

echo.
echo  ============================================
echo   SISTEMA TURISMO QUILLACOLLO
echo   Iniciando todos los servicios...
echo  ============================================
echo.

REM ============================================================
REM  0) PRE-REQUISITOS
REM ============================================================
echo  [0/4] Verificando pre-requisitos...

where node >nul 2>&1
if errorlevel 1 goto err_node

where npm >nul 2>&1
if errorlevel 1 goto err_npm

echo       Node.js / npm: OK

if not exist "%PROYECTO%" goto err_proyecto
if not exist "%RUTA_BACKEND%\src\index.js" goto err_backend
if not exist "%RUTA_FRONTEND%\package.json" goto err_frontend

echo       Rutas del proyecto: OK

if not exist "%RUTA_BACKEND%\.env" goto aviso_env
goto dep_backend

:aviso_env
echo       AVISO: Falta %RUTA_BACKEND%\.env
if not exist "%RUTA_BACKEND%\.env.example" goto err_env
echo       Creando .env a partir de .env.example (primera vez)...
copy /y "%RUTA_BACKEND%\.env.example" "%RUTA_BACKEND%\.env" >nul
echo       Archivo .env creado correctamente.
goto dep_backend

:err_env
echo       ERROR: No existe ni .env ni .env.example en %RUTA_BACKEND%
pause
exit /b 1

:dep_backend
if not exist "%RUTA_BACKEND%\node_modules" goto inst_backend
echo       Backend dependencias: OK
goto dep_frontend

:inst_backend
echo       Backend: faltan dependencias. Instalando (primera vez)...
pushd "%RUTA_BACKEND%"
call npm install
if errorlevel 1 goto err_inst_backend
popd
goto dep_frontend

:err_inst_backend
popd
echo       ERROR: No se pudieron instalar dependencias del backend.
pause
exit /b 1

:dep_frontend
if not exist "%RUTA_FRONTEND%\node_modules" goto inst_frontend
echo       Frontend dependencias: OK
goto paso_db

:inst_frontend
echo       Frontend: faltan dependencias. Instalando (primera vez)...
pushd "%RUTA_FRONTEND%"
call npm install
if errorlevel 1 goto err_inst_frontend
popd
goto paso_db

:err_inst_frontend
popd
echo       ERROR: No se pudieron instalar dependencias del frontend.
pause
exit /b 1

:err_node
echo       ERROR: Node.js no esta instalado o no esta en el PATH.
echo       Instala Node.js desde https://nodejs.org y vuelve a intentar.
pause
exit /b 1

:err_npm
echo       ERROR: npm no esta disponible (Node.js mal instalado).
pause
exit /b 1

:err_proyecto
echo       ERROR: No existe la carpeta del proyecto:
echo           %PROYECTO%
pause
exit /b 1

:err_backend
echo       ERROR: No se encontro el backend en:
echo           %RUTA_BACKEND%
pause
exit /b 1

:err_frontend
echo       ERROR: No se encontro el frontend en:
echo           %RUTA_FRONTEND%
pause
exit /b 1

REM ============================================================
REM  1) MARIADB (puerto 3306)
REM ============================================================
:paso_db
echo.
echo  [1/4] Verificando MariaDB (base de datos, puerto 3306)...
netstat -ano | findstr /R /C:":3306 .*LISTENING" >nul 2>&1
if not errorlevel 1 goto db_ya_corre

echo       MariaDB apagado. Iniciando...
if not exist "%XAMPP%\mysql\bin\mysqld.exe" goto err_mysqld
start "MariaDB Turismo" "%XAMPP%\mysql\bin\mysqld.exe" --defaults-file="%XAMPP%\mysql\bin\my.ini"
echo       Esperando que MariaDB acepte conexiones...
call :wait_port 3306 MariaDB 30
if errorlevel 1 goto err_db_timeout
goto verificar_db

:db_ya_corre
echo       MariaDB ya esta corriendo. OK

:verificar_db
echo       Revisando si la base de datos turismo_quillacollo existe...
%MYSQL% -u root -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='turismo_quillacollo'" > "%TEMP%\tq_tablas.txt" 2>nul
set /p TABLAS_BT=< "%TEMP%\tq_tablas.txt"
del "%TEMP%\tq_tablas.txt" >nul 2>&1
if defined TABLAS_BT if "%TABLAS_BT%" NEQ "0" goto db_ok
echo       La base de datos no esta inicializada.
echo       Creando esquema y datos de ejemplo desde backend\db-init.sql...
%MYSQL% -u root --default-character-set=utf8mb4 < "%RUTA_BACKEND%\db-init.sql" >nul
if errorlevel 1 goto err_db_init
echo       Base de datos creada con exito.
echo       Usuarios de prueba:  admin / Admin123!   y   editor / Editor123!
:db_ok

:paso_backend

REM ============================================================
REM  2) BACKEND (puerto 5000)
REM ============================================================
echo.
echo  [2/4] Iniciando Backend (%URL_BACKEND%)...
netstat -ano | findstr /R /C:":5000 .*LISTENING" >nul 2>&1
if not errorlevel 1 goto backend_ya_corre

echo       Lanzando backend en ventana nueva...
start "Backend Turismo (5000)" /D "%RUTA_BACKEND%" cmd /k "node src/index.js"
call :wait_port 5000 Backend 30
if errorlevel 1 goto backend_aviso
goto paso_frontend

:backend_ya_corre
echo       El Backend ya esta corriendo. Se omite el arranque. OK
goto paso_frontend

:backend_aviso
echo       AVISO: El Backend no respondio en 30 segundos.
echo       Revisa la ventana "Backend Turismo" por errores.

:paso_frontend

REM ============================================================
REM  3) FRONTEND (puerto 5173)
REM ============================================================
echo.
echo  [3/4] Iniciando Frontend (%URL_FRONTEND%)...
netstat -ano | findstr /R /C:":5173 .*LISTENING" >nul 2>&1
if not errorlevel 1 goto frontend_ya_corre

echo       Lanzando frontend en ventana nueva...
start "Frontend Turismo (5173)" /D "%RUTA_FRONTEND%" cmd /k "npm run dev"
call :wait_port 5173 Frontend 60
if errorlevel 1 goto frontend_aviso
goto abrir_navegador

:frontend_ya_corre
echo       El Frontend ya esta corriendo. Se omite el arranque. OK
goto abrir_navegador

:frontend_aviso
echo       AVISO: El Frontend no respondio en 60 segundos.
echo       Revisa la ventana "Frontend Turismo" por errores.
goto abrir_navegador

:err_mysqld
echo       ERROR: No se encontro mysqld.exe en:
echo           %XAMPP%\mysql\bin
echo       Instala XAMPP y abre su Control Panel.
pause
exit /b 1

:err_db_timeout
echo       ERROR: MariaDB no logro iniciar en 30 segundos.
pause
exit /b 1

:err_db_init
echo       ERROR: No se pudo crear la base de datos.
echo       Revisa que MariaDB este ejecutandose o la variable XAMPP.
pause
exit /b 1

REM ============================================================
REM  4) ABRIR NAVEGADOR
REM ============================================================
:abrir_navegador
echo.
echo  [4/4] Abriendo el navegador...
start "" "%URL_FRONTEND%"

echo.
echo  ============================================
echo   TODOS LOS SERVICIOS LANZADOS
echo.
echo   - Frontend :  %URL_FRONTEND%
echo   - Backend  :  %URL_BACKEND%
echo   - BD       :  MariaDB puerto 3306
echo.
echo   Puedes cerrar esta ventana. No cierres las
echo   ventanas "Backend Turismo" ni "Frontend
echo   Turismo": si las cierras, el sistema se apaga.
echo  ============================================
echo.
pause
exit /b 0

REM ============================================================
REM  SUBRUTINA: espera hasta que un puerto este en LISTENING
REM  uso:  call :wait_port <puerto> <etiqueta> <segundos_max>
REM ============================================================
:wait_port
set /a MAX=%~3
set /a PI=0

:espera_puerto
netstat -ano | findstr /R /C:":%~1 .*LISTENING" >nul 2>&1
if not errorlevel 1 exit /b 0
set /a PI+=1
if !PI! geq !MAX! exit /b 1
timeout /t 1 /nobreak >nul
goto espera_puerto