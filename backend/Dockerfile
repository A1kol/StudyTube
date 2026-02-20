# --- Этап сборки ---
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app

# 1. Кэшируем зависимости Maven
# Копируем ТОЛЬКО pom.xml. Если он не менялся, зависимости не будут качаться заново
COPY pom.xml .
RUN mvn dependency:go-offline

# 2. Копируем исходники и собираем
COPY src ./src
RUN mvn clean package -DskipTests

# --- Этап запуска ---
FROM eclipse-temurin:21-jre

# 1. Оптимизируем установку Python (слой будет закэширован)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# 2. Кэшируем установку библиотеки Python
RUN pip3 install --no-cache-dir youtube-transcript-api --break-system-packages

# 3. Копируем готовый JAR (этот слой меняется чаще всего)
COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]
