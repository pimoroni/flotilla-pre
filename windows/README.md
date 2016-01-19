#Flotilla Pre-Release

This pre-release preview of Flotilla contains the following:

* pre-compiled Flotilla Daemon
* (optional) Rockpool offline support
* Flotilla Dock Firmware

Don't use these files if you're not a competent user.

#Requirements

Flotilla Daemon requires the following libraries:

* libserialport. It is installed alongside the flotilla binary.
* various Visual Studio Runtime libraries. The MSI should install those if necesarry.

Rockpool requires:

* a version of Python to serve the interface to the localhost. The MSI will install Python 2.7.9 if you opt to install the Rockpool interface... it's not particularly smart about it yet and may push it even if you have some version of Python installed - we're working on it.


Note that this pre-release has only been somewhat comprehensively tested on Windows 10 at this point and you may experience issues getting the Flotilla dock recognized by other version of Windows as a CDC peripheral automatically. Support for Windows 7 and 8 is planned - earlier versions of Windows are not on the card currently, sorry!

#Flotilla Firmware

The new Daemon and Flotilla Dock Firmware speak 115200baud serial instead of 9600, they both need updating together.

To update your Dock, you will need the dock firmware and some specialist tools such as dfu-programmer.
