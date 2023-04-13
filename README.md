Log Utils
=========

Log Utils is a powerful library designed to help you manipulate log files with ease. This library is capable of cleaning log files, normalizing their format, and extracting valuable information from the logs.

Note that this library was originally developed to support Travis CI logs, and may not work as well with GitHub Actions logs.

Demo
----

Check out a demo of Log Utils in action at [https://durieux.me/log-utils](https://durieux.me/log-utils).

Documentation
-------------

For detailed documentation on how to use Log Utils, please visit [https://durieux.me/log-utils/doc](https://durieux.me/log-utils/doc).

Installation
------------

To install Log Utils, simply run the following command:

bash

```bash
npm i @tdurieux/log-utils
```

Usage
-----

Once you've installed Log Utils, you can start using it in your project by requiring it and calling its methods:

js

```js
const logUtil = require("@tdurieux/log-utils");

const data = logUtil.parseLog(logUtil.cleanLog(code));
```

Output Format
-------------

Log Utils returns data in a well-structured and organized format, making it easy to extract valuable information from your logs. Here's an example of the output format you can expect:

js

```js
{
  "tests": [
    {
      "failure_group": "Test",
      "logLine": 921,
      "name": "tests/test_securityaware.py",
      "body": "",
      "nbTest": 2,
      "nbFailure": 2,
      "nbError": 0,
      "nbSkipped": 0,
      "time": 0
    }
  ],
  "errors": [],
  "tool": null,
  "exitCode": 1,
  "reasons": [
    {
      "failure_group": "Test",
      "category": "test",
      "message": "tests/test_securityaware.py",
      "type": "Test failure",
      "logLine": 921
    }
  ],
  "commit": "bf66b5eaa6078dac0f375260db269eed77bb93b9"
}
```

We hope that this library will help you better understand and manipulate your log files. If you have any questions or feedback, please don't hesitate to reach out to us.%     