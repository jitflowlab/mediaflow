FROM node:9.5.0

EXPOSE 3030

ADD docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ADD . /app/

RUN npm install -g forever && \
        cd /app && npm install

ENV VOLUME_PATH /app/

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
