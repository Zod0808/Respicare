@echo off
REM Lanzador de setup-demo.ps1 que evita el error
REM "running scripts is disabled on this system" (politica de ejecucion
REM por defecto de Windows), sin tener que cambiar la configuracion del
REM sistema. Doble clic o: scripts\setup-demo.bat [-Reset] [-SkipSeed]
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-demo.ps1" %*
