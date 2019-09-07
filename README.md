# DevSig
DevSig monitors relevant behavioral info from the host machine.  
To see a list of commands, run `devsig --help`

## Getting Started
- Install globally `npm install --global devsig`
- Run `devsig start` to get the service up and running
- Continue using your machine as usual while the service runs.
- Run `devsig report` to generate a report from all the data the service has gathered thus far

## Monitors
A monitor is a service that runs in the background and constantly monitors a particular user or system behavior.

- To see all monitors, run `devsig list`
- To start all monitors, run `devsig start`
- To start a particular monitor, run `devsig start {monitor}`
    - For instance, to run the Slack monitor, run `devsig start slack`

Most monitors keep a log of the activities they monitor.
