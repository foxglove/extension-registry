# Foxglove Studio extension marketplace

A public marketplace for [Foxglove Studio](https://github.com/foxglove/studio) extensions. Extensions here are available for install within
Foxglove Studio under the extension sidebar.

## Adding your extension to the marketplace

1. Write your custom Foxglove Studio extension, starting with our [create-foxglove-extension](https://github.com/foxglove/create-foxglove-extension) tool.
1. Run `yarn package` in your extension to package it up into a .foxe file.
1. Publish your .foxe file somewhere public. We recommend [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) alongside your code.
1. Open a PR in this repo to update `extensions.json` and this `README`'s "Extensions" section with your extension information.
1. Once we merge your PR, users will be able to discover your extension by browsing within Foxglove Studio.

# Extensions

- [Turtlesim](https://github.com/foxglove/studio-extension-turtlesim) – Interact with the ROS turtlesim node
- [MuSHR](https://github.com/mcdoerr/foxglove-mushr-extension) – Use custom buttons with the MuShr package
- [SidewaysTeleop](https://github.com/rscova/foxglove-sideways-teleop-extension) – Use an Xbox controller to control a robot
- [ROS2 Parameters](https://github.com/danclapp4/ros2-parameter-extension) - Interact with ROS2 Parameters
