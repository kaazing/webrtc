# Kaazing WebRTC Demo Application

This JavaScript application demonstrates setting up WebRTC with the Kaazing Gateway and Kaazing JavaScript SDK.

### Runing the Demo Application via Docker (Recommended)

This demo requires that you have Docker and Docker Compose installed. If this is your first time using Docker, follow the Docker Getting Started Guides:

  - [Mac](https://docs.docker.com/mac/)
  - [Linux](https://docs.docker.com/linux/)
  - [Windows](https://docs.docker.com/windows/)

This demo requires that the host name `kaazing.example.com` resolve to the Docker host machine. To enable this resolution, add an entry in your [hosts file](https://en.wikipedia.org/wiki/Hosts_(file)) for `kaazing.example.com` that points to your Docker host's IP address. For example, if you are using Docker Machine, you can get the IP address with this command: `docker-machine ip`. If you are using Kitematic, go to **Settings** then **Ports**. For other examples, see [10 Examples of how to get Docker Container IP Address](http://networkstatic.net/10-examples-of-how-to-get-docker-container-ip-address/).

0. Start the infrastructure by running `docker-compose up --build`

0. In one browser tab, navigate to [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/).  If this is your first time running the demo you will be prompted with a security exception. This exception appears because WebRTC requires clients run on a secure site and the demo certificate is not trusted by your browser.  Click through this dialogue (on Chrome click on the **Advanced** section).

0. Log in with the user **bob** and password **bob**.

0. Open a second tab at [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/) and log in with username **alice** and password **alice**.

0. From the **alice** tab, you can now call bob.
 
### Running on Your Local Environment

0. Install [Kaazing WebSocket Gateway - Enterprise Edition](http://kaazing.com/download/#ee-kwg).
0. In the Gateway directory, replace the folders **conf** and **web** with the folders of the same name provided in this repo's [gateway folder](https://github.com/kaazing/webrtc/tree/develop/gateway).
0. Add the following line to all the `/etc/hosts` file for all computers that will be accessing the Gateway: _`external_ip`_ `kaazing.example.com`.
0. Download and run a TURN server.  If you choose to use [coTURN](https://github.com/coturn/coturn/wiki/turnserver), start it with the following command

  ```
  coturn -n -a -v --use-auth-secret --realm=demo --static-auth-secret=kaazshared --rest-api-separator=:
  ```

0. In one browser tab, navigate to [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/).  If this is your first time running the demo, you will be prompted with a security exception.  This exception appears because WebRTC requires clients run on a secure site and the demo certificate is not trusted by your browser.  Click through this dialogue (on Chrome click on the **Advanced** section).
0. Log in with the user **bob** and password **bob**.
0. Open a second tab at [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/) and log in with username **alice** and password **alice**.
0. From the **alice** tab, you can now call bob.
 
For more information about how to deploy WebRTC with the Kaazing WebSocket Gateway, see [Deploy WebRTC using the Gateway](https://kaazing.com/doc/5.0/integration-webrtc/p_integrate_webrtc/index.html).
