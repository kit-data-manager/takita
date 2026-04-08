# ---------- BUILD STAGE ----------
FROM eclipse-temurin:21-jdk AS build

WORKDIR /build

# System dependency (only for build)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libatomic1 && \
    rm -rf /var/lib/apt/lists/*

# Copy project
COPY frontend/ frontend/
COPY backend/ backend/
COPY build.sh build.sh

RUN chmod +x build.sh && ./build.sh

# ---------- RUNTIME STAGE ----------
FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache curl

WORKDIR /takita

EXPOSE 8080

COPY dockerstart.sh /takita/start.sh
RUN chmod +x /takita/start.sh

# Copy ONLY the built artifact
COPY --from=build /build/backend/build/libs/*.jar /takita/takita.jar

ENTRYPOINT ["/takita/start.sh"]
