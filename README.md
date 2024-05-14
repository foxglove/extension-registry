# Foxglove extension registry

A public registry for [Foxglove extensions](https://docs.foxglove.dev/docs/visualization/extensions/introduction/). Extensions here are available for install within
Foxglove under the extension settings.

## Adding your extension to the registry

1. Write your custom Foxglove extension, starting with our [create-foxglove-extension](https://github.com/foxglove/create-foxglove-extension) tool.
1. Run `yarn package` in your extension to package it up into a .foxe file.
1. Publish your .foxe file somewhere public. We recommend [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) alongside your code.
1. Open a PR in this repo to update `extensions.json` and this `README`'s "Extensions" section with your extension information.
1. Once we merge your PR, users will be able to discover your extension by browsing within Foxglove.

# Extensions

- [Blank Panel](https://github.com/foxglove/blank-panel-extension) – Add a little space to your layout
- [MuSHR](https://github.com/mcdoerr/foxglove-mushr-extension) – Use custom buttons with the MuShr package
- [SidewaysTeleop](https://github.com/rscova/foxglove-sideways-teleop-extension) – Use an Xbox controller to control a robot
- [ROS2 Parameters](https://github.com/danclapp4/ros2-parameter-extension) - Interact with ROS2 Parameters
- [Virtual Joystick](https://github.com/yulong88888/foxglove-nipple) - Easier to use twist topic publisher
- [H264 Video Playback](https://github.com/codewithpassion/foxglove-studio-h264-extension) - Experimental H264 video playback
- [2D orientation](https://github.com/CourchesneA/foxglove-orientation-panel) - Visualize 2D orientation from ROS imu or quaternion messages
- [Battery level indicator](https://github.com/Lynxdrone/foxglove-battery-extension) - Compact battery level indicator
- [Joystick/gamepad control](https://github.com/joshnewans/foxglove-joystick) - Receive/monitor/generate joystick and gamepad controls
- [Autoware msgs](https://github.com/kminoda/AutowareFoxgloveConverter) - Load Autoware related msgs
- [Plotly](https://github.com/MetaverseIndustries/plotly-panel) - Render plotly.Plot JSON messages
- [Webcam](https://github.com/joshnewans/foxglove-webcam) - Republish webcam data into ROS
