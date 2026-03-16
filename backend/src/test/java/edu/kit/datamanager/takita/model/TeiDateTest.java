package edu.kit.datamanager.takita.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TeiDateTest {

    @Test
    void getWhenDate() {
        TeiDate teiDate = new TeiDate();
        PartialDate pDate = PartialDate.parse("-0031-12-12");
        teiDate.setWhen(pDate);

        assertEquals("-0031-12-12", teiDate.getWhenDate().toString());
    }

    @Test
    void getNotBeforeDate() {
        TeiDate teiDate = new TeiDate();
        PartialDate pDate = PartialDate.parse("-0031-12");
        teiDate.setNotBefore(pDate);

        assertEquals("-0031-12-01", teiDate.getNotBeforeDate().toString());
    }

    @Test
    void getNotAfterDate() {
        TeiDate teiDate = new TeiDate();
        PartialDate pDate = PartialDate.parse("-0031-11");
        teiDate.setNotAfter(pDate);

        assertEquals("-0031-11-30", teiDate.getNotAfterDate().toString());
    }

    @Test
    void getFromDate() {
        TeiDate teiDate = new TeiDate();
        PartialDate pDate = PartialDate.parse("-0031-12");
        teiDate.setFrom(pDate);

        assertEquals("-0031-12-01", teiDate.getFromDate().toString());
    }

    @Test
    void getToDate() {
        TeiDate teiDate = new TeiDate();
        PartialDate pDate = PartialDate.parse("-0031-11");
        teiDate.setTo(pDate);

        assertEquals("-0031-11-30", teiDate.getToDate().toString());
    }

    @Test
    void testToString() {
    }
}