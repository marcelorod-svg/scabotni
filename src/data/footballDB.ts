/**
 * Global Football Intelligence Layer
 * World Cup 2026, historical context, and epic rivalries for Manager Ego
 */

// --- VENUES ---
export const worldCup2026Venues = [
  { city: "Mexico City", country: "Mexico", stadium: "Estadio Azteca" },
  { city: "Guadalajara", country: "Mexico", stadium: "Estadio Akron" },
  { city: "Monterrey", country: "Mexico", stadium: "Estadio BBVA" },
  { city: "Toronto", country: "Canada", stadium: "BMO Field" },
  { city: "Vancouver", country: "Canada", stadium: "BC Place" },
  { city: "Los Angeles", country: "USA", stadium: "SoFi Stadium" },
  { city: "New York/New Jersey", country: "USA", stadium: "MetLife Stadium" },
  { city: "Dallas", country: "USA", stadium: "AT&T Stadium" },
  { city: "Houston", country: "USA", stadium: "NRG Stadium" },
  { city: "Miami", country: "USA", stadium: "Hard Rock Stadium" },
  { city: "Atlanta", country: "USA", stadium: "Mercedes-Benz Stadium" },
  { city: "San Francisco", country: "USA", stadium: "Levi's Stadium" },
  { city: "Seattle", country: "USA", stadium: "Lumen Field" },
  { city: "Boston", country: "USA", stadium: "Gillette Stadium" },
  { city: "Philadelphia", country: "USA", stadium: "Lincoln Financial Field" },
  { city: "Kansas City", country: "USA", stadium: "Arrowhead Stadium" },
] as const;

// --- WORLD CUP 2026 GROUP STAGE (Groups A–L) ---
export const worldCup2026Groups = {
  A: { teams: ["Mexico", "South Korea", "South Africa", "UEFA Playoff D"], venue: "Mexico City / Guadalajara", dates: "Jun 11–19" },
  B: { teams: ["Canada", "Qatar", "Switzerland", "UEFA Playoff A"], venue: "Toronto / Vancouver", dates: "Jun 12–20" },
  C: { teams: ["Brazil", "Morocco", "Haiti", "Scotland"], venue: "New York/New Jersey / Boston", dates: "Jun 13–21" },
  D: { teams: ["USA", "Paraguay", "Australia", "UEFA Playoff C"], venue: "Los Angeles / Vancouver", dates: "Jun 12–20" },
  E: { teams: ["Germany", "Ecuador", "Ivory Coast", "Curaçao"], venue: "Houston / Philadelphia", dates: "Jun 14–22" },
  F: { teams: ["Netherlands", "Japan", "Tunisia", "UEFA Playoff B"], venue: "Dallas / Monterrey", dates: "Jun 14–22" },
  G: { teams: ["Belgium", "Iran", "Egypt", "New Zealand"], venue: "Seattle / Los Angeles", dates: "Jun 15–23" },
  H: { teams: ["Spain", "Uruguay", "Saudi Arabia", "Cabo Verde"], venue: "Atlanta / Miami", dates: "Jun 15–23" },
  I: { teams: ["France", "Senegal", "Norway", "FIFA Playoff 2"], venue: "New York/New Jersey / Boston", dates: "Jun 16–24" },
  J: { teams: ["Argentina", "Austria", "Algeria", "Jordan"], venue: "Kansas City / San Francisco", dates: "Jun 16–24" },
  K: { teams: ["Portugal", "Colombia", "Uzbekistan", "FIFA Playoff 1"], venue: "Houston / Mexico City", dates: "Jun 17–25" },
  L: { teams: ["England", "Croatia", "Panama", "Ghana"], venue: "Dallas / Toronto", dates: "Jun 17–25" },
} as const;

// --- TOURNAMENT DATES ---
export const worldCup2026Dates = {
  start: "2026-06-11",
  end: "2026-07-19",
  groupStage: { start: "2026-06-11", end: "2026-06-27" },
  roundOf32: { start: "2026-06-28", end: "2026-07-03" },
  roundOf16: { start: "2026-07-04", end: "2026-07-07" },
  quarterfinals: { start: "2026-07-09", end: "2026-07-11" },
  semifinals: { start: "2026-07-14", end: "2026-07-15" },
  thirdPlace: "2026-07-18",
  final: "2026-07-19",
  finalVenue: "MetLife Stadium, New York/New Jersey",
} as const;

// --- HISTORICAL: WORLD CUP WINNERS (1930–2022) ---
export const worldCupWinners = [
  { year: 1930, winner: "Uruguay", runnerUp: "Argentina", host: "Uruguay" },
  { year: 1934, winner: "Italy", runnerUp: "Czechoslovakia", host: "Italy" },
  { year: 1938, winner: "Italy", runnerUp: "Hungary", host: "France" },
  { year: 1950, winner: "Uruguay", runnerUp: "Brazil", host: "Brazil" },
  { year: 1954, winner: "West Germany", runnerUp: "Hungary", host: "Switzerland" },
  { year: 1958, winner: "Brazil", runnerUp: "Sweden", host: "Sweden" },
  { year: 1962, winner: "Brazil", runnerUp: "Czechoslovakia", host: "Chile" },
  { year: 1966, winner: "England", runnerUp: "West Germany", host: "England" },
  { year: 1970, winner: "Brazil", runnerUp: "Italy", host: "Mexico" },
  { year: 1974, winner: "West Germany", runnerUp: "Netherlands", host: "West Germany" },
  { year: 1978, winner: "Argentina", runnerUp: "Netherlands", host: "Argentina" },
  { year: 1982, winner: "Italy", runnerUp: "West Germany", host: "Spain" },
  { year: 1986, winner: "Argentina", runnerUp: "West Germany", host: "Mexico" },
  { year: 1990, winner: "West Germany", runnerUp: "Argentina", host: "Italy" },
  { year: 1994, winner: "Brazil", runnerUp: "Italy", host: "USA" },
  { year: 1998, winner: "France", runnerUp: "Brazil", host: "France" },
  { year: 2002, winner: "Brazil", runnerUp: "Germany", host: "South Korea/Japan" },
  { year: 2006, winner: "Italy", runnerUp: "France", host: "Germany" },
  { year: 2010, winner: "Spain", runnerUp: "Netherlands", host: "South Africa" },
  { year: 2014, winner: "Germany", runnerUp: "Argentina", host: "Brazil" },
  { year: 2018, winner: "France", runnerUp: "Croatia", host: "Russia" },
  { year: 2022, winner: "Argentina", runnerUp: "France", host: "Qatar" },
] as const;

// --- EPIC RIVALRIES: 3 per major team (opponent, events for Manager Ego) ---
export const epicRivalries: Record<string, Array<{ opponent: string; events: string[] }>> = {
  Argentina: [
{ opponent: "Germany", events: ["1986 Final (Maradona glory)", "1990 Final (penalty heartbreak)", "2014 Final (Mario Götze 113')"] },
    { opponent: "Brazil", events: ["Superclásico de las Américas", "1978 & 1990 qualifiers", "Copa América finals"] },
    { opponent: "England", events: ["1986 Hand of God & Goal of the Century", "1998 penalty shootout", "2022 round of 16"] },
  ],
  Brazil: [
    { opponent: "Argentina", events: ["Superclásico de las Américas", "1990 World Cup Round of 16", "Copa América drama"] },
    { opponent: "Italy", events: ["1970 Final (Jairzinho, Pelé)", "1982 art vs pragmatism", "1994 Final (Baggio penalty)"] },
    { opponent: "Germany", events: ["2002 Final (Ronaldo brace)", "2014 semifinal 7–1", "eternal rematch"] },
  ],
  Germany: [
    { opponent: "Argentina", events: ["1986 & 1990 Finals", "2014 Final (Götze)", "three finals, two titles"] },
    { opponent: "Italy", events: ["2006 semifinal in Dortmund", "1970 Game of the Century", "1990 Final revenge"] },
    { opponent: "Netherlands", events: ["1974 Final (Cruyff)", "1988 Euros semifinal", "Derby of the Low Countries"] },
  ],
  Italy: [
    { opponent: "Brazil", events: ["1970 Final", "1982 & 1994 Finals", "catenaccio vs samba"] },
    { opponent: "France", events: ["2006 Final (Zidane headbutt)", "2000 Euros thriller", "Les Bleus vs Gli Azzurri"] },
    { opponent: "Germany", events: ["2006 semifinal 2–0", "1982 Final", "European giants"] },
  ],
  France: [
    { opponent: "Brazil", events: ["1998 Final 3–0", "1986 quarterfinal", "Zidane's peak"] },
    { opponent: "Argentina", events: ["2022 Final (Mbappé hat-trick)", "2018 round of 16 4–3", "two modern classics"] },
    { opponent: "Italy", events: ["2006 Final", "2000 Euros Final", "Mediterranean rivalry"] },
  ],
  England: [
    { opponent: "Germany", events: ["1966 Final (Wembley)", "1990 semifinal (Gazza tears)", "2021 Euros"] },
    { opponent: "Argentina", events: ["1986 Hand of God", "1998 Beckham red", "Falklands shadow"] },
    { opponent: "Brazil", events: ["1970 group stage", "2002 quarterfinal", "samba vs stiff upper lip"] },
  ],
  Spain: [
    { opponent: "Netherlands", events: ["2010 Final (Iniesta)", "2014 group stage 5–1", "total football vs tiki-taka"] },
    { opponent: "Italy", events: ["2012 Euros Final 4–0", "Euro dominance", "Mediterranean clash"] },
    { opponent: "Germany", events: ["2008 Euros Final", "2010 semifinal", "possession kings"] },
  ],
  Netherlands: [
    { opponent: "Germany", events: ["1974 Final (Total Football)", "1988 Euros semifinal", "Oranje vs Die Mannschaft"] },
    { opponent: "Argentina", events: ["1978 Final (hosts)", "2014 semifinal (pens)", "Messi vs Robben"] },
    { opponent: "Spain", events: ["2010 Final", "2014 5–1 revenge", "orange vs red"] },
  ],
  Portugal: [
    { opponent: "Spain", events: ["2010 round of 16", "2012 semifinal (pens)", "Iberian derby"] },
    { opponent: "France", events: ["2016 Euros Final (Éder)", "2021 round of 16", "Ronaldo vs Mbappé"] },
    { opponent: "Netherlands", events: ["2006 Battle of Nuremberg", "2004 semifinal", "fiery encounters"] },
  ],
  Uruguay: [
    { opponent: "Brazil", events: ["1950 Maracanazo", "Copa América classics", "small nation giants"] },
    { opponent: "Argentina", events: ["1930 Final (first ever)", "river rivalry", "Plata derby"] },
    { opponent: "England", events: ["1954 Battle of Berne", "2014 group stage", "underdog spirit"] },
  ],
  Mexico: [
    { opponent: "USA", events: ["CONCACAF rivalry", "Gold Cup finals", "border derby"] },
    { opponent: "Argentina", events: ["2006 & 2010 World Cup exits", "knockout curse", "repeated heartbreak"] },
    { opponent: "Brazil", events: ["2014 & 2018 group stage", "Confederations Cup", "samba vs charisma"] },
  ],
  USA: [
    { opponent: "Mexico", events: ["Dos a cero tradition", "CONCACAF supremacy", "border battle"] },
    { opponent: "England", events: ["1950 Belo Horizonte shock", "2010 draw", "historical upset"] },
    { opponent: "Germany", events: ["2002 quarterfinal", "2014 group stage", "growth of soccer"] },
  ],
  Croatia: [
    { opponent: "England", events: ["2018 semifinal (Mandžukić)", "2021 Euros", "small nation pride"] },
    { opponent: "France", events: ["2018 Final", "2022 semifinal", "Modrić vs Mbappé"] },
    { opponent: "Brazil", events: ["2014 opener", "2022 quarterfinal (pens)", "underdog magic"] },
  ],
  Colombia: [
    { opponent: "Brazil", events: ["2014 quarterfinal (James)", "Copa América", "coffee vs samba"] },
    { opponent: "Argentina", events: ["1990 group stage", "Copa América 2015", "South American fire"] },
    { opponent: "Uruguay", events: ["2014 round of 16", "2016 Copa Centenario", "Andean vs Gaucho"] },
  ],
};

// Normalize team names (West Germany -> Germany) for lookups
const normalizeTeam = (name: string): string =>
  name.replace(/West Germany|Germany/, "Germany").trim();

/** Check if a matchup has historical context (epic rivalry) */
export function getHistoricalContext(homeTeam: string, awayTeam: string): {
  rivalry: { opponent: string; events: string[] };
  perspectiveTeam: string;
} | null {
  const home = normalizeTeam(homeTeam);
  const away = normalizeTeam(awayTeam);

  for (const [team, rivalries] of Object.entries(epicRivalries)) {
    const n = normalizeTeam(team);
    if (n !== home && n !== away) continue;
    const found = rivalries.find(
      (r) => normalizeTeam(r.opponent) === home || normalizeTeam(r.opponent) === away
    );
    if (found) {
      return { rivalry: found, perspectiveTeam: team };
    }
  }
  return null;
}
