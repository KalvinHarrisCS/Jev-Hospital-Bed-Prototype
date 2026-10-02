# Try it quickly

I want someone to be able to open this and try a few cases without writing a note from scratch.

Start Docker Desktop. In the unzipped project folder, run:

```sh
docker compose -f container/compose.yaml up --build
```

Open [the local app](http://localhost:8787). Keep that terminal open.

## Try the notes without a key

1. Press **Try a nurse note** at the top of the page.
2. Keep `MAT-01` selected. Choose a **Practice note**: Improving, Needs review, or Unclear.
3. Press **Show expected answer (no API)**. It shows a written example answer, clearly marked **SAMPLE ONLY**. No model runs.
4. Try the other two cases. Editing a note clears its old answer, so a result cannot quietly follow a changed note.

| Case | Expected category | What to look for |
|---|---|---|
| Improving | `improving` | Walking and meals are explicitly better than yesterday |
| Needs review | `needs_review` | Pain blocks walking; reassessment and departure are pending |
| Unclear | `unclear` | The note does not state a recovery trend |

## Compare with Jev

If your server has a key, leave the password field blank. Otherwise, expand **Connect Jev with your key (optional)** and enter your own TypeSafe key. Press **Ask Jev (uses your API)**. Only this button calls TypeSafe; its account charges may apply.

Compare the category with the expected answer. The app shows request time and the exact submitted note. For `unclear`, it asks for more detail about what changed in pain, walking or meals and whether reassessment is pending. That is feedback on the note, not a grade for the nurse. Probability and confidence are model outputs, not clinical certainty.

## Time room cleaning

Press **Time room cleaning**. Select `MAT-05`, `GYN-05`, or `GYN-09`, which are already in turnaround in this fictional snapshot. Press **Start cleaning**, then **Finish cleaning**. The log records start, finish, elapsed minutes, and an average with the sample count.

Reload while a timer is running to check that it resumes. Timings stay in this browser on this app's origin; a different browser, device, or port has a separate log. If saving is blocked, the page says so. No patient information is stored with these timings.

Finishing means **awaiting staff release**. It does not make a bed available. This first timer measures start-to-finish elapsed time, including interruptions. It does not yet record the wait for a cleaner or a release timestamp. See the [cleaning research](../wiki/Cleaning-Research.md).

See [the actual Jev checks](../testing/EVALUATION.md), [key setup](ENVIRONMENT-SETUP.md), and [what was tested](../testing/VERIFICATION.md).
