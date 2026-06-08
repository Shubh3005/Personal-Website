# shubham.us — Portfolio + Live Agent

> Personal portfolio with a nightly GitHub Action that auto-updates project metrics from GitHub, Semantic Scholar, and Roboflow.

**Live at [shubham.us](https://shubham.us)**

---

## The Site

Five-page portfolio built with vanilla HTML/CSS/JS + Tailwind. Terminal aesthetic. Dark/light mode. Fully responsive.

Pages: Home · About · Projects · Skills · Contact

---

## Portfolio Live Agent

The interesting part. A Python script runs nightly via GitHub Actions (02:00 UTC) and updates `portfolio.json` with live data:

```
GitHub API     → repo stats, commit activity
Semantic Scholar → citation counts for AIES-26 paper  
Roboflow API   → FTC Analyzer model metrics (mAP, precision, recall)
```

The frontend reads `portfolio.json` on load and populates the "Currently Working On" section and stats automatically. No manual updates needed.

```bash
# Run the agent locally
export PORTFOLIO_GH_PAT=your_token
export ROBOFLOW_API_KEY=your_key
python scripts/agent.py
```

### GitHub Actions

```yaml
# .github/workflows/update-portfolio.yml
# Runs nightly at 02:00 UTC
# Requires: PORTFOLIO_GH_PAT, ROBOFLOW_API_KEY secrets
```

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML, CSS, Tailwind, Vanilla JS |
| Fonts | JetBrains Mono, Inter |
| Agent | Python, GitHub Actions |
| APIs | GitHub REST, Semantic Scholar, Roboflow |
| Deploy | GitHub Pages, custom domain (GoDaddy DNS) |
| Email | EmailJS |

---

## Local Development

```bash
git clone https://github.com/Shubh3005/Personal-Website
cd Personal-Website

# Serve locally
python -m http.server 8000
# Open localhost:8000
```

---

*Built by [Shubham Gupta](https://shubham.us) · Penn State CS, Schreyer Honors College*
