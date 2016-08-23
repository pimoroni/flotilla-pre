The Flotilla Dock firmware update is performed using dfu-programmer; dfu-programmer is a multi-platform command-line programmer for Atmel chips with a USB bootloader supporting ISP.

To perform the firmware update you MUST ensure that Windows allows the dock to be in DFU mode during the process. In practical term this means that the device needs to be recognonised and an ad hoc driver exists in the local driver store. To do so:

1) navigate to the <dfu-prog-usb> directory located herein
2) right-click the <atmel_usb_dfu.inf> file and choose 'Install'
3) when prompted to install the driver, go ahead

You should thereafter be able to attach your dock and the device in DFU mode to be recognised.

Run the <update.bat> executable script and follow the on-screen instructions to perform the firmware update. The firmware should then be written to the device, but if you see a message to the extend that dfu-programmer found no device then it probably means you weren't quick enough to catch the dock in DFU mode - just try again!

You can verify the version of the firmware on your dock after the upgrade by comparing the version output by the batch script and the value stated in the <flotilla-dock.txt> file.

Note: dfu-programmer is released under the GNU General Public License version 2.0 (GPLv2): http://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
The program sources can be downloaded from: https://github.com/dfu-programmer/dfu-programmer
