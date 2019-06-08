FROM node:latest
RUN mkdir -p /home/node
WORKDIR /home/node
COPY . /home/node
RUN npm install
ENTRYPOINT ["npm", "run"]
CMD ["start"]