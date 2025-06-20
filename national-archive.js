/* national-archive.js */

   const $ = id => document.getElementById(id);
   const setLoading = on => $('loading').classList.toggle('active', on);
   
   function formatDate(start, end) {
     if (!start) return '';
     if (start === end) return start;
     return `${start.slice(-4)} – ${end.slice(-4)}`;
   }
   
   async function roll() {
     setLoading(true);
     try {
       /* ── fetch a record from the Netlify function ───────── */
       const res = await fetch('/.netlify/functions/random');
       if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
       const d = await res.json();
   
       /* ── populate core fields ───────────────────────────── */
       $('word').textContent   = d.query;
       $('title').textContent  = d.title       || 'Untitled';
       $('heldBy').textContent = d.heldBy      || 'Unknown';
       $('desc').textContent   = d.description || '';
       $('link').href =
       $('link').textContent   = d.url;
       $('ref').textContent    = d.reference   || '—';
       $('dates').textContent  = formatDate(d.startDate, d.endDate) || '—';
   
       /* ── extra / contextual fields ─────────────────────── */
       const contextText = (d.context ?? '').trim();
       const noteText    = (d.note    ?? '').trim();
       const placesText  = (d.places  ?? '').trim();
   
       $('ctx').textContent   = contextText;
       $('note').textContent  = noteText;
       $('place').textContent = placesText;
   
       /* ── “More details” toggle visibility ───────────────── */
       const hasExtra = contextText || noteText || placesText;
       const btn = $('toggleExtra');
       btn.hidden       = !hasExtra;
       $('extra').hidden = true;
       btn.textContent  = 'More details ▾';
     } catch (err) {
       console.error(err);
       $('title').textContent = '⚠️ Error fetching record';
     } finally {
       setLoading(false);
     }
   }
   
   /* ── UI bindings ───────────────────────────────────────── */
   $('roll').onclick = roll;
   
   $('toggleExtra').onclick = () => {
     const extra = $('extra');
     extra.hidden = !extra.hidden;
     $('toggleExtra').textContent = extra.hidden
       ? 'More details ▾'
       : 'Hide details ▴';
   };
   
   /* first load */
   roll();
   