# dump/Dockerfile
FROM alpine:3.19

# Устанавливаем MongoDB tools
RUN apk add --no-cache mongodb-tools bash curl

# Создаём рабочую директорию
WORKDIR /app

# Копируем скрипт
COPY dump.sh /app/dump.sh

# Делаем скрипт исполняемым
RUN chmod +x /app/dump.sh

# Запускаем скрипт
CMD ["/app/dump.sh"]