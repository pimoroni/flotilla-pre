# Self-contained firmware-version check

This directory contains a script to build a self-contained helper tool for firmware version check.

This directory contains a script to build a self-contained helper tool for firmware version check using PyInstaller.

It is designed for in-house testing and packaging and as such has little to no value for normal users. It requires Pyinstaller and assumes all dependencies for the flotilla Python API are met on the build system. 

* firmware-version.py is the python script used to build against (and the code that will be executed for version check)

* firmware-version is the binary resulting from the build process, and includes a self-contained Python environment including flotilla and pyserial modules pre-loaded.
