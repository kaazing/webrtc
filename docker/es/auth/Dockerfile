FROM kaazing/development-gateways:latest

# Add gateway config
COPY conf/auth-gateway-config.xml conf/gateway-config.xml
COPY conf/keystore.db conf/keystore.db
COPY conf/keystore-dsa.db conf/keystore-dsa.db
COPY conf/truststore.db conf/truststore.db
COPY conf/jaas-config.xml conf/jaas-config.xml

COPY lib/* lib/


CMD ["bin/gateway.start"]