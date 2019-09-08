# DevSig
DevSig observes relevant habits as you interact with your machine. These habits include
how often you type on Slack, how often you type on Jira, how often you have your cameras on when on a Zoom call.
The purpose of this is to better understand engineers' habits with the end goal of being able to recommend
habits that may lead to success.

To use DevSig, you install it globally on your machine, get it started, and proceed to use your machine as you'd normally
use it. DevSig keeps running in the background, observing relevant habits, and keeping a log of its observations
locally on your machine. **DevSig never sends any data to any party.**

You can generate reports of these recorded observations in order to have an idea of the habits you exhibit
as you work on your machine.

**Again, DevSig never sends any data to any party. All observations are logged locally.**

## Getting Started
- Install globally `npm install --global devsig`
- Run `devsig start` to get the service up and running.
- Continue using your machine as usual while the service runs.
- Run `devsig report` to generate a report from all the data the service has gathered thus far.

## Getting Help
- Run `devsig --help` to see all available commands. The `--help` flag also gives you info about each command. For instance, to find out more about the `devsig start` command, run `devsig start --help`.
- If you encounter any runtime error (like `Cannot find module 'iohook'`), stop the service, run `devsig fix`, restart the service.
- You can always contact the LearnTech team for more assistance.

## How DevSig Works

## Monitors
A monitor is a service that runs in the background and constantly monitors a particular user or system behavior.

- To see all monitors, run `devsig list`
- To start all monitors, run `devsig start`
- To start a particular monitor, run `devsig start {monitor}`
    - For instance, to run the Slack monitor, run `devsig start slack`

Most monitors keep a log of the activities they monitor.

You can exclude monitors in your config.

## Logs

## Reporters
