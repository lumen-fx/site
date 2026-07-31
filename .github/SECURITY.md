# Security policy

## Supported versions

The deployed site is whatever `main` builds. That is the only supported
version; fixes land there.

## Reporting a vulnerability

Report privately through GitHub security advisories: open the Security tab of
this repository and use "Report a vulnerability". That opens a private thread
with the maintainers.

Do not open a public issue for a bug that is exploitable. Content injection on
a live page, a tampered `install.sh` or release manifest, and a build step that
pulls an unverified source all belong in a private report.

Include the page url or the file, and how to reproduce.
