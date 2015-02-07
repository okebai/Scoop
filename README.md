[![Build status - Master](https://ci.appveyor.com/api/projects/status/eb5ey1vp5ldaoybp/branch/master?svg=true)](https://ci.appveyor.com/project/okebai/scoop/branch/master)
[![Build status - Dev](https://ci.appveyor.com/api/projects/status/eb5ey1vp5ldaoybp/branch/dev?svg=true)](https://ci.appveyor.com/project/okebai/scoop/branch/dev)

# Scoop
> **skuːp**
1. _To pick up (someone or something) in a swift, fluid movement._
2. _A piece of news published by a newspaper or broadcast by a television or radio station in advance of its rivals._

## What is it?
Scoop is a tool for monitoring and relaying various server properties and funneling that data back to a centralized dashboard accessible from the web.

## How does it work?
There are 2 main components; the **server** and the **web client**.

### Server
A copy of the server is deployed in each environment that you wish to monitor. It contains a bunch of different automated _Tasks_ which constantly monitor different parts of the environment.
Also included in the server component is a SignalR host, which is responsible for relaying the data collected from the different _Tasks_ to any connected clients.

### Web client
The Web clients main responsibility is assisting visitor with connecting to any servers and presenting the data sent by the servers.
The Web client is built upon MVC.

## Setup
_Coming soon._

## Why?
This project aims to satisfy 2 things:
1. A need for effective, simple-yet-customizable, real-time server monitoring software
2. A craving for better knowledge of the technologies and environments that this type of software can make good use of

## Caveats
This is still a very experimental project and still under early development.
It is, in it's current form, **not** intended to be used in any production scenarios.
