#Flotilla Pre-Release

This pre-release OSX version of Flotilla Rockpool contains the following:

* Rockpool + Flotilla daemon self-contained in an app bundle
* Flotilla dock firmware updater

#Requirements

This pre-release has been tested on OSX 10.9 (Maverick) through to 10.12 (Sierra). Official support for earlier versions of Mac OS is not on the card currently, sorry!

#Flotilla Firmware

The new daemon and Flotilla dock firmware speak 115200baud serial instead of 9600, they both need updating together.

To update your Dock, run the update_firmware script in the firmware folder and follow the instructions.

#Launching Flotilla/Rockpool

Once your dock firmware is up-to-date, and you have copied the Rockpool app from the disk image to your hard drive, simply double-click it. This will launch the Flotilla daemon and open the latest Rockpool web interface.
