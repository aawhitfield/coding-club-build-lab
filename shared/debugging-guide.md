# Debugging Guide

When something breaks, do not start over.

1. **Run it again.** What exactly happened?
2. **Name the difference.** What changed immediately before the problem?
3. **Read the message.** Look for a file name, line number, or missing ID.
4. **Undo one change.** Did the behavior return?
5. **Check spelling.** IDs, file names, and class names must match exactly.
6. **Ask a teammate.** Explain what you expected and what you observed.
7. **Ask AI narrowly.** Include the small relevant snippet, not the whole project.
8. **Record the fix.** Add the bug and repair to `TEAM-LOG.md`.

The most useful debugging sentence is:

> I expected ___, but I observed ___ after I changed ___
