FROM node:9.5.0

EXPOSE 3030

# FFMPEG
ADD http://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz /ffmpeg.static.tar.xz
RUN mkdir ffmpeg-static \
        && tar xfv /ffmpeg.static.tar.xz -C ffmpeg-static/ \
        && mv ffmpeg-static/ffmpeg-*-64bit-static/ffmpeg /usr/bin/ffmpeg \
        && mv ffmpeg-static/ffmpeg-*-64bit-static/ffprobe /usr/bin/ffprobe \
        && rm -r ffmpeg-static /ffmpeg.static.tar.xz

# Entrypoint
ADD docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ADD . /app/

RUN npm install -g forever && \
        cd /app && npm install

ENV VOLUME_PATH /app/

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
