# studio-extension-marketplace

A public marketplace for Foxglove Studio extensions. Extensions here are available for install within
Foxglove Studio under the extension sidebar.

## Adding Your Extension

- Write your custom Foxglove Studio extension using our [fox](https://github.com/foxglove/fox) tool.
- Run `yarn package` in your extension to package it up into a .foxe file.
- Publish your .foxe file somewhere public. We recommend github releases alongside your code.
- Open a PR in this repo to update `extensions.json` and this `README`'s "Extensions" section with your extension information.
- Once we merge your PR, users will be able to discover your extension by browsing within Foxglove Studio.

## Extensions

- [Turtlesim](https://github.com/foxglove/studio-extension-turtlesim) – Interact with the ROS turtlesim node
