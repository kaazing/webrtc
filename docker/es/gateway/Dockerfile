FROM kaazing/development-enterprise-gateway:5.1.3-RC001

# Add gateway config
COPY conf/gateway-config.xml conf/gateway-config.xml
COPY conf/keystore.db conf/keystore.db
COPY conf/keystore-dsa.db conf/keystore-dsa.db
COPY conf/truststore.db conf/truststore.db
COPY conf/jaas-config.xml conf/jaas-config.xml


COPY webrtc/index.html web/webrtc/index.html
COPY webrtc/client.js web/webrtc/client.js

# Add broker specific client libs
ADD http://central.maven.org/maven2/org/apache/activemq/activemq-client/5.10.0/activemq-client-5.10.0.jar lib/ext/
ADD http://central.maven.org/maven2/org/apache/geronimo/specs/geronimo-jms_1.1_spec/1.1/geronimo-jms_1.1_spec-1.1.jar lib/ext/
ADD http://central.maven.org/maven2/org/apache/geronimo/specs/geronimo-j2ee-management_1.1_spec/1.0.1/geronimo-j2ee-management_1.1_spec-1.0.1.jar lib/ext/

CMD ["bin/gateway.start"]