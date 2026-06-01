# Cornerman Product Boundaries

## Purpose

Protect the separation between Core, Intelligence, and Sandman Bridge.

The goal is to allow:

* Cornerman Core to exist as a standalone product.
* Intelligence to remain optional and protected.
* Sandman to consume both without duplication.

---

# Core

Owns:

* Tournament Builder
* Tournament Roster
* Console
* Video Capture
* Match Stats
* Match History

Rule:

Core records reality.

Core does not recommend, analyze, interpret, or award progression.

Question answered:

"What happened?"

---

# Intelligence

Owns:

* Recon
* Reports
* Pattern Engine
* Practice Recommendations
* Opponent Trends
* Athlete Trends
* Coaching Intelligence

Rule:

Intelligence interprets reality.

Intelligence consumes match data and produces insights.

Question answered:

"What does it mean?"

Execution Spine:

Recon
↓
Reports
↓
Patterns
↓
Recommendations

Questions:

Recon
→ What do I see?

Reports
→ What happened?

Patterns
→ What keeps happening?

Recommendations
→ What should I do next?

---

# Sandman Bridge

Owns:

* Weekend Clipboard
* XP
* Athlete Profiles
* Placement Awards
* Progression
* Testing
* Identity

Rule:

Sandman develops athletes.

Sandman Bridge transports competition data into Sandman.

Sandman Bridge may consume Core data and Intelligence data.

Question answered:

"How does this affect athlete development?"

---

# Match Engine

The Match Engine is the shared source of truth.

Match Engine owns:

* Events
* Tournament Rosters
* Matches
* Stats
* Video References

The Match Engine remains neutral.

It does not award XP.

It does not generate recommendations.

It only stores reality.

---

# Video Doctrine

Videos are stored externally.

Preferred provider:

* YouTube

Cornerman stores:

* videoUrl
* videoTitle (optional)
* videoId (optional)

Cornerman does not store raw video files long-term.

Flow:

Console
↓
Video Capture
↓
YouTube
↓
videoUrl
↓
Match History

---

# Product Views

## Cornerman Core

Tournament Builder
↓
Tournament Roster
↓
Console
↓
Video
↓
Match Stats
↓
Match History

---

## Cornerman Plus

Core
+
Recon
+
Reports
+
Pattern Engine
+
Advanced Intelligence

---

## Sandman

Weekend Clipboard
↓
Tournament Builder
↓
Tournament Roster
↓
Console
↓
Match Stats
↓
XP
↓
Athlete Development

---

# Rule

Capture.
Interpret.
Develop.

Never combine all three layers into one page.
