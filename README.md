# Kaazing WebRTC Demo Application

This application demonstrates setting up WebRTC with the Kaazing Gateway.

### Runing the application via Docker (Recommended approach)

This demo requires that you have Docker and Docker Compose installed.  If this is your first time using Docker follow the Docker Getting Started Guides:

  - [Mac](https://docs.docker.com/mac/)
  - [Linux](https://docs.docker.com/linux/)
  - [Windows](https://docs.docker.com/windows/)

This demo also require that the host name `kaazing.example.com` resolve to the Docker host machine. To enable this resolution, add an entry in your [hosts file](https://en.wikipedia.org/wiki/Hosts_(file)) for `kaazing.example.com` that points to your Docker host's IP address. For example, if you are using Docker Machine, you can get the IP address with this command: `docker-machine ip`. If you are using Kitematic, go to **Settings** then **Ports**. For other examples, see [10 Examples of how to get Docker Container IP Address](http://networkstatic.net/10-examples-of-how-to-get-docker-container-ip-address/).

Start the infrastructure by running `docker-compose up --build`

In one browser tab navigate to [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/).  If this is your first time running the demo you will be prompted with a security exception.  This is because WebRTC requires running on a secure site and the demo certificate is not trusted by your browser.  Click through this dialogue (on chrome click on the "Advanced" section)

Login with the user bob (password is also bob)

Open another tab at [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/) and login with alice (alice)

From the alice tab you can now call bob.
 
### Running on your local environment

Install kaazing enterprise gateway
Override the folders conf and web with the ones provided in the [gateway folder](https://github.com/kaazing/webrtc/tree/develop/gateway)
Add the following line to all the /etc/hosts from all the computers that will be accessing the gateway: <external_ip> kaazing.example.com

Download and run a turnserver.  If you choose to use Coturn start it with the following command

```
coturn -n -a -v --use-auth-secret --realm=demo --static-auth-secret=kaazshared --rest-api-separator=:
```

In one browser tab navigate to [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/).  If this is your first time running the demo you will be prompted with a security exception.  This is because WebRTC requires running on a secure site and the demo certificate is not trusted by your browser.  Click through this dialogue (on chrome click on the "Advanced" section)

Login with the user bob (password is also bob)

Open another tab at [https://kaazing.example.com/demo/](https://kaazing.example.com/demo/) and login with alice (alice)

From the alice tab you can now call bob.