#Flotilla Pre-Release

This pre-release preview of Flotilla contains the following:

* Rockpool
* Flotilla Daemon
* Flotilla Dock Firmware

Don't use these files if you're not a competent linux user.

#Requirements

Flotilla Daemon requires the following libraries:

libserialport
libboost_system1.50
libboost_date_time1.50
libboost_filesystem1.50
libboost_program_options1.50

You can install them using the provided script, like so:

```
./install_dependencies
```

Note that this pre-release has been tested very summarily and only in Debian 8.3 - if it does not work on your system the most likely reason is that libserialport wasn't installed in an ad hoc directory for the daemon to pick up automatically.

#Flotilla Firmware

The new Daemon and Flotilla Dock Firmware speak 115200baud serial instead of 9600, they both need updating together.

To update your Dock, run ./update in the dock-firmware folder and follow the instructions.

#Launching Flotilla/Rockpool

Once your dock firmware is up-to-date, and you have ensured all dependencies have been met (see above), cd to this directory and:


```
./launch_flotilla
```

... this will stop any old flotilla daemon running on your machine and kick in the new version. It will then launch the brand spanking new Rockpool web interface for you to toy around with. Enjoy!