/* netlify/functions/random.js */

   import fetch from 'node-fetch'; 

   const API_SEARCH  = 'https://discovery.nationalarchives.gov.uk/API/search/records';
   const API_DETAILS = id =>
     `https://discovery.nationalarchives.gov.uk/API/records/v1/details/${id}`;
   const API_VIEW    = id =>
     `https://discovery.nationalarchives.gov.uk/details/r/${id}`;
   
   const clean = v =>
     typeof v === 'string'
       ? v.trim()
       : Array.isArray(v)
       ? v.map(clean).join(' ').trim()
       : '';
   
   const WORDS = `abbey armour apprenticeship artillery
   balloon barracks beacon beekeeping blitz blueprint
   cabinet cavalry census charters cholera chronometer coal
   docks diplomacy dragoons dreyfus duel dyes
   embassy enclosure espionage estuary exchequer expedition
   factory famine federation folklore foundry franchise
   galleon gaol gargoyle gild guild gunpowder
   haberdashery hansom heraldry herring highwaymen horticulture
   imports indenture influenza inquisition ironclad irrigation
   joust jubilee jurisdiction keel kirkyard knighthood
   lancers ledger leviathan lighthouses linen lithograph livery luddite
   magistrate manifesto manufactory mariner militia mint monorail munitions muster
   navvy needlework newspaper nonconformist numismatics
   oakum ordnance orphans outfitter papermill parish pike pilchard
   pilgrimage plantation plague ploughwork postmaster pottery privy
   propaganda provost quarantine quarterdeck quarry quinine quorum
   radar ration rebellion regency registry reformation reformatories
   regiment revenue rivet sabotage salvation schooner semaphore
   serfdom shipyard silk slum smock society spire stagecoach
   stevedore suffrage surveyor tariff telegram tenement tithe
   trawler treason turnpike umbrage undercroft union workhouse
   vaccination valour vestry viceroy victualling vineyard viking
   wagon warden warrant watchmaker weavers whaling wharf widows
   windmill workbench writ yeomanry zeppelin`
     .trim()
     .split(/\s+/);
   
   const rnd     = arr => arr[Math.floor(Math.random() * arr.length)];
   const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
   
   async function fetchJSON(url, qs = {}) {
     const u = new URL(url);
     Object.entries(qs).forEach(([k, v]) => u.searchParams.set(k, v));
     const r = await fetch(u, { headers: { Accept: 'application/json' } });
     if (!r.ok) throw new Error(`${u.pathname} ${r.status}`);
     return r.json();
   }
   
   async function getRandomRecord(maxAttempts = 20) {
     for (let i = 0; i < maxAttempts; i++) {
       const word  = rnd(WORDS);
       const hits  = shuffle(
         (await fetchJSON(API_SEARCH, { query: word, digitised: 'true', pageSize: 300 }))
           .records ?? []
       );
   
       for (const rec of hits) {
         const id = rec.id;
         if (!id) continue;
   
         let details;
         try {
           details = await fetchJSON(API_DETAILS(id));
         } catch {
           continue;
         }
   
         const context = clean(details.contextArea);
         const note    = clean(details.scopeContent);
         const places  = Array.isArray(details.places)
           ? details.places.map(p => p.name || '').join(', ').trim()
           : clean(details.places);
   
         if (!(context || note || places)) continue;
   
         return {
           query:       word,
           title:       details.title       || rec.title,
           description: details.description || rec.description || '',
           heldBy:      (details.heldBy || rec.heldBy || []).join(', '),
           reference:   details.reference   || rec.reference  || '',
           startDate:   details.startDate   || '',
           endDate:     details.endDate     || '',
           context,
           note,
           places,
           url:         API_VIEW(id),
         };
       }
     }
     throw new Error('No suitable online record found');
   }
   
   /* -------------- Netlify handler ---------- */
   export const handler = async () => {
     try {
       const record = await getRandomRecord();
   
       return {
         statusCode: 200,
         headers: {
           'Content-Type': 'application/json',
           'Access-Control-Allow-Origin': '*',
         },
         body: JSON.stringify(record),
       };
     } catch (err) {
       console.error('[random.js]', err);
       return { statusCode: 500, body: String(err) };
     }
   };
   