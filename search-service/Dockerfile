
# Etapa 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copiamos solo los archivos de dependencias primero
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiamos el resto del código
COPY . .

# Empaquetamos (salida: JAR en target/)
RUN mvn package -DskipTests

# Etapa 2: Run
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copiamos solo el jar generado de la etapa anterior
COPY --from=build /app/target/*.jar app.jar

EXPOSE 3004
ENTRYPOINT ["java", "-jar", "app.jar"]
