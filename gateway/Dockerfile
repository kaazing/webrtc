FROM kaazing/enterprise-gateway:5.2.1

# Add broker specific client libs
ADD http://central.maven.org/maven2/org/apache/activemq/activemq-client/5.10.0/activemq-client-5.10.0.jar lib/ext/
ADD http://central.maven.org/maven2/org/apache/geronimo/specs/geronimo-jms_1.1_spec/1.1/geronimo-jms_1.1_spec-1.1.jar lib/ext/
ADD http://central.maven.org/maven2/org/apache/geronimo/specs/geronimo-j2ee-management_1.1_spec/1.0.1/geronimo-j2ee-management_1.1_spec-1.0.1.jar lib/ext/
ADD http://central.maven.org/maven2/org/fusesource/hawtbuf/hawtbuf/1.11/hawtbuf-1.11.jar lib/ext/



# Add gateway config
COPY conf/gateway-config.xml conf/gateway-config.xml
COPY conf/gateway-config-es.xml conf/gateway-config-es.xml
COPY conf/gateway-config-ha.xml conf/gateway-config-ha.xml
COPY conf/keystore.db conf/keystore.db
COPY conf/truststore.db conf/truststore.db
COPY conf/jaas-config.xml conf/jaas-config.xml

# TODO Place ext files

COPY webrtc/index.html web/webrtc/index.html
COPY webrtc/client.js web/webrtc/client.js

#Pull libs urls at build time instead of runtime
ADD https://webrtc.github.io/adapter/adapter-2.0.4.js /kaazing-gateway/web/webrtc/lib/
ADD https://code.jquery.com/jquery-1.12.4.min.js /kaazing-gateway/web/webrtc/lib/
ADD https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js /kaazing-gateway/web/webrtc/lib/
ADD https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/4.4.0/bootbox.min.js /kaazing-gateway/web/webrtc/lib/


#ADD https://cdn.kaazing.com/releases/enterprise.javascript.client/4.1.0/kaazing-enterprise-javascript-client-4.1.0.zip web/webrtc/
RUN wget https://cdn.kaazing.com/releases/enterprise.javascript.client/4.1.0/kaazing-enterprise-javascript-client-4.1.0.zip && \
    unzip -q kaazing-enterprise-javascript-client-4.1.0.zip && \
    rm kaazing-enterprise-javascript-client-4.1.0.zip && \
    mv kaazing-enterprise-javascript-client-4.1.0/* /kaazing-gateway/web/webrtc/lib/

CMD ["bin/gateway.start"]
