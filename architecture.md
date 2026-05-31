# CornermanAI Architecture

## Purpose

CornermanAI is a match intelligence system.

It is not a tournament bracket.

It is not a scoring application.

It is not a statistics database.

Its primary purpose is to convert match events into coaching intelligence.

---

# Core Loop

Match
↓
Event Capture
↓
Match Log
↓
Report
↓
Pattern
↓
Recommendation
↓
Training Focus

---

# Folder Structure

## console/

Live match execution.

Responsibilities:

* score match
* capture events
* save match
* coach notes

Outputs:

* match payload

---

## reports/

Historical review.

Responsibilities:

* team reports
* athlete reports
* match summaries
* pattern summaries

Outputs:

* observations

---

## patterns/

Intelligence layer.

Responsibilities:

* recurring problems
* recurring successes
* recurring scoring trends
* recurring coaching notes

Outputs:

* identified patterns

---

## athletes/

Athlete-specific intelligence.

Responsibilities:

* athlete history
* athlete trends
* athlete strengths
* athlete weaknesses

Outputs:

* athlete profile

---

## events/

Tournament and team overview.

Responsibilities:

* roster view
* event summaries
* team performance

Outputs:

* event intelligence

---

## analytics/

System-wide metrics.

Responsibilities:

* scoring trends
* team trends
* historical comparisons

Outputs:

* measurements

---

# Data Flow

Console
↓
Saved Match
↓
Reports
↓
Patterns
↓
Recommendations

Never reverse this flow.

Reports do not write matches.

Patterns do not edit matches.

Analytics do not score matches.

Each layer has one responsibility.

---

# Long-Term Goal

CornermanAI should answer:

What happened?

Why did it happen?

What should we train next?

Everything else is secondary.

---

# Development Rule

New pages must belong to an existing layer.

If a page does not clearly fit:

Console
Reports
Patterns
Athletes
Events
Analytics

it probably should not be built.

Protect simplicity.

Protect flow.

Protect coaching value.
