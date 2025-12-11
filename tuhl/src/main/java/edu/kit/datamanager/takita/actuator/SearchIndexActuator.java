package edu.kit.datamanager.takita.actuator;


import edu.kit.datamanager.takita.mainpage.search.SearchIndexService;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.WriteOperation;
import org.springframework.boot.actuate.endpoint.web.annotation.WebEndpoint;
import org.springframework.stereotype.Component;

@Component
@WebEndpoint(id = "searchIndex")
public class SearchIndexActuator {

    SearchIndexService service;

    public SearchIndexActuator(SearchIndexService service) {
        this.service = service;
    }

    @WriteOperation
    public ActuatorResponse trigger(String operation) {
        // Validate & fire async
        if (operation == null || !(operation.equalsIgnoreCase("update") || operation.equalsIgnoreCase("rebuild"))) {
            return ActuatorResponse.error("Invalid operation. Use 'update' or 'rebuild'.");
        }
        // Kick off in background
        new Thread(() -> {
            try {
                if (operation.equalsIgnoreCase("update")) {
                    service.updateIndex();
                } else {
                    service.buildIndex();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                // log
            }
        }, "actuator-index-trigger").start();

        return ActuatorResponse.accepted("Triggered " + operation);
    }

    public static class ActuatorResponse {
        private boolean ok;
        private String message;
        public static ActuatorResponse accepted(String msg){ ActuatorResponse r=new ActuatorResponse(); r.ok=true; r.message=msg; return r;}
        public static ActuatorResponse error(String msg){ ActuatorResponse r=new ActuatorResponse(); r.ok=false; r.message=msg; return r;}
        public boolean isOk(){return ok;}
        public String getMessage(){return message;}
    }
}
