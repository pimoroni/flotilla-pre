# Self-contained firmware-version check

This directory contains a python script to build a helper tool for firmware version check.

<<<<<<< HEAD
* firmware-version.py is the python script used to build against (and the code that will be executed)

* firmware-version.exe is the binary resulting from the build process, and includes a self-contained Python environment including flotilla and pyserial modules pre-loaded.
=======
It requires Pyinstaller and assumes all dependencies for the flotilla Python API are met on the build system.

* firmware-version.py is the python script used to build against (and the code that will be executed)

* firmware-version.exe is the binary resulting from the build process, and includes a self-contained Python environment including flotilla and pyserial modules pre-loaded.

Note: firmware-version.exe included herein was built on Windows 7 64-bit and therefore will not work on 32-bit systems.
>>>>>>> pimoroni/master
