package edu.kit.datamanager.takita;

/**
 * Exception to be thrown if an application property viable for startup or function of the application is missing
 */
public class MissingPropertyException extends RuntimeException {
    public MissingPropertyException(String propertyName) {
        super("The property '" + propertyName + "' is required and must be provided.");
    }
}