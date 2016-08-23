echo OFF
echo.
firmware-version.exe
echo.
echo Unplug your dock and then re-insert it again...
echo.
pause
dfu-programmer.exe atxmega32a4u erase
dfu-programmer.exe atxmega32a4u flash flotilla-dock.hex
echo.
echo Unplug your dock and then re-insert it again...
timeout 10 > NUL
echo.
firmware-version.exe
echo.
pause
