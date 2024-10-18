package edu.kit.datamanager.takita;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class TestUtils {

    /**
     * Util function for timestamp equivalence check
     * returns false in case of time zone discrepancy, even if compared timestamps are equivalent (16:00 UTC and 18:00+02:00)
     * This check seems appropriate due to WADM recommendation: The datetime MUST be a xsd:dateTime with the UTC timezone expressed as "Z".
     * @param stamp1 timestamp
     * @param stamp2 timestamp
     * @return True if both timestamps are equivalent and in the same timezone
     */
    public static Boolean compareTimestamps(String stamp1, String stamp2) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            ZonedDateTime zdt1 = ZonedDateTime.parse(stamp1, formatter);
            ZonedDateTime zdt2 = ZonedDateTime.parse(stamp2, formatter);
            return zdt1.equals(zdt2);
        } catch (DateTimeParseException e) {
            System.out.println("Invalid date format: " + e.getMessage());
            return false;
        }
    }

    public static String readStringFromRelativePath(String relativePath) throws IOException {
        return Files.readString(Path.of("src/test/resources/" + relativePath));
    }
}
