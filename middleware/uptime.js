// create service: https://certsimple.com/blog/deploy-node-on-linux#node-linux-service-systemd
// add .add and .subtract to devsig-client
// use this to increment how long the daemon was running
// in a cron job that runs every hour:
// client.period('day').add().send('devsig_uptime', 1)
// 1. implement the cloud function logic for this 2. implement the devsig logic for this 3. bring it together here

// deployment:
//     slack:
//         replicas: 4
//         scale:
//             minReqPerMin: 2
//             maxReqPerMin: 10
// services:
//     slack:
//         image: slack:3
//         command: --default-authentication-plugin=mysql_native_password
//         environment:
//             PORT: 3000
//         volumes:
//             ./:/user/app
//         ports:
//             - 3000
//         routes:
//             - /api/v1/slack
//             - /api/v2/slack