Calculator
==========
*Challenge: Write a simple, browser-based calculator.*

--------------

* Find visual assets from the web or create your own in order to make the look.

* The calculator should perform addition, subtraction, division, and multiplication operations and should support floating point numbers.
 
* The calculator should also be able to store a single floating point value in memory for later retrieval.  (Most calculators have a store-to-memory, retrieve-from-memory, and clear-memory buttons)
 
* Create the calculator in HTML and Javascript. The finished product should be functional in Chrome and Firefox without an internet connection. You may use a framework or library if you want. The core logic of the application however must be your own original work. 

###Development Setup
* Install [Vagrant]
* Install [VirtualBox]
* Run the following from a terminal:

```sh
git clone git@github.com:anthonygreco/calculator.git
cd calculator
vagrant up # this will take some time on the first run while it provisions the box; subsequent calls to vagrant up should take under a minute
```

* Open a browser and navigate to [http://localhost:8080]

###Open Public Libraries
* [jQuery]
* [Bootstrap]

###Optional
* Install the [EditorConfig Plugin] for your prefered editor

For Sublime Text, if you have [Package Control] installed, ***and you should***, simply do the following:
```javascript
Press: CMD + SHIFT + P // Brings up the Command Palette
Type: Install Package // Filters the list
Press: ENTER // Retrieves a list of available packages then the Command Palette will repopulate
Type: EditorConfig //Filters the list
Press: ENTER
Restart Sublime Text
```

[Vagrant]: http://vagrantup.org
[VirtualBox]: https://www.virtualbox.org/wiki/Downloads
[EditorConfig Plugin]: http://editorconfig.org/#download
[Package Control]: https://sublime.wbond.net/installation
[jQuery]: http://jquery.com/
[Bootstrap]: http://getbootstrap.com/
[http://localhost:8080]: http://localhost:8080
