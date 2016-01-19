#Flotilla Pre-Release

This pre-release preview of Flotilla contains the following:

* pre-compiled Flotilla Daemon
* Flotilla Dock Firmware

Don't use these files if you're not a competent user.

#Requirements

Flotilla Daemon requires the following libraries:

* libserialport. It is installed alongside the flotilla binary.
* various Visual Studio Runtime libraries. The MSI should prompt you to install those if necesarry.

Note that this pre-release is only tested on Windows 10 and you may experience issues getting the Flotilla dock recognized by other version of Windows automatically.

#Flotilla Firmware

The new Daemon and Flotilla Dock Firmware speak 115200baud serial instead of 9600, they both need updating together.

To update your Dock, you will need the dock firmware and some specialist tools such as dfu-programmer.
