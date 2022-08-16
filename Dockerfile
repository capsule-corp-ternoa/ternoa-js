# This is the first stage. Here we install all the dependencies that we need in order to build the Ternoa binary.
FROM ubuntu:22.04 as builder

ADD . ./ternoa-js
WORKDIR "/ternoa-js"

# Update system and install initial dependencies.
RUN apt update -y && apt upgrade -y && apt install git curl -y

# Install NVM (Node Version Manager)
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && \
    # Refreshes the shell session so that it can see nvm. Instead of executing this command you should just close the reopen your terminal.
    . $HOME/.nvm/nvm.sh && \
    # This tell nvm to install node version 18.7.0 and tell it to use it too.
    nvm install 18.7.0 && nvm use 18 && \
    # Install Typescript.
    npm install -g typescript && \
    # This prints out the current node and typescript version.
    node -v && tsc -v && \
    # CD to the example project.
    cd ./examples/starter-project && \
    # This install all project dependencies.
    npm i && \
    # This builds the example project.
    tsc

# Container data will be stored inside virtual folder /data.
VOLUME ["/data"]

# Run the starter project on start up
ENTRYPOINT ["/usr/bin/versions/node/v18.7.0/bin/node"]
CMD ["/ternoa-js/examples/starter-project/src/index.js"] 