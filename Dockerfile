# This is the first stage. Here we install all the dependencies that we need in order to build the Ternoa binary.
FROM ubuntu:22.04 as builder

ADD . ./workdir
WORKDIR "/workdir"

# Update system and install initial dependencies.
RUN apt update -y && apt install git curl -y

# Install NVM (Node Version Manager)
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Refreshes the shell session so that it can see nvm. Instead of executing this command you should just close the reopen your terminal.
RUN . $HOME/.nvm/nvm.sh && \
    # This tell nvm to install node version 18.7.0 and tell it to use it too.
    nvm install 18.7.0 && nvm use 18 && \
    # Install Typescript.
    npm install -g typescript

# Add Node and Tsc to PATH. This can be ignored.
ENV PATH="${PATH}:/usr/bin/versions/node/v18.7.0/bin"

# This prints out the current node and typescript version.
RUN node -v && tsc -v

# This install all project dependencies and builds the project.
RUN cd ./examples/starter-project && npm i && tsc

# Expose workdir so that it can be manipulated outside the container
VOLUME ["/workdir"]

# Run the starter project on start up
CMD cd /workdir/examples/starter-project; tsc; node src/index.js