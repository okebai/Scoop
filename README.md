# Scoop [![Build status - Dev](https://ci.appveyor.com/api/projects/status/eb5ey1vp5ldaoybp/branch/dev?svg=true)](https://ci.appveyor.com/project/okebai/scoop/branch/dev)
> **skuːp**

1. _To pick up (someone or something) in a swift, fluid movement._
2. _A piece of news published by a newspaper or broadcast by a television or radio station in advance of its rivals._

## What is it?
Scoop is a tool for monitoring various machine properties and funneling that data back to a centralized dashboard for display. It currently only runs on Windows machines.

The project is divided into two logical parts; **server** and **client**.

## Server
A copy of the server is installed in each environment that you wish to monitor. 

The server is composed of a few things:
#### SignalR Host
SignalR provides the means for real-time two-way communication between the server and any connected clients.

By default, it runs a self-hosted HTTP server listening on port 60080.

#### Background Tasks
The server collects data via a set of _Tasks_ that runs in the background on the server.
These background tasks run on a schedule specific to each task and reports data back to the clients via SignalR.

An explanation of what tasks are available is on the TODO list.

## Client
The data gathered by the server is just that, data. To be able to make use of it, we need to process it and display it in some way.

This is what the client does.
For now it's main duties are connection handling and data display.

## Installation

#### Server
Download the latest release and install it on a Windows machine you wish to monitor.
This will result in the following:

- A service named "Scoop Service" will be installed. This service controls wether the server is running or not. It is set to autostart and is started as soon as the installation completes.

- Port 60080 is opened in Windows Firewall. This is the only port the service communicates through.

The server will also try to update itself automatically if a new release is detected.

#### Client
_Coming soon_

## Why?
This project aims to satisfy 2 things:

1. A need for effective, simple-yet-customizable, real-time server monitoring software
2. My personal craving for better knowledge of the technologies and/or environments that this type of software comes in contact with

## Caveats
This is still a very experimental project and under early development.
It is **not** intended to be used in any production scenarios.
