# sys-monitor

A system resource/performance monitor for the terminal built in node.js

## Installation instructions

In order to get this application to work, follow the following steps;

* Clone this repository.
    * `git clone https://github.com/mace015/sys-monitor`
* From within the project directory, install all the dependencies via NPM.
    * `cd sys-monitor` (if you haven't done this already)
    * `npm install`
* Run the application.
    * `node main.js`

## Roadmap

* Improve the network monitor, this is still a bit awkward...
* List all the active processes the computer is running + their resource usage.
* Improve application architecture.

If you feel like tinkering, pull requests are welcome!

## Credits

Credits where credits are due, to these amazing packages:

* [yaronn/blessed-contrib](https://github.com/yaronn/blessed-contrib) (used to render the interface)
* [sebhildebrandt/systeminformation](https://github.com/sebhildebrandt/systeminformation) (used to fetch system information)