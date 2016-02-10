#Flotilla Pre-Release

This pre-release preview of Flotilla contains the following:

* Rockpool + Flotilla Daemon self-contained in an app bundle
* Flotilla Dock Firmware updater

Don't use these files if you're not an advanced Mac user.

#Requirements

Flotilla Daemon requires the following libraries.

libserialport
libboost_system1.50
libboost_date_time1.50
libboost_filesystem1.50
libboost_program_options1.50

Note that this pre-release has been tested on OSX 10.9 (Maverick) through to 10.11 (El Capitan). It may work on earlier version of Mac OS X such as 10.7 (Lion) and 10.8 (Mountain Lion) however, but currently untested - support for any earlier version of Mac OS is not on the card currently, sorry!

#Flotilla Firmware

The new Daemon and Flotilla Dock Firmware speak 115200baud serial instead of 9600, they both need updating together.

To update your Dock, run the update script in the firmware folder and follow the instructions.

#Launching Flotilla/Rockpool

Once your dock firmware is up-to-date, and you have copied the Rockpool app from the disk image to your hard drive, simply double-click it. This will launch the Flotilla daemon and open the brand spanking new Rockpool web interface for you to toy around with. Enjoy!