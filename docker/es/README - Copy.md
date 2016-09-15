# TURN with Kaazing Gateway 

This tutorial contains a container with the Coturn server and a turn.rest authentication service for Kaazing.
Coturn and the Kaazing turn.rest service have the same shared key.

### Getting Started

To run this you must have Docker installed and have added a host file entry for `kaazing.example.com`, as described [here](../../README.md)

The [docker-compose.yml](docker-compose.yml) describes two containers it will run: the Gateway and the Coturn server.  These will be launched in the following configuration:

![turn architecture](../docker-turn.png)

The Gateway container will run a turn.rest service that allows clients to obtain authentication.  Clients will connect on a `http` address.  The [Gateway config file](gateway/coturn-auth-gateway-config.xml) is configured with a `turn` service as follows:

```xml
  <service>
    <name>turn.rest</name>
    <description>TURN Rest Service</description>
    <accept>http://${gateway.hostname}:${gateway.port}/turn.rest</accept>

    <type>turn.rest</type>
    <properties>
        <feature.turn.rest>true</feature.turn.rest>
        <generate.credentials>class:org.kaazing.gateway.service.turn.rest.DefaultCredentialsGeneratorImpl</generate.credentials>

        <options>
            <credentials.ttl>43200</credentials.ttl>
            <shared.key>logen</shared.key>
            <username.separator>:</username.separator>
        </options>
        <uris>
            <!-- these are only examples -->
            <uri>turn:coturn:3478?proto=udp</uri>
        </uris>
    </properties>
    
    <realm-name>demo</realm-name>    
    <!-- Restrict cross site constraints before running in production -->
    <authorization-constraint>
        <require-role>AUTHORIZED</require-role>
    </authorization-constraint>
    
    <cross-site-constraint>
      <allow-origin>*</allow-origin>
    </cross-site-constraint>
  </service>
```

### Run

1. Start the containers
  ```bash
  docker-compose up -d
  ```
  
2. Send an authenticated GET request to the turn.rest service in the gateway [http://kaazing.example.com:8000/turn.rest](http://kaazing.example.com:8000/turn.rest).  This will retrieve the authentication JSON

### Next Steps
  
The TURN proxy service will also be integrated here
