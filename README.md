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

### Running in Your Local Environment

0. Clone or fork this repo. The location you cloned this repo to will be referred to as `REPO_HOME`.

0. Download and install [Kaazing WebSocket Gateway - Enterprise Edition](http://kaazing.com/download/#ee-kwg). The location you install the Gateway will be referred to as `GATEWAY_HOME`.

0. Copy the contents of `REPO_HOME\conf` into `GATEWAY_HOME\conf`, being sure to replace any files that already exist. These are the configuration files that will be used by the Gateway.

0. Copy the `REPO_HOME\webrtc` folder to `GATEWAY_HOME\web` such that `GATEWAY_HOME\web\webrtc` is a valid path. These are the application files that will run in a browser.

0. Next you need the client libraries. Download the [JavaScript client library](https://kaazing.com/download/#client-javascript). Extract `WebSocket.js` and `JmsClient.js`, and put them in `GATEWAY_HOME\web\webrtc`

0. Add the following line to all the `/etc/hosts` file for all computers that will be accessing the Gateway: _`external_ip`_ `kaazing.example.com`. For example:

  ```
  192.168.1.105 kaazing.example.com
  ```

0. Download and run a TURN server.  If you choose to use [coTURN](https://github.com/coturn/coturn/wiki/turnserver), start it with the following command:

  ```
  coturn -n -a -v --use-auth-secret --realm=demo --static-auth-secret=kaazshared --rest-api-separator=:
  ```

0. The Gateway will connect to the JMS using the hostname `broker`. Therefore add an entry in the `/etc/hosts` file on the machine where the Gateway is running:

  ```
  ?.?.?.? broker
  ```

  where `?.?.?.?` is the IP address of the coTURN server, e.g. `127.0.0.1` if it is the same machine.

0. The Gateway will connect to your coTURN server using the hostname `coturn`. Therefore add an entry in the `/etc/hosts` file on the machine where the Gateway is running:

  ```
  ?.?.?.? coturn
  ```

  where `?.?.?.?` is the IP address of the coTURN server.

0. Start the gateway. Currently WebRTC is an [early access](https://kaazing.com/doc/5.0/admin-reference/p_configure_gateway_opts/#enable-early-access-features) feature, so you'll need to see the appropriate access flags first.

  **Windows:**

  ```
  % set GATEWAY_OPTS=-Dfeature.turn.rest -Dfeature.turn.proxy
  % GATEWAY_HOME/bin/gateway.start --broker jms
  ```

  (Remember to replace `GATEWAY_HOME` with the path where you installed the Gateway.)

  **Linux**

  Since the gateway is using port 443, you'll need to use `sudo`:

  ```
  $ sudo GATEWAY_OPTS="-Dfeature.turn.rest -Dfeature.turn.proxy" GATEWAY_HOME/bin/gateway.start --broker jms
  ```

  (Remember to replace `GATEWAY_HOME` with the path where you installed the Gateway.)

0. In one browser tab, navigate to [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/).  If this is your first time running the demo, you will be prompted with a security exception.  This exception appears because WebRTC requires clients run on a secure site and the demo certificate is not trusted by your browser.  Click through this dialogue (on Chrome click on the **Advanced** section).

0. Log in with the user **bob** and password **bob**.

0. Open a second browser tab at [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/) and log in with username **alice** and password **alice**.

0. From the **alice** tab, you can now call bob.
