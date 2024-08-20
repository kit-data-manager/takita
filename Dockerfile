FROM eclipse-temurin:17.0.12_7-jdk
EXPOSE 8080
ENTRYPOINT ["/takita/start.sh"]
RUN mkdir -p /takita
WORKDIR /takita
COPY ./build.sh /takita/build.sh
COPY ./dockerstart.sh /takita/start.sh
COPY tuhl/ /takita/tuhl/
RUN chmod +x /takita/build.sh
RUN chmod +x /takita/start.sh
RUN /takita/build.sh
RUN chmod -R +x /takita/tuhl/build
RUN cp /takita/tuhl/build/libs/tuhl-1.0.0-SNAPSHOT.jar /takita/tuhl.jar
