

# Docker

```
docker build -t mediaflow:latest .
```

```
docker run -it -p 3030:3030 --name mediaflow mediaflow:latest
```

# Env Variables

| Name        | Description         |
|-------------|---------------------|
| PORT        | Http port.          |
| FFMPEG_PATH | Path to ffmpeg bin. |
