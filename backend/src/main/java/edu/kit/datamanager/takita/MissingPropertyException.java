package edu.kit.datamanager.takita;

public class MissingPropertyException extends RuntimeException {
    public MissingPropertyException(String propertyName) {
        super("The property '" + propertyName + "' is required and must be provided.");
    }
}