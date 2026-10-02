# The app

The app combines a ward bed register, nursing observation form and room cleaning record.

There are 20 made-up beds: three available, 12 occupied, three waiting for or undergoing cleaning, and two on hold. Day-case beds are listed separately. The clock starts October 1, 2026 at 10 a.m. New York time and resets when you reload.

Select a bed to see its made-up patient ID, pain score, milestone count, and note. Edit the note and press **Ask Jev (uses your API)** to ask Jev about it. The app does not save your edits or change the bed's status or time.

**Check server setup** checks whether the running server has `TYPESAFE_API_KEY`. It does not reveal the key or prove that TypeSafe accepts it. If configured, leave the password field blank. Otherwise, enter a key for this tab. Reloading clears a pasted key.

## Run your own copy

Use the [Docker setup](Container-Setup.md) to run your own copy.

## What I checked

See [what was tested](Verification.md) and [the Jev results](Evaluation-Results.md) for the recorded software checks. These checks do not establish clinical accuracy.
