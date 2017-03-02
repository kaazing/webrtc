# Kaazing WebRTC Demo Application

This JavaScript application demonstrates setting up WebRTC with the Kaazing Gateway and Kaazing JavaScript SDK.

For more information about how to deploy WebRTC with the Kaazing WebSocket Gateway, see [Deploy WebRTC using the Gateway](https://kaazing.com/doc/5.0/integration-webrtc/p_integrate_webrtc/index.html).

### Runing the Demo Application via Docker (Recommended)

This demo requires that you have Docker and Docker Compose installed. If this is your first time using Docker, follow the Docker Getting Started Guides:

  - [Mac](https://docs.docker.com/mac/)
  - [Linux](https://docs.docker.com/linux/)
  - [Windows](https://docs.docker.com/windows/)

This demo requires that the host name `kaazing.example.com` resolve to the Docker host machine. To enable this resolution, add an entry in your [hosts file](https://en.wikipedia.org/wiki/Hosts_(file)) for `kaazing.example.com` that points to your Docker host's IP address. For example, if you are using Docker Machine, you can get the IP address with this command: `docker-machine ip`. If you are using Kitematic, go to **Settings** then **Ports**. For other examples, see [10 Examples of how to get Docker Container IP Address](http://networkstatic.net/10-examples-of-how-to-get-docker-container-ip-address/).

0. Clone or fork this repo.

0. Start the infrastructure by running `docker-compose up --build`

0. In one browser tab, navigate to [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/).  If this is your first time running the demo you will be prompted with a security exception. This exception appears because WebRTC requires clients run on a secure site and the demo certificate is not trusted by your browser.  Click through this dialogue (on Chrome click on the **Advanced** section).

0. Log in with the user **bob** and password **bob**.

0. Open a second browser tab at [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/) and log in with username **alice** and password **alice**.

0. From the **alice** tab, you can now call bob.


##### Running Enterprise Shield (Optional)

You can setup the same configuration but this time using [Enterprise Shield](https://kaazing.com/product-enterprise-shield/) to protect your topology.

0.  Stop all docker containers from previous demo

0.  Run `docker-compose -f docker-compose-es.yml up --build`

### Running in Your Local Environment

0. Clone or fork this repo. The location you cloned this repo to will be referred to as `REPO_HOME`.

0. Download and install [Kaazing WebSocket Gateway - Enterprise Edition](http://kaazing.com/download/#ee-kwg). The location you install the Gateway will be referred to as `GATEWAY_HOME`.

0. Copy the contents of `REPO_HOME/gateway/conf` into `GATEWAY_HOME/conf`, being sure to replace any files that already exist. These are the configuration files that will be used by the Gateway.

0. Copy the `REPO_HOME/webrtc` folder to `GATEWAY_HOME/web` such that `GATEWAY_HOME/web/webrtc` is a valid path. These are the application files that will run in the browser.

0. Create a `lib` directory in `GATEWAY_HOME/web/webrtc`.

0. Next you need the client libraries. Download the [JavaScript client libraries](https://kaazing.com/download/#client-javascript). Extract the entire contents and of the zip file and put them in `GATEWAY_HOME/web/webrtc/lib`. Also include the following libraries in the same `GATEWAY_HOME/web/webrtc/lib` folder:
	- https://webrtc.github.io/adapter/adapter-2.0.4.js
	- https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
	- https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/4.4.0/bootbox.min.js
	- https://code.jquery.com/jquery-1.12.4.min.js

0. Copy from `GATEWAY_HOME\web\webrtc\gateway\webrtc` the two files `client.js` and `index.html` to `GATEWAY_HOME\web\webrtc`.

0. Change from the `gateway.config.xml` the webrtc.port property value. Set an unused port number. 

0. Download and run a TURN server.  If you choose to use [coTURN](https://github.com/coturn/coturn/wiki/turnserver), start it with the following command:

  ```
  turnserver -n -a -v --use-auth-secret --realm=demo --static-auth-secret=kaazshared --rest-api-separator=:
  ```

0. Edit the `/etc/hosts` file on the machine where the Gateway will run and add the following:

  ```
  a.b.c.d kaazing.example.com broker
  e.f.g.h coturn
  ```

  Replace `a.b.c.d` with the IP address of the Gateway host. The JMS broker will also run on this machine.

  Replace `e.f.g.h` with the IP address of the machine the TURN server is running on.

0. Edit the `/etc/hosts` file on any machines where you will run the WebRTC client application in a browser and add the following:

  ```
  a.b.c.d kaazing.example.com
  ```

  Replace `a.b.c.d` with the IP address of the Gateway host.

0. Start the gateway. Currently WebRTC is an [early access](https://kaazing.com/doc/5.0/admin-reference/p_configure_gateway_opts/#enable-early-access-features) feature, so you'll need to see the appropriate access flags first: `turn.rest` and `turn.proxy`.

  **Windows:**

  ```
  % cd GATEWAY_HOME
  % set GATEWAY_OPTS=-Dfeature.turn.rest -Dfeature.turn.proxy
  % bin/gateway.start --broker jms
  ```

  (Remember to replace `GATEWAY_HOME` with the path where you installed the Gateway.)

  **Linux**

  Since the gateway is using port 443, you'll need to use `sudo`:

  ```
  $ cd GATEWAY_HOME
  $ sudo GATEWAY_OPTS="-Dfeature.turn.rest -Dfeature.turn.proxy" bin/gateway.start --broker jms
  ```

  (Remember to replace `GATEWAY_HOME` with the path where you installed the Gateway.)

0. In one browser tab, navigate to [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/).  If this is your first time running the demo, you will be prompted with a security exception.  This exception appears because WebRTC requires clients run on a secure site and the demo certificate is not trusted by your browser.  Click through this dialogue (on Chrome click on the **Advanced** section).

0. Log in with the user **bob** and password **bob**.

0. Open a second browser tab at [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/) and log in with username **alice** and password **alice**.

0. From the **alice** tab, you can now call bob.

Additional notes:
- You can test the WebRTC feature without the need of a webcam. There are two ways to do it:
	- Install DroidCam App (https://www.dev47apps.com/) and after starting the demo in the browser, choose "Allow" access to the droidcam app fake camera
	- Start chrome browser via terminal with `google-chrome --use-fake-ui-for-media-stream --use-file-for-fake-video-capture=path/to/file.y4m` options. (download a y4m file from the web eg. https://media.xiph.org/video/derf/y4m/). The fake video will display instead of the expected video stream.


##### Running High Availability (Optional)

You can setup the same configuration in a high-availability configuration. High-availability is created at the DNS level. 

**Note:** This set-up can only be done from docker on a linux machine

0.  Stop all docker containers from previous demo

0.  Run `docker-compose -f docker-compose-ha.yml up --build`

0.  Set-up your network adapter to use as alternate DNS the IP address of the DNS container: 172.18.0.2

0.  Remove any mention to kaazing.example.com or any other "example.com" from the /etc/hosts file

0.  You may now connect to https://kaazing.example.com/demo which will be resolved via DNS to either one of the two containers.

Additional notes:

  - The BIND dns server has the webmin interface set-up. You can access it on 172.18.0.2:10000. The username is 'root' and the password is 'password'.
  - The BIND dns server has an additional DNS the server 172.30.201.2. If your network uses a different one, you may modify the file dns/data/bind/etc/named.conf with the proper IP.
     - To do this in most versions of Ubuntu, you need to do the following:
        0. Add the line ``nameserver 172.18.0.2`` in /etc/resolvconf/resolv.conf.d/head
        0. Run the command ``ifdown lo; ifup lo``
     - On other versions of Linux, if the /etc/resolv.conf is not dynamically generated, you can edit directly and then restart the interface.
  - The demo creates 2 gateways and 2 coturn servers but just one broker. Shutting down either of the gateways will nevertheless allow access to the website, but the browser will have to be refreshed.
