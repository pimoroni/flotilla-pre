#Flotilla Pre-Release

This pre-release preview of Flotilla contains the following:

* Rockpool + Flotilla Daemon self-contained in an app bundle
* Flotilla Dock Firmware updater

Don't use these files if you're not a competent user.

#Requirements

Flotilla Daemon requires the following libraries.

libserialport
libboost_system1.50
libboost_date_time1.50*
libboost_filesystem1.50
libboost_program_options1.50

Note that this pre-release is only tested on Mac OS X 10.11 and you may have to rebuild those libraries from source to get things working on another version of Mac OS

#Flotilla Firmware

The new Daemon and Flotilla Dock Firmware speak 115200baud serial instead of 9600, they both need updating together.

To update your Dock, run ./update in the dock-firmware folder and follow the instructions.
