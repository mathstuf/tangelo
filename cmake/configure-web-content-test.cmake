file(READ ../testing/web-content-tests/${TEST_NAME}.js TEST_SUITE)
configure_file(../testing/phantomjs/web-content-test-scaffold.js.in tangelo/web/tests/web-content-tests/${TEST_NAME}.js @ONLY)
