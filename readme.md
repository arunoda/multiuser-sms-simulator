Multiuser SMS Simulator
=======================

This is an Multiuser SMS Simulator built for kodeincloud (with appzone).
But can be extended to USSD and other messaging purposes

Goals
-----

* Anybody canbe used without hassale registration
* User will asks for use the Simulator via API and Simulator gives access for it
* Then App can send SMS to it while interacting with the User Inteface
* In Order to use that there are two conponents. Named `API Server` and the `Simulator Server`

API Server
----------
As name implies, API server look after,

* Setup and configure apps via API
* And supports Socket.io and UI Access

### Configure
API Server runs on the `first port` you specified when invoking the `start.js`

### Setup App API

url: http://hostname:port
path: /setup
params: url (url of the application)

#### returns
{appId:'The AppId', password: 'the password', url: 'url of your app'}

eg:-

	curl http://localhost:4050/setup -d "url=http://localhost:54"
	//returns
	{"appId":"640ce65af0bcf665c434cd3e869e757c","password":"169fa88dfcd41685a01bcbfa52c1899c","url":"http://localhost:54"}

### UI

Your application can access the UI via

	http://hostname:port/view/appId
Eg:-
	http://localhost:4050/view/640ce65af0bcf665c434cd3e869e757c

Simulator
---------
This works as an full featured Appzone.lk compatible SMS server.
It runs on the port you passed as the `second` parameter when invoking the `start.js`

### SMS Simulator

Appzone Compatible API can be found on following.

	http://hostname:port/sms
