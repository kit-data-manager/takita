FROM eclipse-temurin:21.0.10_7-jdk
EXPOSE 8080
ENTRYPOINT ["/takita/start.sh"]
RUN apt-get update && apt-get install -y --no-install-recommends libatomic1 && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /takita
WORKDIR /takita
COPY ./build.sh /takita/build.sh
COPY ./dockerstart.sh /takita/start.sh
COPY tuhl/ /takita/tuhl/
RUN chmod +x /takita/build.sh
RUN chmod +x /takita/start.sh
RUN /takita/build.sh
RUN chmod -R +x /takita/tuhl/build
RUN cp /takita/tuhl/build/libs/takita-2.0.0-SNAPSHOT.jar /takita/takita.jar
