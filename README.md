# national-archives
Static site + Netlify function that fetches and displays a random National Archives record in an accessible card layout.

## See Demo
* https://mikehiggins.me.uk/posts/national-archives-lucky-dip 

## National Archives Lucky-Dip

A single-page site that surfaces a random digitised record from **The National Archives Discovery** catalogue.

### What it does
* Picks a random search term from a preset word list.  
* Calls the Discovery **search** endpoint to get up to 300 digitised records for that term.  
* Retrieves full details for each candidate until it finds one that contains extra context (`contextArea`, `scopeContent`, or `places`).  
* Renders a card with title, description, dates, reference, holding institution and—when present—an expandable “More details” section.

<img width="1103" alt="national-archives" src="https://github.com/user-attachments/assets/edcd237d-7a61-447e-a7ef-f15767369729" />

### Why a Netlify Function?
Discovery’s API does **not** send CORS headers, so browsers cannot call it directly.  
The `/.netlify/functions/random` serverless function acts as a small proxy:

1. Runs server-side; no CORS restriction.  
2. Combines the **search** and **details** calls, returning only the fields the front-end needs.  
3. Filters out records that lack useful context, so the UI always shows the “More details” toggle when available.

Because the function is bundled with the deploy, the site remains a static build while still accessing the API reliably.
