package edu.kit.datamanager.takita.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PartialDateTest {

    @Test
    void testParsePartialDates() {
        PartialDate date;
        date = PartialDate.parse("-0031-12");

        assertEquals(-31, date.year());

        date = PartialDate.parse("2024");
        date = PartialDate.parse("2024-12");
        date = PartialDate.parse("2024-12-31");

        assertEquals(2024, date.year());

        assertThrows(IllegalArgumentException.class, () -> {
            PartialDate.parse("2024-02-31");
        });

        assertThrows(IllegalArgumentException.class, () -> {
            PartialDate.parse("2024-31-01");
        });
    }

    @Test
    void testComparePartialDates() {
        PartialDate date1;
        PartialDate date2;

        date1 = PartialDate.parse("2024");
        date2 = PartialDate.parse("2025-01");

        assert(date1.compareTo(date2) < 0);
    }
}