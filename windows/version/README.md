# Self-contained firmware-version check

This directory contains a python script to build a helper tool for firmware version check.

* firmware-version.py is the python script used to build against (and the code that will be executed)

* firmware-version.exe is the binary resulting from the build process, and includes a self-contained Python environment including flotilla and pyserial modules pre-loaded.
