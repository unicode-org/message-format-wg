// © 2022 and later: Unicode, Inc. and others.
// License & terms of use: http://www.unicode.org/copyright.html

package com.ibm.icu.message2bm;

import java.util.Locale;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/**
 * Selectors using best match.
 * The examples are intentionally sorted the worst way possible to show that it works.
 */
@RunWith(JUnit4.class)
@SuppressWarnings("javadoc")
public class Mf2ParserBugTest {

    @Test
    public void testBadMessageEnd() {
        String message = "{Hello world!";

        Assert.assertThrows("pattern must end with }", IllegalArgumentException.class, () -> {
            MessageFormatter.builder()
                    .setPattern(message)
                    .setLocale(Locale.US)
                    .build();
        });
    }
}
