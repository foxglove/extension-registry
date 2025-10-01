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
- [Plotly](https://github.com/MetaverseIndustries/plotly-panel) - Render plotly.Plot JSON messages
- [Webcam](https://github.com/joshnewans/foxglove-webcam) - Republish webcam data into ROS
- [2D VEX Panel](https://github.com/Daniel-Alp/foxglove-vex-2d-panel) - Visualize 2D paths on a VEX field in real-time
- [Joint State Publisher](https://github.com/rogy-ken/foxglove-joint-state-publisher) - Publish joint state with slider UI.
- [Teleop Twist Keyboard](https://github.com/usedhondacivic/foxglove-teleop-twist-keyboard) - A foxglove version of the ROS teleop_twist_keyboard node, used to publish Twist messages based on keyboard control.
- [Orientation Panel 3D](https://github.com/peek-robotics/foxglove-orientation-panel-3d) - A simple 3D visualization of orientation from topics containing quaternions
- [String Panel](https://github.com/Ry0/foxglove-string-panel) - This extension displays the string data of std_msg/String or std_msg/msg/String on the panel.
- [Polygon ROS](https://github.com/fireflyautomatix/foxglove-polygon-ros) - Visualize complex polygons
- [Orientation Panel 2D](https://github.com/peek-robotics/foxglove-orientation-panel-2d) - A 2D visualization of orientation data from ROS messages with toggleable roll, pitch, and yaw displays
- [WrenchStamped Panel](https://github.com/Ry0/foxglove-wrench-stamped-panel) - This extension displays the string data of geometry_msgs/WrenchStamped.msg or geometry_msgs/msg/WrenchStamped.msg on the panel.
- [LogMessageViewer Panel](https://github.com/flypyka/foxglove-extensions) - Displays any foxglove.Log messages received during the entire displayed timeline.
- [MatricDecode](https://github.com/MaticianInc/MatricDecode) - Extremely fast h.264 decoder based on WebAssembly
- [Bar Display](https://github.com/laszloturanyi/foxglove-bar-display-extension) - Customizable bar display for scalar values with configurable min/max ranges, colors, orientations, and advanced fill behaviors
- [Behavior Tree](https://github.com/polymathrobotics/foxglove_extensions/tree/main/behavior-tree) - Visualization and information on Behavior Trees for robotics applications
- [Markdown](https://github.com/polymathrobotics/foxglove_extensions/tree/main/markdown) - Basic markdown renderer extension for documentation and notes
- [ROS2 Graph](https://github.com/polymathrobotics/foxglove_extensions/tree/main/ros2-graph) - Visualization and information on nodes, topics and other ROS2 Graph data (requires running [Graph Monitor](https://github.com/ros-tooling/graph-monitor))
