FROM openjdk:17-bullseye

EXPOSE 8080
RUN apt-get update && apt-get upgrade --assume-yes

RUN mkdir -p /takita
WORKDIR /takita

ADD build.sh /takita/build.sh
ADD dockerstart.sh /takita/start.sh
ADD tuhl/ /takita/tuhl/

RUN chmod +x /takita/build.sh
RUN chmod +x /takita/start.sh
RUN /takita/build.sh

RUN chmod -R +x /takita/tuhl/build

RUN ["cp", "/takita/tuhl/build/libs/tuhl-0.0.3-SNAPSHOT.jar", "/takita/tuhl-0.0.3-SNAPSHOT.jar"]

ENTRYPOINT ["/takita/start.sh"]
#ENTRYPOINT ["java", "-jar", "/takita/tuhl-0.0.2-SNAPSHOT.jar"]
#CMD ["buildDevIndex"]
