import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const POT = 6077500;
const PAYOUTS = { R64:60775, R32:75969, S16:151938, E8:182325, F4:136744, CHAMP:425425 };
const ROUND_ORDER = ["R64","R32","S16","E8","F4","CHAMP"];
const ROUND_ODDS_KEY = { R64:"rd32", R32:"sweet16", S16:"e8", E8:"f4", F4:"finals", CHAMP:"champ" };
const ROUND_LABEL = { R64:"Round of 64", R32:"Round of 32", S16:"Sweet 16", E8:"Elite 8", F4:"Final Four", CHAMP:"Championship" };

// ─── BASE ODDS ────────────────────────────────────────────────────────────────
const BASE_ODDS = {
  DUK:{ rd32:0.98765,sweet16:0.84485,e8:0.65777,f4:0.50559,finals:0.32734,champ:0.19089 },
  SIE:{ rd32:0.01235,sweet16:0.00074,e8:0.00003,f4:0,      finals:0,      champ:0       },
  OSU:{ rd32:0.64172,sweet16:0.11337,e8:0.05335,f4:0.02439,finals:0.00815,champ:0.00237 },
  TCU:{ rd32:0.35828,sweet16:0.04104,e8:0.01439,f4:0.00477,finals:0.00110,champ:0.00024 },
  STJ:{ rd32:0.82540,sweet16:0.50669,e8:0.16580,f4:0.09463,finals:0.04037,champ:0.01490 },
  NIA:{ rd32:0.17460,sweet16:0.05364,e8:0.00646,f4:0.00165,finals:0.00030,champ:0.00005 },
  KU: { rd32:0.86255,sweet16:0.41650,e8:0.10107,f4:0.04823,finals:0.01738,champ:0.00547 },
  CAB:{ rd32:0.13745,sweet16:0.02317,e8:0.00113,f4:0.00015,finals:0.00002,champ:0       },
  LOU:{ rd32:0.69861,sweet16:0.35559,e8:0.18279,f4:0.05817,finals:0.02436,champ:0.00858 },
  USF:{ rd32:0.30139,sweet16:0.09413,e8:0.03079,f4:0.00537,finals:0.00104,champ:0.00020 },
  MSU:{ rd32:0.92395,sweet16:0.54029,e8:0.28340,f4:0.09408,finals:0.03890,champ:0.01392 },
  NDS:{ rd32:0.07605,sweet16:0.00999,e8:0.00117,f4:0.00011,finals:0.00001,champ:0       },
  CLA:{ rd32:0.69158,sweet16:0.25197,e8:0.10511,f4:0.02567,finals:0.00815,champ:0.00238 },
  UCF:{ rd32:0.30842,sweet16:0.06788,e8:0.01827,f4:0.00255,finals:0.00049,champ:0.00010 },
  CON:{ rd32:0.94179,sweet16:0.67136,e8:0.37751,f4:0.13460,finals:0.05682,champ:0.02058 },
  FUR:{ rd32:0.05821,sweet16:0.00879,e8:0.00096,f4:0.00004,finals:0.00001,champ:0       },
  FLA:{ rd32:0.99156,sweet16:0.83572,e8:0.60083,f4:0.34377,finals:0.18505,champ:0.09370 },
  PVA:{ rd32:0.00844,sweet16:0.00031,e8:0.00001,f4:0,      finals:0,      champ:0       },
  CLE:{ rd32:0.40279,sweet16:0.06214,e8:0.02285,f4:0.00594,finals:0.00148,champ:0.00031 },
  IOW:{ rd32:0.59721,sweet16:0.10183,e8:0.04144,f4:0.01176,finals:0.00342,champ:0.00099 },
  VAN:{ rd32:0.84041,sweet16:0.50126,e8:0.18793,f4:0.07854,finals:0.03119,champ:0.01180 },
  MCN:{ rd32:0.15959,sweet16:0.04511,e8:0.00651,f4:0.00124,finals:0.00015,champ:0.00004 },
  NEB:{ rd32:0.92681,sweet16:0.44691,e8:0.14009,f4:0.04872,finals:0.01658,champ:0.00553 },
  TRO:{ rd32:0.07319,sweet16:0.00672,e8:0.00034,f4:0.00003,finals:0,      champ:0       },
  UNC:{ rd32:0.50222,sweet16:0.10489,e8:0.02206,f4:0.00474,finals:0.00098,champ:0.00015 },
  VCU:{ rd32:0.49778,sweet16:0.10272,e8:0.02183,f4:0.00476,finals:0.00094,champ:0.00019 },
  ILL:{ rd32:0.97103,sweet16:0.78811,e8:0.37647,f4:0.18672,finals:0.09034,champ:0.04041 },
  PEN:{ rd32:0.02897,sweet16:0.00428,e8:0.00019,f4:0.00002,finals:0,      champ:0       },
  STM:{ rd32:0.58189,sweet16:0.15777,e8:0.05814,f4:0.01779,finals:0.00501,champ:0.00131 },
  TAM:{ rd32:0.41811,sweet16:0.08725,e8:0.02860,f4:0.00712,finals:0.00155,champ:0.00034 },
  HOU:{ rd32:0.96836,sweet16:0.75138,e8:0.49247,f4:0.28882,finals:0.13887,champ:0.06265 },
  IDA:{ rd32:0.03164,sweet16:0.00360,e8:0.00024,f4:0.00003,finals:0,      champ:0       },
  ARI:{ rd32:0.98980,sweet16:0.88988,e8:0.72124,f4:0.52939,finals:0.29335,champ:0.16619 },
  LIU:{ rd32:0.01020,sweet16:0.00080,e8:0.00002,f4:0,      finals:0,      champ:0       },
  VIL:{ rd32:0.40882,sweet16:0.03867,e8:0.01309,f4:0.00357,finals:0.00081,champ:0.00015 },
  USU:{ rd32:0.59118,sweet16:0.07065,e8:0.02837,f4:0.01030,finals:0.00228,champ:0.00055 },
  WIS:{ rd32:0.83124,sweet16:0.40322,e8:0.09358,f4:0.03977,finals:0.01250,champ:0.00426 },
  HP: { rd32:0.16876,sweet16:0.03342,e8:0.00240,f4:0.00046,finals:0.00005,champ:0.00001 },
  ARK:{ rd32:0.92713,sweet16:0.55207,e8:0.14069,f4:0.06581,finals:0.02243,champ:0.00766 },
  HAW:{ rd32:0.07287,sweet16:0.01129,e8:0.00061,f4:0.00010,finals:0,      champ:0       },
  BYU:{ rd32:0.56284,sweet16:0.16550,e8:0.05595,f4:0.01181,finals:0.00247,champ:0.00061 },
  TEX:{ rd32:0.43716,sweet16:0.11725,e8:0.03604,f4:0.00721,finals:0.00158,champ:0.00045 },
  GNZ:{ rd32:0.96452,sweet16:0.71363,e8:0.36826,f4:0.13363,finals:0.04570,champ:0.01652 },
  KNS:{ rd32:0.03548,sweet16:0.00362,e8:0.00022,f4:0.00002,finals:0,      champ:0       },
  MFL:{ rd32:0.56008,sweet16:0.13626,e8:0.05035,f4:0.01085,finals:0.00249,champ:0.00059 },
  MIZ:{ rd32:0.43992,sweet16:0.09407,e8:0.02888,f4:0.00497,finals:0.00104,champ:0.00024 },
  PUR:{ rd32:0.97808,sweet16:0.76761,e8:0.46020,f4:0.18210,finals:0.08242,champ:0.03950 },
  QUE:{ rd32:0.02192,sweet16:0.00206,e8:0.00010,f4:0.00001,finals:0,      champ:0       },
  UM: { rd32:0.98063,sweet16:0.88024,e8:0.73849,f4:0.51463,finals:0.32191,champ:0.19389 },
  HOW:{ rd32:0.01937,sweet16:0.00275,e8:0.00036,f4:0,      finals:0,      champ:0       },
  UGA:{ rd32:0.57429,sweet16:0.07162,e8:0.03190,f4:0.00926,finals:0.00237,champ:0.00055 },
  STL:{ rd32:0.42571,sweet16:0.04539,e8:0.01890,f4:0.00503,finals:0.00119,champ:0.00030 },
  TTC:{ rd32:0.70369,sweet16:0.27677,e8:0.04902,f4:0.01485,finals:0.00399,champ:0.00107 },
  AKR:{ rd32:0.29631,sweet16:0.06745,e8:0.00669,f4:0.00102,finals:0.00015,champ:0.00003 },
  ALA:{ rd32:0.87314,sweet16:0.61617,e8:0.15150,f4:0.06267,finals:0.02248,champ:0.00813 },
  HOF:{ rd32:0.12686,sweet16:0.03961,e8:0.00314,f4:0.00043,finals:0.00005,champ:0       },
  TEN:{ rd32:0.87517,sweet16:0.41651,e8:0.15616,f4:0.04918,finals:0.01779,champ:0.00612 },
  MOH:{ rd32:0.12483,sweet16:0.01932,e8:0.00199,f4:0.00017,finals:0,      champ:0       },
  UVA:{ rd32:0.94428,sweet16:0.55775,e8:0.22150,f4:0.07298,finals:0.02835,champ:0.01056 },
  WRI:{ rd32:0.05572,sweet16:0.00642,e8:0.00041,f4:0,      finals:0,      champ:0       },
  UK: { rd32:0.63897,sweet16:0.17973,e8:0.08373,f4:0.02447,finals:0.00869,champ:0.00278 },
  SCL:{ rd32:0.36103,sweet16:0.06924,e8:0.02355,f4:0.00469,finals:0.00107,champ:0.00021 },
  ISU:{ rd32:0.97515,sweet16:0.74873,e8:0.51248,f4:0.24062,finals:0.12484,champ:0.06253 },
  TST:{ rd32:0.02485,sweet16:0.00230,e8:0.00018,f4:0,      finals:0,      champ:0       },
};

// ─── TEAM DATA ────────────────────────────────────────────────────────────────
const ALL_TEAMS = [
  { name:"Duke",          seed:1,  region:"East",    gross:400000, owners:[{owner:"Freeman",pct:0.50},{owner:"Kerlin",pct:0.50}], code:"DUK" },
  { name:"UConn",         seed:2,  region:"East",    gross:300000, owners:[{owner:"Hooter",pct:1.00}],  code:"CON" },
  { name:"Michigan St.",  seed:3,  region:"East",    gross:260000, owners:[{owner:"Buckets",pct:1.00}], code:"MSU" },
  { name:"Kansas",        seed:4,  region:"East",    gross:130000, owners:[{owner:"Freeman",pct:1.00}], code:"KU"  },
  { name:"St. John's",    seed:5,  region:"East",    gross:170000, owners:[{owner:"Buckets",pct:1.00}], code:"STJ" },
  { name:"Louisville",    seed:6,  region:"East",    gross:80000,  owners:[{owner:"Adultos",pct:1.00}], code:"LOU" },
  { name:"UCLA",          seed:7,  region:"East",    gross:80000,  owners:[{owner:"Hooter",pct:1.00}],  code:"CLA" },
  { name:"Ohio St.",      seed:8,  region:"East",    gross:45000,  owners:[{owner:"Ward",pct:1.00}],    code:"OSU" },
  { name:"TCU",           seed:9,  region:"East",    gross:40000,  owners:[{owner:"Buckets",pct:1.00}], code:"TCU" },
  { name:"UCF",           seed:10, region:"East",    gross:35000,  owners:[{owner:"Freeman",pct:1.00}], code:"UCF" },
  { name:"South Florida", seed:11, region:"East",    gross:53500,  owners:[{owner:"Freeman",pct:1.00}], code:"USF" },
  { name:"N. Iowa",       seed:12, region:"East",    gross:26000,  owners:[{owner:"Adultos",pct:1.00}], code:"NIA" },
  { name:"Cal Baptist",   seed:13, region:"East",    gross:15000,  owners:[{owner:"Freeman",pct:1.00}], code:"CAB" },
  { name:"N. Dakota St.", seed:14, region:"East",    gross:6000,   owners:[{owner:"Buckets",pct:1.00}], code:"NDS" },
  { name:"Furman",        seed:15, region:"East",    gross:6000,   owners:[{owner:"Buckets",pct:1.00}], code:"FUR" },
  { name:"Siena",         seed:16, region:"East",    gross:6000,   owners:[{owner:"Buckets",pct:1.00}], code:"SIE" },
  { name:"Florida",       seed:1,  region:"South",   gross:350000, owners:[{owner:"Adultos",pct:1.00}], code:"FLA" },
  { name:"Houston",       seed:2,  region:"South",   gross:350000, owners:[{owner:"Hooter",pct:1.00}],  code:"HOU" },
  { name:"Illinois",      seed:3,  region:"South",   gross:200000, owners:[{owner:"Kerlin",pct:1.00}],  code:"ILL" },
  { name:"Nebraska",      seed:4,  region:"South",   gross:100000, owners:[{owner:"Hooter",pct:1.00}],  code:"NEB" },
  { name:"Vanderbilt",    seed:5,  region:"South",   gross:125000, owners:[{owner:"Kerlin",pct:1.00}],  code:"VAN" },
  { name:"N. Carolina",   seed:6,  region:"South",   gross:45000,  owners:[{owner:"Adultos",pct:1.00}], code:"UNC" },
  { name:"Saint Mary's",  seed:7,  region:"South",   gross:60000,  owners:[{owner:"Hooter",pct:1.00}],  code:"STM" },
  { name:"Clemson",       seed:8,  region:"South",   gross:35000,  owners:[{owner:"Freeman",pct:1.00}], code:"CLE" },
  { name:"Iowa",          seed:9,  region:"South",   gross:42000,  owners:[{owner:"Kerlin",pct:1.00}],  code:"IOW" },
  { name:"Texas A&M",     seed:10, region:"South",   gross:44000,  owners:[{owner:"Buckets",pct:0.50},{owner:"Adultos",pct:0.50}], code:"TAM" },
  { name:"VCU",           seed:11, region:"South",   gross:52000,  owners:[{owner:"Freeman",pct:1.00}], code:"VCU" },
  { name:"McNeese",       seed:12, region:"South",   gross:18000,  owners:[{owner:"Ward",pct:1.00}],    code:"MCN" },
  { name:"Troy",          seed:13, region:"South",   gross:14000,  owners:[{owner:"Freeman",pct:1.00}], code:"TRO" },
  { name:"Penn",          seed:14, region:"South",   gross:8000,   owners:[{owner:"Freeman",pct:1.00}], code:"PEN" },
  { name:"Idaho",         seed:15, region:"South",   gross:8000,   owners:[{owner:"Freeman",pct:1.00}], code:"IDA" },
  { name:"PVA&M/LEH",     seed:16, region:"South",   gross:8000,   owners:[{owner:"Freeman",pct:1.00}], code:"PVA" },
  { name:"Michigan",      seed:1,  region:"Midwest",  gross:375000, owners:[{owner:"Kerlin",pct:1.00}],  code:"UM"  },
  { name:"Iowa St.",      seed:2,  region:"Midwest",  gross:300000, owners:[{owner:"Adultos",pct:1.00}], code:"ISU" },
  { name:"Virginia",      seed:3,  region:"Midwest",  gross:160000, owners:[{owner:"Freeman",pct:1.00}], code:"UVA" },
  { name:"Alabama",       seed:4,  region:"Midwest",  gross:120000, owners:[{owner:"Kerlin",pct:1.00}],  code:"ALA" },
  { name:"Texas Tech",    seed:5,  region:"Midwest",  gross:100000, owners:[{owner:"Buckets",pct:1.00}], code:"TTC" },
  { name:"Tennessee",     seed:6,  region:"Midwest",  gross:100000, owners:[{owner:"Hooter",pct:1.00}],  code:"TEN" },
  { name:"Kentucky",      seed:7,  region:"Midwest",  gross:50000,  owners:[{owner:"Kerlin",pct:1.00}],  code:"UK"  },
  { name:"Georgia",       seed:8,  region:"Midwest",  gross:48000,  owners:[{owner:"Buckets",pct:1.00}], code:"UGA" },
  { name:"Saint Louis",   seed:9,  region:"Midwest",  gross:35000,  owners:[{owner:"Ward",pct:1.00}],    code:"STL" },
  { name:"Santa Clara",   seed:10, region:"Midwest",  gross:37000,  owners:[{owner:"Freeman",pct:1.00}], code:"SCL" },
  { name:"Miami (OH)",    seed:11, region:"Midwest",  gross:35000,  owners:[{owner:"Adultos",pct:1.00}], code:"MOH" },
  { name:"Akron",         seed:12, region:"Midwest",  gross:34000,  owners:[{owner:"Freeman",pct:1.00}], code:"AKR" },
  { name:"Hofstra",       seed:13, region:"Midwest",  gross:25000,  owners:[{owner:"Freeman",pct:1.00}], code:"HOF" },
  { name:"Wright St.",    seed:14, region:"Midwest",  gross:7333,   owners:[{owner:"Ward",pct:1.00}],    code:"WRI" },
  { name:"Tennessee St.", seed:15, region:"Midwest",  gross:7333,   owners:[{owner:"Ward",pct:1.00}],    code:"TST" },
  { name:"Howard",        seed:16, region:"Midwest",  gross:7333,   owners:[{owner:"Ward",pct:1.00}],    code:"HOW" },
  { name:"Arizona",       seed:1,  region:"West",    gross:530000, owners:[{owner:"Freeman",pct:1.00}], code:"ARI" },
  { name:"Purdue",        seed:2,  region:"West",    gross:240000, owners:[{owner:"Hooter",pct:1.00}],  code:"PUR" },
  { name:"Gonzaga",       seed:3,  region:"West",    gross:175000, owners:[{owner:"Adultos",pct:1.00}], code:"GNZ" },
  { name:"Arkansas",      seed:4,  region:"West",    gross:180000, owners:[{owner:"Buckets",pct:1.00}], code:"ARK" },
  { name:"Wisconsin",     seed:5,  region:"West",    gross:75000,  owners:[{owner:"Hooter",pct:1.00}],  code:"WIS" },
  { name:"BYU",           seed:6,  region:"West",    gross:74000,  owners:[{owner:"Freeman",pct:1.00}], code:"BYU" },
  { name:"Miami (FL)",    seed:7,  region:"West",    gross:48000,  owners:[{owner:"Buckets",pct:1.00}], code:"MFL" },
  { name:"Villanova",     seed:8,  region:"West",    gross:33000,  owners:[{owner:"Hooter",pct:1.00}],  code:"VIL" },
  { name:"Utah St.",      seed:9,  region:"West",    gross:32000,  owners:[{owner:"Kerlin",pct:1.00}],  code:"USU" },
  { name:"Missouri",      seed:10, region:"West",    gross:35000,  owners:[{owner:"Ward",pct:0.50},{owner:"Adultos",pct:0.50}], code:"MIZ" },
  { name:"Texas",         seed:11, region:"West",    gross:36000,  owners:[{owner:"Kerlin",pct:1.00}],  code:"TEX" },
  { name:"High Point",    seed:12, region:"West",    gross:23000,  owners:[{owner:"Freeman",pct:1.00}], code:"HP"  },
  { name:"Hawai'i",       seed:13, region:"West",    gross:18000,  owners:[{owner:"Freeman",pct:1.00}], code:"HAW" },
  { name:"Kennesaw St.",  seed:14, region:"West",    gross:8667,   owners:[{owner:"Buckets",pct:1.00}], code:"KNS" },
  { name:"Queens",        seed:15, region:"West",    gross:8667,   owners:[{owner:"Buckets",pct:1.00}], code:"QUE" },
  { name:"LIU",           seed:16, region:"West",    gross:8667,   owners:[{owner:"Buckets",pct:1.00}], code:"LIU" },
];

const ALL_OWNERS = ["Freeman","Adultos","Buckets","Hooter","Kerlin","Ward"];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const OC = {
  Freeman:{ bg:"#E6F1FB", text:"#0C447C", border:"#185FA5" },
  Adultos:{ bg:"#EAF3DE", text:"#3B6D11", border:"#3B6D11" },
  Buckets:{ bg:"#FAEEDA", text:"#633806", border:"#854F0B" },
  Hooter: { bg:"#FBEAF0", text:"#72243E", border:"#993556" },
  Kerlin: { bg:"#EEEDFE", text:"#3C3489", border:"#534AB7" },
  Ward:   { bg:"#F1EFE8", text:"#444441", border:"#5F5E5A" },
};
const RC = { East:"#0C447C", South:"#3B6D11", Midwest:"#A32D2D", West:"#633806" };
const RB = { East:"#E6F1FB", South:"#EAF3DE", Midwest:"#FCEBEB", West:"#FAEEDA" };

const fmt = (n,dec=0) => {
  if (n==null) return "—";
  const s = Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec});
  return n<0?`($${s})`:`$${s}`;
};
const pct = n => n!=null?(n*100).toFixed(1)+"%":"—";

// ─── LIVE ODDS ────────────────────────────────────────────────────────────────
// Apply completed results to base odds.
// games: [ { round, winner, loser, winScore, lossScore } ]
// round: "R64"|"R32"|"S16"|"E8"|"F4"|"CHAMP"
function applyResults(games, baseOdds) {
  const src = baseOdds || BASE_ODDS;
  const odds = {};
  for (const [code, o] of Object.entries(src)) odds[code] = { ...o, alive:1 };
  const byRound = {};
  for (const g of (games||[])) { (byRound[g.round]||(byRound[g.round]=[])).push(g); }
  for (const round of ROUND_ORDER) {
    const roundIdx = ROUND_ORDER.indexOf(round);
    for (const g of (byRound[round]||[])) {
      if (g.winner && odds[g.winner]) odds[g.winner][ROUND_ODDS_KEY[round]] = 1.0;
      if (g.loser  && odds[g.loser])  {
        ROUND_ORDER.slice(roundIdx).forEach(r => { odds[g.loser][ROUND_ODDS_KEY[r]] = 0; });
        odds[g.loser].alive = 0;
      }
    }
  }
  return odds;
}

function calcEV(o) {
  if (!o) return 0;
  return (o.rd32||0)*PAYOUTS.R64 + (o.sweet16||0)*PAYOUTS.R32 +
         (o.e8||0)*PAYOUTS.S16   + (o.f4||0)*PAYOUTS.E8 +
         (o.finals||0)*PAYOUTS.F4 + (o.champ||0)*PAYOUTS.CHAMP;
}

// ─── SCORE FETCH via Anthropic API ───────────────────────────────────────────
// Single call — web_search_20250305 is server-side, Anthropic handles the
// search internally and returns the final answer in one response.
// This is the pattern that was confirmed working.
async function fetchScores() {
  const teamList = ALL_TEAMS.map(t => `${t.name}=${t.code}`).join(",");

  const prompt = `Search for "2026 NCAA tournament scores" and return all completed and upcoming tournament game results.

Team name to code lookup: ${teamList}

Return ONLY this JSON structure, nothing else (no markdown fences):
{"updatedAt":"Mar 20 7:00 PM ET","games":[{"round":"R64","winner":"DUK","loser":"SIE","winScore":71,"lossScore":65,"status":"final"}],"upcoming":[{"code":"KU","round":"R64","opponent":"Cal Baptist","date":"Mar 20","time":"9:45 PM ET","network":"CBS"}]}

Rules:
- round: R64, R32, S16, E8, F4, or CHAMP
- status: final, live, or upcoming
- Include ALL completed games and ALL upcoming games for teams still in the tournament
- For live games: include current scores, winner = current leader (null if tied)
- Use exact codes from the lookup above`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`API ${r.status}: ${txt.slice(0,200)}`);
  }

  const data = await r.json();

  // Collect all text from all content blocks (answer comes in text blocks)
  const raw = (data.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("");

  if (!raw) throw new Error(`No text in response. stop_reason=${data.stop_reason}`);

  // Extract the outermost JSON object
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON found. Got: ${raw.slice(0,300)}`);

  return JSON.parse(match[0]);
}

// ─── GAME CELL ────────────────────────────────────────────────────────────────
function GameCell({ code, scoreData }) {
  if (!scoreData) return <span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>—</span>;

  const games    = scoreData.games    || [];
  const upcoming = scoreData.upcoming || [];

  // Most recent completed/live game for this team
  const myGames = games
    .filter(g => g.winner === code || g.loser === code)
    .sort((a,b) => ROUND_ORDER.indexOf(b.round) - ROUND_ORDER.indexOf(a.round));
  const lastGame = myGames[0];

  // Upcoming game
  const next = upcoming.find(u => u.code === code);

  if (lastGame) {
    const won      = lastGame.winner === code;
    const live     = lastGame.status === "live";
    const oppCode  = won ? lastGame.loser : lastGame.winner;
    const oppName  = ALL_TEAMS.find(t => t.code === oppCode)?.name || oppCode || "?";
    const myScore  = won ? lastGame.winScore  : lastGame.lossScore;
    const oppScore = won ? lastGame.lossScore : lastGame.winScore;
    const col      = won ? "var(--color-text-success)" : "var(--color-text-danger)";
    return (
      <div style={{fontSize:12}}>
        {live && <span style={{display:"inline-block",padding:"1px 5px",borderRadius:3,
          background:"#E24B4A",color:"#fff",fontSize:10,fontWeight:700,marginRight:5}}>LIVE</span>}
        <span style={{fontWeight:600,color:col}}>{won?"W":"L"} {myScore}–{oppScore}</span>
        <span style={{color:"var(--color-text-secondary)",marginLeft:5}}>vs {oppName}</span>
        <div style={{color:"var(--color-text-tertiary)",marginTop:2}}>
          {ROUND_LABEL[lastGame.round]}{live?"":" · Final"}
        </div>
        {!live && next && (
          <div style={{marginTop:4,color:"var(--color-text-secondary)",fontWeight:500}}>
            Next: {ROUND_LABEL[next.round]} vs {next.opponent}
            <div style={{fontWeight:400}}>{next.date} · {next.time}{next.network?` · ${next.network}`:""}</div>
          </div>
        )}
      </div>
    );
  }

  if (next) {
    return (
      <div style={{fontSize:12}}>
        <div style={{fontWeight:500,color:"var(--color-text-primary)"}}>
          {ROUND_LABEL[next.round]} vs {next.opponent}
        </div>
        <div style={{color:"var(--color-text-secondary)",marginTop:2}}>
          {next.date}{next.time ? ` · ${next.time}` : ""}
        </div>
        {next.network && <div style={{color:"var(--color-text-tertiary)"}}>{next.network}</div>}
      </div>
    );
  }

  return <span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>—</span>;
}

// ─── SORT HOOK ────────────────────────────────────────────────────────────────
function useSorted(teams, defaultKey="pl") {
  const [sk, setSk] = useState(defaultKey);
  const [sd, setSd] = useState(-1);
  const sorted = [...teams].sort((a,b) => {
    if (sk==="name"||sk==="region") return sd*String(a[sk]).localeCompare(String(b[sk]));
    return sd*((a[sk]||0)-(b[sk]||0));
  });
  const hs = k => { if(sk===k) setSd(d=>-d); else{setSk(k);setSd(-1);} };
  const TH = ({k,label,align="right"}) => (
    <th onClick={()=>hs(k)} style={{textAlign:align,padding:"10px 12px",cursor:"pointer",
      userSelect:"none",fontWeight:500,fontSize:12,color:"var(--color-text-secondary)",
      borderBottom:"0.5px solid var(--color-border-tertiary)",whiteSpace:"nowrap",
      background:"var(--color-background-secondary)"}}>
      {label}{sk===k?(sd>0?" ↑":" ↓"):""}
    </th>
  );
  return { sorted, TH };
}

// ─── OWNER HELPERS ────────────────────────────────────────────────────────────
function getOwnerTeams(owner, liveOdds) {
  return ALL_TEAMS.map(t => {
    const s = t.owners.find(o => o.owner === owner);
    if (!s) return null;
    const o = liveOdds[t.code] || BASE_ODDS[t.code] || {};
    const ev = calcEV(o);
    return { ...t, pct:s.pct, odds:o, ownerEV:ev*s.pct, netCost:-(t.gross*s.pct), pl:ev*s.pct-t.gross*s.pct };
  }).filter(Boolean);
}

// ─── OWNER DASHBOARD ─────────────────────────────────────────────────────────
function OwnerDashboard({ owner, liveOdds, scoreData, loading }) {
  const teams   = getOwnerTeams(owner, liveOdds);
  const invest  = teams.reduce((s,t)=>s+Math.abs(t.netCost),0);
  const totalEV = teams.reduce((s,t)=>s+t.ownerEV,0);
  const totalPL = totalEV - invest;
  const { sorted, TH } = useSorted(teams);

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:12,marginBottom:24}}>
        {[
          {label:"Investment",   val:fmt(invest)},
          {label:"Exp. Returns", val:fmt(totalEV)},
          {label:"Exp. Net P&L", val:fmt(totalPL), hi:true},
          {label:"Teams",        val:teams.length},
          {label:"Champion %",   val:pct(teams.reduce((s,t)=>s+(t.odds.champ||0)*t.pct,0))},
        ].map(c=>(
          <div key={c.label} style={{background:"var(--color-background-secondary)",
            borderRadius:"var(--border-radius-md)",padding:"12px 14px"}}>
            <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:4}}>{c.label}</div>
            <div style={{fontSize:22,fontWeight:500,
              color:c.hi?(totalPL>=0?"var(--color-text-success)":"var(--color-text-danger)")
                        :"var(--color-text-primary)"}}>{c.val}</div>
          </div>
        ))}
      </div>

      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr>
            <TH k="name"    label="Team"        align="left"/>
            <TH k="region"  label="Region"      align="left"/>
            <TH k="seed"    label="Seed"/>
            <TH k="gross"   label="Gross"/>
            <TH k="pct"     label="Own%"/>
            <TH k="netCost" label="Net Cost"/>
            <TH k="ownerEV" label="Exp. Return"/>
            <TH k="pl"      label="Exp. P&L"/>
            <th style={{textAlign:"left",padding:"10px 12px",fontWeight:500,fontSize:12,
              color:"var(--color-text-secondary)",
              borderBottom:"0.5px solid var(--color-border-tertiary)",
              background:"var(--color-background-secondary)",minWidth:190}}>
              Result / Next Game
            </th>
          </tr></thead>
          <tbody>
            {sorted.map((t,i) => {
              const elim = liveOdds[t.code]?.alive === 0;
              return (
                <tr key={t.code} style={{
                  background:i%2===0?"var(--color-background-primary)":"var(--color-background-secondary)",
                  borderBottom:"0.5px solid var(--color-border-tertiary)",
                  opacity:elim?0.5:1,
                }}>
                  <td style={{padding:"10px 12px",fontWeight:500}}>
                    <span style={{display:"inline-block",width:20,height:20,borderRadius:4,
                      background:RB[t.region],color:RC[t.region],fontSize:11,fontWeight:700,
                      textAlign:"center",lineHeight:"20px",marginRight:8}}>{t.seed}</span>
                    {t.name}
                    {elim&&<span style={{marginLeft:6,fontSize:10,color:"var(--color-text-tertiary)"}}>OUT</span>}
                  </td>
                  <td style={{padding:"10px 12px",color:"var(--color-text-secondary)"}}>{t.region}</td>
                  <td style={{padding:"10px 12px",textAlign:"right"}}>{t.seed}</td>
                  <td style={{padding:"10px 12px",textAlign:"right"}}>{fmt(t.gross)}</td>
                  <td style={{padding:"10px 12px",textAlign:"right"}}>{pct(t.pct)}</td>
                  <td style={{padding:"10px 12px",textAlign:"right",color:"var(--color-text-danger)"}}>{fmt(t.netCost)}</td>
                  <td style={{padding:"10px 12px",textAlign:"right",color:"var(--color-text-success)"}}>{fmt(t.ownerEV)}</td>
                  <td style={{padding:"10px 12px",textAlign:"right",fontWeight:500,
                    color:t.pl>=0?"var(--color-text-success)":"var(--color-text-danger)"}}>{fmt(t.pl)}</td>
                  <td style={{padding:"10px 12px"}}>
                    {loading
                      ? <span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>Loading…</span>
                      : <GameCell code={t.code} scoreData={scoreData}/>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{background:"var(--color-background-secondary)",fontWeight:500}}>
              <td colSpan={3} style={{padding:"10px 12px",borderTop:"1px solid var(--color-border-secondary)"}}>TOTAL</td>
              <td style={{padding:"10px 12px",textAlign:"right",borderTop:"1px solid var(--color-border-secondary)"}}>{fmt(teams.reduce((s,t)=>s+t.gross*t.pct,0))}</td>
              <td style={{borderTop:"1px solid var(--color-border-secondary)"}}/>
              <td style={{padding:"10px 12px",textAlign:"right",color:"var(--color-text-danger)",borderTop:"1px solid var(--color-border-secondary)"}}>{fmt(-invest)}</td>
              <td style={{padding:"10px 12px",textAlign:"right",color:"var(--color-text-success)",borderTop:"1px solid var(--color-border-secondary)"}}>{fmt(totalEV)}</td>
              <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700,fontSize:15,
                color:totalPL>=0?"var(--color-text-success)":"var(--color-text-danger)",
                borderTop:"1px solid var(--color-border-secondary)"}}>{fmt(totalPL)}</td>
              <td style={{borderTop:"1px solid var(--color-border-secondary)"}}/>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{marginTop:20,padding:"1rem 1.25rem",borderRadius:"var(--border-radius-lg)",
        border:"0.5px solid var(--color-border-tertiary)",
        background:totalPL>=0?"var(--color-background-success)":"var(--color-background-danger)"}}>
        <div style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:4}}>Expected Total Net P&L — {owner}</div>
        <div style={{fontSize:32,fontWeight:500,
          color:totalPL>=0?"var(--color-text-success)":"var(--color-text-danger)"}}>{fmt(totalPL)}</div>
        <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:4}}>
          Investment {fmt(invest)} · Expected returns {fmt(totalEV)}
        </div>
      </div>
    </div>
  );
}

// ─── ODDS UPLOADER ────────────────────────────────────────────────────────────
// Parses the NCAAB_Tournament_Odds.xlsx "Current" sheet using SheetJS.
// Expected columns: Code, Rd64, Rd32, Sweet16, Elite8, Final4, Finals, Champion, Alive
// Converts to our BASE_ODDS shape: { CODE: { rd32, sweet16, e8, f4, finals, champ } }
function OddsUploader({ onOddsLoaded, uploadedOdds }) {
  const [status, setStatus] = useState(null); // null | "parsing" | "ok" | "error"
  const [message, setMessage] = useState("");
  const [filename, setFilename] = useState("");
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setStatus("parsing");
    setMessage("Reading spreadsheet…");

    try {
      // Read file as ArrayBuffer
      const buf = await file.arrayBuffer();

      // Load SheetJS dynamically
      const XLSX = await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/xlsx.mjs");

      const wb = XLSX.read(buf, { type: "array" });

      // Look for "Current" sheet, fall back to first sheet
      const sheetName = wb.SheetNames.includes("Current")
        ? "Current"
        : wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: 0 });

      if (!rows.length) throw new Error("No data found in sheet");

      // Map column names flexibly (case-insensitive)
      const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g,"");
      const sampleRow = rows[0];
      const colMap = {};
      for (const key of Object.keys(sampleRow)) {
        colMap[normalize(key)] = key;
      }

      // Required columns
      const get = (row, ...candidates) => {
        for (const c of candidates) {
          const mapped = colMap[normalize(c)];
          if (mapped !== undefined && row[mapped] !== undefined) return Number(row[mapped]) || 0;
        }
        return 0;
      };
      const getStr = (row, ...candidates) => {
        for (const c of candidates) {
          const mapped = colMap[normalize(c)];
          if (mapped !== undefined && row[mapped]) return String(row[mapped]).trim().toUpperCase();
        }
        return "";
      };

      const newOdds = {};
      let matched = 0;

      for (const row of rows) {
        const code = getStr(row, "Code", "code", "TEAM CODE");
        if (!code || !BASE_ODDS[code]) continue;

        // Column mapping:
        // Rd64 = prob of making R64 (always 1 for alive teams, ignore)
        // Rd32 = prob of winning R64 game → our rd32
        // Sweet16 = prob of winning R32 game → our sweet16
        // Elite8 = prob of winning S16 game → our e8
        // Final4 = prob of winning E8 game → our f4
        // Finals = prob of winning F4 game → our finals
        // Champion = prob of winning championship → our champ
        newOdds[code] = {
          rd32:    get(row, "Rd32",    "rd32",    "Round32"),
          sweet16: get(row, "Sweet16", "sweet16", "Sweet 16"),
          e8:      get(row, "Elite8",  "elite8",  "Elite 8", "EliteEight"),
          f4:      get(row, "Final4",  "final4",  "Final Four", "FinalFour"),
          finals:  get(row, "Finals",  "finals",  "Championship Game"),
          champ:   get(row, "Champion","champion","Championship"),
        };
        matched++;
      }

      if (matched === 0) throw new Error("No matching team codes found. Check the 'Code' column.");

      onOddsLoaded(newOdds);
      setStatus("ok");
      setMessage(`Loaded odds for ${matched} teams from "${sheetName}" sheet`);
    } catch(err) {
      setStatus("error");
      setMessage(err.message);
    }

    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const clear = () => {
    onOddsLoaded(null);
    setStatus(null);
    setMessage("");
    setFilename("");
  };

  return (
    <div style={{marginTop:24,border:"0.5px solid var(--color-border-tertiary)",
      borderRadius:"var(--border-radius-lg)",padding:"1rem 1.25rem",
      background:"var(--color-background-primary)"}}>
      <div style={{fontWeight:500,fontSize:14,marginBottom:4}}>Update Odds</div>
      <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:14}}>
        Upload a new version of the odds spreadsheet to recalculate expected values.
        The "Current" sheet is used automatically.
      </div>

      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          style={{display:"none"}}
          id="odds-file-input"
        />
        <button
          onClick={()=>fileRef.current?.click()}
          disabled={status==="parsing"}
          style={{padding:"7px 16px",fontSize:13,borderRadius:"var(--border-radius-md)",
            border:"0.5px solid var(--color-border-secondary)",cursor:"pointer",
            background:"var(--color-background-primary)",color:"var(--color-text-primary)",
            opacity:status==="parsing"?0.6:1}}>
          {status==="parsing" ? "Parsing…" : "Upload Odds Spreadsheet (.xlsx)"}
        </button>

        {uploadedOdds && (
          <button onClick={clear} style={{padding:"7px 14px",fontSize:13,
            borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",
            cursor:"pointer",background:"var(--color-background-primary)",
            color:"var(--color-text-secondary)"}}>
            Reset to base odds
          </button>
        )}
      </div>

      {status === "ok" && (
        <div style={{marginTop:10,fontSize:12,display:"flex",alignItems:"center",gap:8}}>
          <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",
            background:"var(--color-background-success)",
            border:"1.5px solid var(--color-text-success)"}}/>
          <span style={{color:"var(--color-text-success)",fontWeight:500}}>{message}</span>
          {filename && <span style={{color:"var(--color-text-tertiary)"}}>— {filename}</span>}
        </div>
      )}
      {status === "error" && (
        <div style={{marginTop:10,fontSize:12,color:"var(--color-text-danger)"}}>
          Error: {message}
        </div>
      )}
      {uploadedOdds && (
        <div style={{marginTop:8,fontSize:11,color:"var(--color-text-tertiary)"}}>
          Using uploaded odds. All expected values and P&L figures reflect the new data.
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]         = useState("dashboard");
  const [selOwner, setSelOwner] = useState("Freeman");
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [uploadedOdds, setUploadedOdds] = useState(null); // overrides BASE_ODDS when set

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchScores();
      setScoreData(data);
      setLastRefresh(new Date());
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount, auto-refresh every 5 minutes
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const id = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  const liveOdds = applyResults(scoreData?.games, uploadedOdds || BASE_ODDS);

  const ownerSummary = ALL_OWNERS.map(owner => {
    const teams  = getOwnerTeams(owner, liveOdds);
    const invest = teams.reduce((s,t)=>s+Math.abs(t.netCost),0);
    const ev     = teams.reduce((s,t)=>s+t.ownerEV,0);
    return { owner, invest, ev, pl:ev-invest, count:teams.length };
  });

  const fTeams  = getOwnerTeams("Freeman", liveOdds);
  const fInvest = fTeams.reduce((s,t)=>s+Math.abs(t.netCost),0);
  const fEV     = fTeams.reduce((s,t)=>s+t.ownerEV,0);
  const fPL     = fEV - fInvest;
  const { sorted: fSorted, TH: FTH } = useSorted(fTeams);

  const TABS = [["dashboard","Dashboard"],["byowner","By Owner"],["all","All Teams"]];

  return (
    <div style={{fontFamily:"var(--font-sans)",color:"var(--color-text-primary)",paddingBottom:"3rem"}}>

      {/* HEADER */}
      <div style={{background:"var(--color-background-secondary)",
        borderBottom:"0.5px solid var(--color-border-tertiary)",padding:"1.25rem 1.5rem 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:11,fontWeight:500,letterSpacing:"0.08em",
              color:"var(--color-text-secondary)",marginBottom:4,textTransform:"uppercase"}}>NCAA Tournament 2026</div>
            <h1 style={{margin:0,fontSize:22,fontWeight:500}}>Calcutta Dashboard</h1>
            <div style={{fontSize:13,color:"var(--color-text-secondary)",marginTop:4,
              display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
              <span>Total pot: <strong style={{color:"var(--color-text-primary)"}}>{fmt(POT)}</strong></span>
              {loading && <span style={{color:"var(--color-text-tertiary)"}}>Fetching scores… (may take ~15s)</span>}
              {!loading && lastRefresh && (
                <span style={{color:"var(--color-text-tertiary)"}}>
                  {scoreData?.updatedAt || `Updated ${lastRefresh.toLocaleTimeString()}`}
                </span>
              )}
            </div>
            {error && (
              <div style={{fontSize:12,color:"var(--color-text-danger)",marginTop:4}}>
                Score fetch error: {error}
              </div>
            )}
          </div>
          <button onClick={refresh} disabled={loading} style={{padding:"6px 14px",fontSize:13,
            borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",
            cursor:loading?"not-allowed":"pointer",opacity:loading?0.6:1,
            background:"var(--color-background-primary)",color:"var(--color-text-primary)",
            alignSelf:"flex-start",whiteSpace:"nowrap"}}>
            {loading ? "Fetching…" : "↻ Refresh Scores"}
          </button>
        </div>
        <div style={{display:"flex",gap:0,marginTop:16}}>
          {TABS.map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"8px 16px",fontSize:13,
              border:"none",cursor:"pointer",background:"transparent",
              fontWeight:tab===id?500:400,
              color:tab===id?"var(--color-text-primary)":"var(--color-text-secondary)",
              borderBottom:tab===id?"2px solid var(--color-text-primary)":"2px solid transparent",
              marginBottom:-1}}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"1.25rem 1.5rem"}}>

        {/* ── DASHBOARD (Freeman) ── */}
        {tab==="dashboard" && <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:12,marginBottom:24}}>
            {[
              {label:"Freeman Investment", val:fmt(fInvest)},
              {label:"Exp. Returns",       val:fmt(fEV)},
              {label:"Exp. Net P&L",       val:fmt(fPL), hi:true},
              {label:"Freeman Teams",      val:fTeams.length},
              {label:"Champion %",         val:pct(fTeams.reduce((s,t)=>s+(t.odds.champ||0)*t.pct,0))},
            ].map(c=>(
              <div key={c.label} style={{background:"var(--color-background-secondary)",
                borderRadius:"var(--border-radius-md)",padding:"12px 14px"}}>
                <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:4}}>{c.label}</div>
                <div style={{fontSize:22,fontWeight:500,
                  color:c.hi?(fPL>=0?"var(--color-text-success)":"var(--color-text-danger)")
                            :"var(--color-text-primary)"}}>{c.val}</div>
              </div>
            ))}
          </div>

          <div style={{marginBottom:28}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:12}}>Freeman Teams</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr>
                  <FTH k="name"    label="Team"        align="left"/>
                  <FTH k="region"  label="Region"      align="left"/>
                  <FTH k="seed"    label="Seed"/>
                  <FTH k="gross"   label="Gross"/>
                  <FTH k="pct"     label="Own%"/>
                  <FTH k="netCost" label="Net Cost"/>
                  <FTH k="ownerEV" label="Exp. Return"/>
                  <FTH k="pl"      label="Exp. P&L"/>
                  <th style={{textAlign:"left",padding:"10px 12px",fontWeight:500,fontSize:12,
                    color:"var(--color-text-secondary)",
                    borderBottom:"0.5px solid var(--color-border-tertiary)",
                    background:"var(--color-background-secondary)",minWidth:190}}>
                    Result / Next Game
                  </th>
                </tr></thead>
                <tbody>
                  {fSorted.map((t,i) => {
                    const elim = liveOdds[t.code]?.alive === 0;
                    return (
                      <tr key={t.code} style={{
                        background:i%2===0?"var(--color-background-primary)":"var(--color-background-secondary)",
                        borderBottom:"0.5px solid var(--color-border-tertiary)",
                        opacity:elim?0.5:1,
                      }}>
                        <td style={{padding:"10px 12px",fontWeight:500}}>
                          <span style={{display:"inline-block",width:20,height:20,borderRadius:4,
                            background:RB[t.region],color:RC[t.region],fontSize:11,fontWeight:700,
                            textAlign:"center",lineHeight:"20px",marginRight:8}}>{t.seed}</span>
                          {t.name}
                          {elim&&<span style={{marginLeft:6,fontSize:10,color:"var(--color-text-tertiary)"}}>OUT</span>}
                        </td>
                        <td style={{padding:"10px 12px",color:"var(--color-text-secondary)"}}>{t.region}</td>
                        <td style={{padding:"10px 12px",textAlign:"right"}}>{t.seed}</td>
                        <td style={{padding:"10px 12px",textAlign:"right"}}>{fmt(t.gross)}</td>
                        <td style={{padding:"10px 12px",textAlign:"right"}}>{pct(t.pct)}</td>
                        <td style={{padding:"10px 12px",textAlign:"right",color:"var(--color-text-danger)"}}>{fmt(t.netCost)}</td>
                        <td style={{padding:"10px 12px",textAlign:"right",color:"var(--color-text-success)"}}>{fmt(t.ownerEV)}</td>
                        <td style={{padding:"10px 12px",textAlign:"right",fontWeight:500,
                          color:t.pl>=0?"var(--color-text-success)":"var(--color-text-danger)"}}>{fmt(t.pl)}</td>
                        <td style={{padding:"10px 12px"}}>
                          {loading
                            ? <span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>Loading…</span>
                            : <GameCell code={t.code} scoreData={scoreData}/>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{background:"var(--color-background-secondary)",fontWeight:500}}>
                    <td colSpan={3} style={{padding:"8px 12px",borderTop:"1px solid var(--color-border-secondary)"}}>TOTAL</td>
                    <td style={{padding:"8px 12px",textAlign:"right",borderTop:"1px solid var(--color-border-secondary)"}}>{fmt(fTeams.reduce((s,t)=>s+t.gross*t.pct,0))}</td>
                    <td style={{borderTop:"1px solid var(--color-border-secondary)"}}/>
                    <td style={{padding:"8px 12px",textAlign:"right",color:"var(--color-text-danger)",borderTop:"1px solid var(--color-border-secondary)"}}>{fmt(-fInvest)}</td>
                    <td style={{padding:"8px 12px",textAlign:"right",color:"var(--color-text-success)",borderTop:"1px solid var(--color-border-secondary)"}}>{fmt(fEV)}</td>
                    <td style={{padding:"8px 12px",textAlign:"right",fontWeight:700,fontSize:14,
                      color:fPL>=0?"var(--color-text-success)":"var(--color-text-danger)",
                      borderTop:"1px solid var(--color-border-secondary)"}}>{fmt(fPL)}</td>
                    <td style={{borderTop:"1px solid var(--color-border-secondary)"}}/>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div style={{border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",
            padding:"1rem 1.25rem",background:"var(--color-background-primary)"}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:12}}>Payout Structure — {fmt(POT)} pot</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(115px,1fr))",gap:8}}>
              {[{r:"Round of 64",p:PAYOUTS.R64,c:60775},{r:"Round of 32",p:PAYOUTS.R32,c:136744},
                {r:"Sweet 16",p:PAYOUTS.S16,c:288681},{r:"Elite 8",p:PAYOUTS.E8,c:471006},
                {r:"Final 4",p:PAYOUTS.F4,c:607750},{r:"Champion",p:PAYOUTS.CHAMP,c:1033175}].map(x=>(
                <div key={x.r} style={{background:"var(--color-background-secondary)",
                  borderRadius:"var(--border-radius-md)",padding:"10px 12px"}}>
                  <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:4}}>{x.r}</div>
                  <div style={{fontSize:15,fontWeight:500}}>{fmt(x.p)}</div>
                  <div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>Cumul: {fmt(x.c)}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,paddingTop:12,borderTop:"0.5px solid var(--color-border-tertiary)",
              fontSize:13,color:"var(--color-text-secondary)"}}>
              <strong style={{color:"var(--color-text-primary)"}}>Bonus payouts</strong> (each = {fmt(60775)}, splits on tie):&ensp;
              Lowest Score · Largest Margin Loss · Highest Seed to Lose R64 · Highest Seed to Lose R32
            </div>
          </div>

          {/* ── ODDS UPLOAD ── */}
          <OddsUploader onOddsLoaded={setUploadedOdds} uploadedOdds={uploadedOdds}/>
        </>}

        {/* ── BY OWNER ── */}
        {tab==="byowner" && <>
          <div style={{marginBottom:28}}>
            <div style={{fontWeight:500,fontSize:14,marginBottom:12}}>Owner Standings</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:"var(--color-background-secondary)"}}>
                    {[["Rank","right"],["Owner","left"],["Teams","right"],
                      ["Investment","right"],["Exp. Returns","right"],["Exp. Net P&L","right"]].map(([h,a])=>(
                      <th key={h} style={{padding:"10px 12px",textAlign:a,fontWeight:500,fontSize:12,
                        color:"var(--color-text-secondary)",
                        borderBottom:"0.5px solid var(--color-border-tertiary)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...ownerSummary].sort((a,b)=>b.pl-a.pl).map((o,i)=>{
                    const c=OC[o.owner]; const active=selOwner===o.owner;
                    return (
                      <tr key={o.owner} onClick={()=>setSelOwner(o.owner)}
                        style={{background:active?c.bg:(i%2===0?"var(--color-background-primary)":"var(--color-background-secondary)"),
                          borderBottom:"0.5px solid var(--color-border-tertiary)",cursor:"pointer",
                          outline:active?`2px solid ${c.border}`:"none",outlineOffset:-1}}>
                        <td style={{padding:"10px 12px",textAlign:"right",fontWeight:500,color:"var(--color-text-tertiary)"}}>{i+1}</td>
                        <td style={{padding:"10px 12px"}}>
                          <span style={{display:"inline-block",padding:"2px 10px",
                            borderRadius:"var(--border-radius-md)",background:c.bg,color:c.text,
                            fontWeight:500,fontSize:12,
                            border:active?`1px solid ${c.border}`:"1px solid transparent"}}>{o.owner}</span>
                        </td>
                        <td style={{padding:"10px 12px",textAlign:"right"}}>{o.count}</td>
                        <td style={{padding:"10px 12px",textAlign:"right"}}>{fmt(o.invest)}</td>
                        <td style={{padding:"10px 12px",textAlign:"right",color:"var(--color-text-success)"}}>{fmt(o.ev)}</td>
                        <td style={{padding:"10px 12px",textAlign:"right",fontWeight:500,
                          color:o.pl>=0?"var(--color-text-success)":"var(--color-text-danger)"}}>{fmt(o.pl)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:6}}>
              Click a row to view that owner's detail below
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,flexWrap:"wrap"}}>
            {ALL_OWNERS.map(o=>{
              const c=OC[o]; const active=selOwner===o;
              return <button key={o} onClick={()=>setSelOwner(o)} style={{padding:"5px 14px",fontSize:13,
                borderRadius:"var(--border-radius-md)",
                border:active?`2px solid ${c.border}`:"0.5px solid var(--color-border-secondary)",
                cursor:"pointer",fontWeight:active?500:400,
                background:active?c.bg:"var(--color-background-primary)",
                color:active?c.text:"var(--color-text-secondary)"}}>{o}</button>;
            })}
          </div>
          <OwnerDashboard owner={selOwner} liveOdds={liveOdds}
            scoreData={scoreData} loading={loading}/>
        </>}

        {/* ── ALL TEAMS ── */}
        {tab==="all" && ["East","South","Midwest","West"].map(region => {
          const teams = ALL_TEAMS.filter(t=>t.region===region).map(t=>{
            const o=liveOdds[t.code]||BASE_ODDS[t.code]||{};
            const ev=calcEV(o);
            const ownerNC=t.owners.reduce((s,ow)=>s-(t.gross*ow.pct),0);
            const ownerEV=t.owners.reduce((s,ow)=>s+ev*ow.pct,0);
            return {...t,odds:o,ev,ownerPL:ownerEV+ownerNC};
          }).sort((a,b)=>a.seed-b.seed);
          return (
            <div key={region} style={{marginBottom:32}}>
              <h2 style={{fontSize:16,fontWeight:500,margin:"0 0 12px",color:RC[region]}}>{region} Region</h2>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{background:"var(--color-background-secondary)"}}>
                      {[["Seed","right"],["Team","left"],["Owner(s)","left"],["Gross","right"],
                        ["Champ %","right"],["Full EV","right"],["Owner P&L","right"],
                        ["Result / Next","left"]].map(([h,a])=>(
                        <th key={h} style={{padding:"8px 12px",textAlign:a,fontWeight:500,fontSize:12,
                          color:"var(--color-text-secondary)",
                          borderBottom:"0.5px solid var(--color-border-tertiary)"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t,i)=>{
                      const elim=liveOdds[t.code]?.alive===0;
                      return (
                        <tr key={t.code} style={{
                          background:i%2===0?"var(--color-background-primary)":"var(--color-background-secondary)",
                          borderBottom:"0.5px solid var(--color-border-tertiary)",
                          opacity:elim?0.5:1,
                        }}>
                          <td style={{padding:"8px 12px",textAlign:"right"}}>
                            <span style={{display:"inline-block",width:22,height:22,borderRadius:4,
                              background:RB[region],color:RC[region],fontSize:11,fontWeight:700,
                              textAlign:"center",lineHeight:"22px"}}>{t.seed}</span>
                          </td>
                          <td style={{padding:"8px 12px",fontWeight:500}}>
                            {t.name}{elim&&<span style={{marginLeft:6,fontSize:10,color:"var(--color-text-tertiary)"}}>OUT</span>}
                          </td>
                          <td style={{padding:"8px 12px"}}>
                            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                              {t.owners.map(o=>{
                                const oc=OC[o.owner]||OC.Freeman;
                                return <span key={o.owner} style={{display:"inline-block",padding:"1px 8px",
                                  borderRadius:"var(--border-radius-md)",background:oc.bg,color:oc.text,
                                  fontSize:11,fontWeight:500,whiteSpace:"nowrap"}}>
                                  {o.owner}{o.pct<1?` ${Math.round(o.pct*100)}%`:""}
                                </span>;
                              })}
                            </div>
                          </td>
                          <td style={{padding:"8px 12px",textAlign:"right"}}>{fmt(t.gross)}</td>
                          <td style={{padding:"8px 12px",textAlign:"right"}}>{pct(t.odds.champ)}</td>
                          <td style={{padding:"8px 12px",textAlign:"right"}}>{fmt(t.ev)}</td>
                          <td style={{padding:"8px 12px",textAlign:"right",fontWeight:500,
                            color:t.ownerPL>=0?"var(--color-text-success)":"var(--color-text-danger)"}}>{fmt(t.ownerPL)}</td>
                          <td style={{padding:"8px 12px",minWidth:180}}>
                            {loading
                              ? <span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>Loading…</span>
                              : <GameCell code={t.code} scoreData={scoreData}/>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
