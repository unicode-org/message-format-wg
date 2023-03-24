// © 2022 and later: Unicode, Inc. and others.
// License & terms of use: http://www.unicode.org/copyright.html

package com.ibm.icu.message2bm;

import java.util.Locale;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/**
 * Selectors using best match.
 * The examples are intentionally sorted the worst way possible to show that it works.
 */
@RunWith(JUnit4.class)
@SuppressWarnings("javadoc")
public class Mf2BestMatchTest {

    private Locale originalDefault = Locale.getDefault();

    @Before
    public void init() {
        originalDefault = Locale.getDefault();
        Locale.setDefault(Locale.US);
    }

    @After
    public void cleanup() {
        Locale.setDefault(originalDefault);
    }

    @Test
    public void testPluralSelection() {
        String message = "match {$count :plural}\n"
                + " when * {You have {$count} notifications.}\n"
                + " when one {You have {$count} notification.}\n" // never selected
                + " when 1 {You have exactly one notification.}\n"
                ;

        TestUtils.runTestCase(new TestCase.Builder()
                .pattern(message)
                .arguments(Args.of("count", 1))
                .expected("You have exactly one notification.")
                .build());
        TestUtils.runTestCase(new TestCase.Builder()
                .pattern(message)
                .arguments(Args.of("count", 42))
                .expected("You have 42 notifications.")
                .build());
    }

    @Test
    public void testSimpleOrdinalSelection() {
        String message = "match {$count :selectordinal}\n"
                + " when * {The {$count}th place}\n" // This would match 1 in first match
                + " when one {The {$count}st place}\n" // This would also match 1 in first match
                + " when two {The {$count}nd place}\n"
                + " when few {The {$count}rd place}\n"
                + " when 1 {Gold medal}\n" // Only this one matches 1 in best match
                + " when 2 {Silver medal}\n"
                + " when 3 {Bronze medal}\n"
                ;

        TestUtils.runTestCase(new TestCase.Builder()
                .pattern(message)
                .arguments(Args.of("count", 1))
                .expected("Gold medal")
                .build());
        TestUtils.runTestCase(new TestCase.Builder()
                .pattern(message)
                .arguments(Args.of("count", 2))
                .expected("Silver medal")
                .build());
        TestUtils.runTestCase(new TestCase.Builder()
                .pattern(message)
                .arguments(Args.of("count", 3))
                .expected("Bronze medal")
                .build());
        TestUtils.runTestCase(new TestCase.Builder()
                .pattern(message)
                .arguments(Args.of("count", 21))
                .expected("The 21st place")
                .build());
        TestUtils.runTestCase(new TestCase.Builder()
                .pattern(message)
                .arguments(Args.of("count", 22))
                .expected("The 22nd place")
                .build());
        TestUtils.runTestCase(new TestCase.Builder()
                .pattern(message)
                .arguments(Args.of("count", 23))
                .expected("The 23rd place")
                .build());
        TestUtils.runTestCase(new TestCase.Builder()
                .pattern(message)
                .arguments(Args.of("count", 27))
                .expected("The 27th place")
                .build());
    }

    @Test
    public void testComplexSelection() {
        String message = ""
                + "match {$photoCount :plural} {$userGender :select}\n"
                + " when * * {{$userName} added {$photoCount} photos to their album.}"
                + " when * masculine {{$userName} added {$photoCount} photos to his album.}\n"
                + " when * feminine {{$userName} added {$photoCount} photos to her album.}\n"
                + " when 1 * {{$userName} added a new photo to their album.}\n"
                + " when 1 masculine {{$userName} added a new photo to his album.}\n"
                + " when 1 feminine {{$userName} added a new photo to her album.}\n"
                ;

        TestUtils.runTestCase(new TestCase.Builder().pattern(message) // => 1 masculine
                .arguments(Args.of("photoCount", 1, "userGender", "masculine", "userName", "John"))
                .expected("John added a new photo to his album.")
                .build());
        TestUtils.runTestCase(new TestCase.Builder().pattern(message) // => 1 feminine
                .arguments(Args.of("photoCount", 1, "userGender", "feminine", "userName", "Anna"))
                .expected("Anna added a new photo to her album.")
                .build());
        TestUtils.runTestCase(new TestCase.Builder().pattern(message) // => 1 *
                .arguments(Args.of("photoCount", 1, "userGender", "unknown", "userName", "Anonymous"))
                .expected("Anonymous added a new photo to their album.")
                .build());

        TestUtils.runTestCase(new TestCase.Builder().pattern(message) // => * masculine
                .arguments(Args.of("photoCount", 13, "userGender", "masculine", "userName", "John"))
                .expected("John added 13 photos to his album.")
                .build());
        TestUtils.runTestCase(new TestCase.Builder().pattern(message) // => * feminine
                .arguments(Args.of("photoCount", 13, "userGender", "feminine", "userName", "Anna"))
                .expected("Anna added 13 photos to her album.")
                .build());
        TestUtils.runTestCase(new TestCase.Builder().pattern(message) // => * *
                .arguments(Args.of("photoCount", 13, "userGender", "unknown", "userName", "Anonymous"))
                .expected("Anonymous added 13 photos to their album.")
                .build());
    }
}
