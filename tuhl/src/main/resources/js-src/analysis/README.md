# `metaphor-analyses` Application

This repository contains a rewrite of the annotool-prototype based on these premises:

* **modularized, loose coupling:** we expect to replace part of the functionality in here with existing components from the KIT software stack
* **well tested:** self-explanatory
* **consistent coding style, linted:** concerning naming conventions, structuring, indentation and just overall syntax
* **modern, yet compatible code base:** use ES6, let babel/webpack deal with compatibility
* **use established, OS libraries:** no reason to reinvent the wheel

It also utilizes `react` instead of `vue.js`. Both are mainstays of the JS ecosystem and reasonable choices for the task at hand. I am personally more familiar with react, and the prototype has used vue only half-heartedly anyway.