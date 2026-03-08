# --- Этап сборки (Build) ---
# Используем alpine-версию maven для экономии места
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# 1. Кешируем зависимости (самый долгий этап)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 2. Сборка JAR
COPY src ./src
RUN mvn clean package -DskipTests

# --- Этап запуска (Runtime) ---
# Используем максимально легкий JRE на базе Alpine (~160MB против ~400MB у обычного)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Копируем только готовый файл из первого этапа
COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]