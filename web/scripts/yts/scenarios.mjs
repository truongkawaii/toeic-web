// Ten distinct editorial tracks; all organizations and situations are fictional.
export const TRACKS = [
 { name:'Mobility & community', org:'Alder Cycle Hub', city:'Westbridge', person:'Nina Patel', project:'a commuter bicycle service', item:'bicycles', venue:'Riverside Hall', job:'fleet coordinator', skill:'route planning', facility:'a repair workshop', benefit:'shorter journeys', product:'folding bicycles', feature:'adjustable handlebars', supplier:'Morrow Components', event:'Urban Travel Forum', course:'Route Design', base:60 },
 { name:'Publishing & hospitality', org:'Harborleaf Press', city:'Fairhaven', person:'Elias Moreno', project:'a regional visitor guide', item:'guidebooks', venue:'Harbor Gallery', job:'production editor', skill:'digital publishing', facility:'a printing studio', benefit:'clearer visitor information', product:'illustrated travel guides', feature:'water-resistant covers', supplier:'Kestrel Paperworks', event:'Independent Publishing Fair', course:'Editorial Planning', base:75 },
 { name:'Health & professional services', org:'Cedarwell Clinic', city:'Northmere', person:'Leila Haddad', project:'an evening consultation program', item:'screening kits', venue:'Civic Learning Center', job:'patient services coordinator', skill:'appointment scheduling', facility:'a rehabilitation room', benefit:'more convenient appointments', product:'portable monitoring kits', feature:'large digital displays', supplier:'Bluehaven Instruments', event:'Community Wellness Forum', course:'Patient Communication', base:90 },
 { name:'Technology & customer support', org:'Lumen Device Care', city:'Brookfield', person:'Daniel Cho', project:'a same-day repair service', item:'testing devices', venue:'Innovation Hall', job:'service technician', skill:'electronic diagnostics', facility:'a testing laboratory', benefit:'faster fault detection', product:'portable diagnostic units', feature:'rechargeable batteries', supplier:'Everline Electronics', event:'Repair Technology Expo', course:'Diagnostic Methods', base:105 },
 { name:'Recruitment & training', org:'Summit Talent Office', city:'Roseford', person:'Amara Okafor', project:'a graduate placement program', item:'training manuals', venue:'Learning Exchange', job:'training coordinator', skill:'interview coaching', facility:'a training suite', benefit:'better preparation for employment', product:'interview practice kits', feature:'reusable exercise cards', supplier:'Brightpath Learning', event:'Career Development Forum', course:'Interview Design', base:120 },
 { name:'Food & sustainable supply', org:'Orchard Table Catering', city:'Ashcombe', person:'Sofia Vega', project:'a low-waste catering program', item:'serving trays', venue:'Garden Pavilion', job:'purchasing coordinator', skill:'food safety management', facility:'a demonstration kitchen', benefit:'less food waste', product:'insulated serving boxes', feature:'removable inner trays', supplier:'Fieldstone Kitchenware', event:'Sustainable Dining Fair', course:'Menu Planning', base:135 },
 { name:'Retail & circular design', org:'Threadway Market', city:'Elmport', person:'Hana Sato', project:'a clothing alteration service', item:'fabric samples', venue:'Design Assembly Hall', job:'visual merchandising assistant', skill:'display planning', facility:'a textile repair studio', benefit:'longer product life', product:'modular garment racks', feature:'height-adjustable rails', supplier:'Willow Display Systems', event:'Circular Design Showcase', course:'Retail Presentation', base:150 },
 { name:'Research & information security', org:'Maplepoint Analytics', city:'Stonehaven', person:'Oliver Mensah', project:'a secure client reporting portal', item:'data terminals', venue:'Research Exchange', job:'data quality analyst', skill:'statistical reporting', facility:'a collaboration laboratory', benefit:'more reliable reports', product:'encrypted storage units', feature:'individual access controls', supplier:'Vantage Dataworks', event:'Applied Research Symposium', course:'Report Validation', base:165 },
 { name:'Arts & public events', org:'Beacon Arts Collective', city:'Clearwater', person:'Maya Laurent', project:'a neighborhood concert series', item:'audio receivers', venue:'Beacon Theater', job:'events production assistant', skill:'sound coordination', facility:'a rehearsal studio', benefit:'wider access to live performances', product:'wireless audio receivers', feature:'replaceable ear cushions', supplier:'Resonance Audio', event:'Community Arts Convention', course:'Event Production', base:180 },
 { name:'Construction & maintenance', org:'Stonebrook Site Services', city:'Meadowgate', person:'Jonas Berg', project:'a preventive maintenance program', item:'inspection tools', venue:'Builders Exchange', job:'maintenance planning assistant', skill:'site inspection', facility:'a materials testing center', benefit:'fewer emergency repairs', product:'inspection camera kits', feature:'flexible camera cables', supplier:'Granite Technical Supply', event:'Building Care Exhibition', course:'Maintenance Scheduling', base:195 },
];

// Independent single-passage situations. Each row: title, location/action,
// affected audience/item, contact/exception. They are not renamed ETS passages.
export const NOTICES = [
 ['Bicycle storage upgrade','the basement bicycle cage','bring bicycles to the courtyard racks','permit holders','large cargo bicycles','security desk'],
 ['Archive relocation','the local history archive','request documents through the online catalog','registered researchers','oversized maps','reference desk'],
 ['Clinic entrance repairs','the north entrance to the clinic','enter through the garden gate','patients and accompanying visitors','ambulance arrivals','reception desk'],
 ['Service counter relocation','the appliance service counter','take repairs to the second-floor workshop','customers bringing devices','commercial equipment','service manager'],
 ['Training center access','the training center lobby','use the side door on Birch Street','course participants','wheelchair users','course office'],
 ['Market loading area repairs','the market loading area','unload goods at the east service lane','stallholders and suppliers','refrigerated deliveries','market office'],
 ['Retail collection desk closure','the ground-floor pickup desk','collect online purchases at the third-floor desk','online shoppers','oversized furniture','customer service desk'],
 ['Research room maintenance','the data research room','reserve workstations in the annex','visiting analysts','restricted datasets','archive administrator'],
 ['Theater ticket office move','the theater ticket office','buy or collect tickets at the temporary booth','audience members','group bookings','box office supervisor'],
 ['Building inspection access','the west stairwell','reach upper floors using the east stairwell','building occupants','deliveries to the roof','facilities team'],
];

export const EMAILS = [
 ['garden irrigation controller','a cracked dial','a replacement dial','the control unit'],
 ['desk-mounted reading lamp','a faulty switch','a replacement switch','the lamp base'],
 ['portable document scanner','a damaged feed roller','a replacement roller','the scanner housing'],
 ['conference room speaker','a loose connector','a replacement connector','the speaker unit'],
 ['adjustable office chair','a broken wheel','a replacement wheel','the chair frame'],
 ['commercial soup warmer','a damaged thermostat','a replacement thermostat','the metal container'],
 ['electronic label printer','a defective power adapter','a replacement adapter','the printer'],
 ['wireless presentation remote','a damaged battery cover','a replacement cover','the remote control'],
 ['gallery display spotlight','a faulty mounting bracket','a replacement bracket','the spotlight'],
 ['folding workshop table','a bent support hinge','a replacement hinge','the tabletop'],
];

export const ARTICLES = [
 ['Dockside Tool Library','lend household repair tools','a former ticket office','residents who cannot afford equipment','a grant from local businesses'],
 ['Quayside Reading Room','provide quiet study space','an unused customs building','students preparing for professional exams','donations from bookshops'],
 ['Oak Lane Rehabilitation Center','offer supervised recovery sessions','a disused fitness studio','patients returning to work after injuries','a municipal health grant'],
 ['Copper Street Repair Lab','teach basic electronic repairs','a vacant computer shop','people wanting to extend device life','support from technology firms'],
 ['Hillcrest Career Studio','offer practice interviews','a former bank branch','first-time job applicants','funding from recruitment agencies'],
 ['Meadow Community Kitchen','teach affordable meal preparation','an old restaurant kitchen','families seeking to reduce food costs','a food cooperative grant'],
 ['Southbank Textile Exchange','organize clothing repair workshops','an empty clothing showroom','residents interested in reusing garments','contributions from local retailers'],
 ['Pine Square Data Library','provide public access to city statistics','a former records office','small businesses carrying out market research','a university partnership'],
 ['Lantern Rehearsal Rooms','provide low-cost rehearsal space','an unused broadcast studio','young musicians forming ensembles','donations from concert audiences'],
 ['Mill Road Materials Center','resell reusable building materials','a former storage depot','contractors looking for affordable supplies','investment from a builders association'],
];

export const CHAT_TASKS = [
 ['route maps','the starting point','the support vehicle','cyclists'],
 ['printed programs','the registration desk','the delivery van','conference delegates'],
 ['screening forms','the reception table','the mobile clinic','patients'],
 ['device manuals','the demonstration booth','the equipment case','visitors'],
 ['interview folders','the welcome counter','the training room','candidates'],
 ['menu cards','the dining room entrance','the catering van','guests'],
 ['sample labels','the display counter','the stockroom','buyers'],
 ['survey sheets','the workshop entrance','the analyst’s briefcase','participants'],
 ['song lists','the stage entrance','the rehearsal studio','performers'],
 ['inspection checklists','the site office','the safety cabinet','contractors'],
];

export const COURSES = [
 ['Digital Cartography','North','South','route planners'],
 ['Book Design','Layout','Editing','publishing assistants'],
 ['Health Administration','Intake','Records','clinic coordinators'],
 ['Electronic Diagnostics','Testing','Repair','service technicians'],
 ['Interview Coaching','Planning','Practice','recruiters'],
 ['Food Storage','Cold','Dry','kitchen supervisors'],
 ['Retail Display','Window','Floor','merchandisers'],
 ['Data Visualization','Charts','Dashboards','junior analysts'],
 ['Audio Production','Recording','Mixing','sound assistants'],
 ['Site Maintenance','Survey','Planning','facilities coordinators'],
];

export const ORDERS = [
 ['reusable courier pouches','shipping sleeves','Fernline Packaging'],
 ['hardcover notebooks','index tabs','Seabird Stationery'],
 ['washable staff jackets','name tags','Elm Medical Apparel'],
 ['precision tool sets','storage cases','Circuit Trade Supply'],
 ['training workbooks','assessment sheets','Peak Learning Print'],
 ['ceramic serving bowls','wooden utensils','Harvest Tableware'],
 ['display stands','price holders','Arc Retail Fixtures'],
 ['conference headsets','charging cradles','Nova Office Technology'],
 ['acoustic panels','wall brackets','Echo Space Systems'],
 ['portable work lights','extension cables','Forge Site Equipment'],
];

export const POLICY_ITEMS = ['workshop room','reference book','portable projector','diagnostic kit','training laptop','insulated food box','display rack','survey tablet','rehearsal room','inspection camera'];
