FROM kaazing/enterprise-gateway

#Name and email of maintainer
MAINTAINER Zaharia Costin-Alexandru alexandru.zaharia@kaazing.com

#Copy all .xml files && certificat and keystore/trustore in the Dockerfile directory to /kaazing-gateway/conf/ in image
COPY *.xml /kaazing-gateway/conf/

#Set working directory
WORKDIR /kaazing-gateway

ENV PATH=$PATH:/kaazing-gateway/bin

CMD ["gateway.start"]
