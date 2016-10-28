FROM kaazing/development-enterprise-gateway:5.1.5

# Add gateway config
COPY conf/gateway-config.xml conf/gateway-config.xml
COPY conf/keystore.db conf/keystore.db
COPY conf/truststore.db conf/truststore.db
COPY conf/jaas-config.xml conf/jaas-config.xml

CMD ["bin/gateway.start"]
