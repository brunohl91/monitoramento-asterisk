# monitoramento-asterisk

**Monitor Extensions and Queues with HTTP and Websockets.**

This module was designed to monitor Asterisk Extensions and Queues with HTTP and Webosckets over AMI

## Usage

Clone repository
```
git clone https://github.com/brunohl91/monitoramento-asterisk.git
cd monitoramento-asterisk
npm install
```

## Edit Configs
### config/ami.js
```
exports.ami = {
  user: 'youruser', 
  secret: 'yousersecret', 
  addr: 'yourserver', 
  port: '5038',
}
```
* Don't forget to enable on asterisk /etc/manager.conf
```
[youruser]
secret = yoursecret
permit=external_ip/255.255.255.0
permit=127.0.0.1/255.255.255.0
read = all,system,call,log,verbose,command,agent,user,config,command,dtmf,reporting,cdr,dialplan,originate
write = all,system,call,log,verbose,command,agent,user,config,command,dtmf,reporting,cdr,dialplan,originate
writetimeout = 5000
```
### config/db.js
Chang this file according to your DB/Configuration to get info from queues and extensions

## Start
```
node app.js
```

The server will listen on port 3050 for both HTTP and Websocket requests and send JSON.

### Thanks to
The guys that made https://github.com/pipobscure/NodeJS-AsteriskManager

## License

[MIT](LICENSE.md)