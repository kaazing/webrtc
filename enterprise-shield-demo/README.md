This is a work in progress

To make this work:

If running this on Windows or MacOS the following steps must be run first:
1) Make sure the docker-machine has at least an adapter in mode "bridged"
2) Find the IP of this adapter by running "ifconfig -all" within the docker-machine

On all machines, you need to do the following:
1) In /etc/hosts or C:\Windows\System32\drivers\etc\hosts, add gateway.kaazing.test and auth.kaazing.test to the external IP of the docker-machine (on linux the IP of your own machine)
2) Because we are using self signed certificates we need to do the following steps: 
    a) Using a browser go to "https://auth.kaazing.test:18032/turn.rest?service=turn" 
    b) Use credentials joe/welcome and make sure that your browser allows https connections to this website
    
Once this is done, go to:
https://gateway.kaazing.test in the web browser.
Use any of the following credentials to authenticate:
alice/alice
bob/bob
joe/welcome
