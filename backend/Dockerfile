# Этап сборки (тут всё оставляем как есть)
FROM maven:3.9.4-eclipse-temurin-21 AS build
COPY . .
RUN mvn clean package -DskipTests

# Этап запуска
FROM eclipse-temurin:21-jre

# 1. Устанавливаем Python и pip
# Мы используем apt-get, так как temurin базируется на Ubuntu/Debian
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# 2. Устанавливаем саму библиотеку
# Флаг --break-system-packages нужен в новых версиях Python в Debian/Ubuntu
RUN pip3 install --no-cache-dir youtube-transcript-api --break-system-packages

# 3. Копируем наш JAR
COPY --from=build /target/*.jar app.jar

# Запускаем
ENTRYPOINT ["java", "-jar", "/app.jar"]