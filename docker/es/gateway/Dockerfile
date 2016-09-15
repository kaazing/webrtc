FROM kaazing/enterprise-gateway:latest

# Add gateway config
COPY conf/gateway-config.xml conf/gateway-config.xml
COPY conf/keystore.db conf/keystore.db
COPY conf/keystore-dsa.db conf/keystore-dsa.db
COPY conf/truststore.db conf/truststore.db
COPY conf/jaas-config.xml conf/jaas-config.xml

RUN mkdir -p lib/ext
COPY lib/ext/* lib/ext/


COPY webrtc/index.html web/webrtc/index.html
COPY webrtc/client.js web/webrtc/client.js

CMD ["bin/gateway.start"]