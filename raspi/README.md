#Flotilla Pre-Release

This pre-release preview of Flotilla contains the following:

* Rockpool
* Flotilla Daemon
* Flotilla Dock Firmware

Don't use these files if you're not a competent Pi user, and if you haven't already installed flotilla-offline.

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

Note that this pre-release has been tested against both Raspbian Wheezy and Jessie, but with emphasis on the later. If you run into any problem, make sure to:

```
sudo apt-get update
sudo apt-get upgrade
```

... to ensure your distribution is fully up-to-date.

#Flotilla Firmware

The new Daemon and Flotilla Dock Firmware speak 115200baud serial instead of 9600, they both need updating together.

To update your Dock, run ./update in the dock-firmware folder and follow the instructions.

