package edu.kit.datamanager.takita.model;

import java.time.LocalDate;
import java.time.YearMonth;

import java.util.regex.Pattern;
import java.util.regex.Matcher;

public record PartialDate(int year, Integer month, Integer day) implements Comparable<PartialDate> {

    public PartialDate {
        if (month == null && day != null) {
            throw new IllegalArgumentException("Month may not be null if day is given");
        }

        if (month != null && (month < 1 || month > 12)) {
            throw new IllegalArgumentException("Month must be between 1 and 12");
        }

        if (day != null) {
            int max = YearMonth.of(year, month).lengthOfMonth();
            if (day < 1 || day > max) throw new IllegalArgumentException("Invalid day for month/year");
        }
    }

    public LocalDate toFirstLocalDate() {
        int m = (month() == null) ? 1 : month();
        int d = (day() == null) ? 1 : day();
        return LocalDate.of(year(), m, d);
    }

    public LocalDate toLastLocalDate() {
        int m = (month() == null) ? 12 : month();
        int d = (day() == null) ? YearMonth.of(year(), m).lengthOfMonth() : day();
        return LocalDate.of(year(), m, d);
    }

    public static PartialDate parse(String s) {

        if (s == null || s.isEmpty()) throw new IllegalArgumentException("Unable to parse empty string into date");

        final Pattern PATTERN = Pattern.compile("^([+-]?\\d{4,})(?:-(\\d{2})(?:-(\\d{2}))?)?$");
        Matcher m = PATTERN.matcher(s);

        if (!m.matches()) throw new IllegalArgumentException("Unsupported date string: " + s);

        int year = Integer.parseInt(m.group(1));

        Integer month = null;
        Integer day = null;

        if (m.group(2) != null) {
            month = Integer.parseInt(m.group(2));
        }

        if (m.group(3) != null) {
            day = Integer.parseInt(m.group(3));
        }

        return new PartialDate(year, month, day);
    }

    /**
     * Compares this object with the specified object for order.  Returns a
     * negative integer, zero, or a positive integer as this object is less
     * than, equal to, or greater than the specified object.
     *
     * <p>The implementor must ensure {@link Integer#signum
     * signum}{@code (x.compareTo(y)) == -signum(y.compareTo(x))} for
     * all {@code x} and {@code y}.  (This implies that {@code
     * x.compareTo(y)} must throw an exception if and only if {@code
     * y.compareTo(x)} throws an exception.)
     *
     * <p>The implementor must also ensure that the relation is transitive:
     * {@code (x.compareTo(y) > 0 && y.compareTo(z) > 0)} implies
     * {@code x.compareTo(z) > 0}.
     *
     * <p>Finally, the implementor must ensure that {@code
     * x.compareTo(y)==0} implies that {@code signum(x.compareTo(z))
     * == signum(y.compareTo(z))}, for all {@code z}.
     *
     * @param o the object to be compared.
     * @return a negative integer, zero, or a positive integer as this object
     * is less than, equal to, or greater than the specified object.
     * @throws NullPointerException if the specified object is null
     * @throws ClassCastException   if the specified object's type prevents it
     *                              from being compared to this object.
     * @apiNote It is strongly recommended, but <i>not</i> strictly required that
     * {@code (x.compareTo(y)==0) == (x.equals(y))}.  Generally speaking, any
     * class that implements the {@code Comparable} interface and violates
     * this condition should clearly indicate this fact.  The recommended
     * language is "Note: this class has a natural ordering that is
     * inconsistent with equals."
     */
    @Override
    public int compareTo(PartialDate o) {
        int cmp = this.toFirstLocalDate().compareTo(o.toFirstLocalDate());
        return cmp;
    }
}
