/*
  Wir zwei – das interaktive Beziehungsjournal.
  Diese Fassung läuft ohne Bauwerkzeuge direkt im Browser.
*/
const { useState, useEffect, useRef, useCallback, useMemo } = React;

/* Symbole – schlanke Nachbauten, damit keine Zusatzpakete nötig sind */
const Svg = ({ size = 18, color = "currentColor", style, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={style} aria-hidden="true" focusable="false">
    {children}
  </svg>
);
const Check = (p) => <Svg {...p}><polyline points="20 6 9 17 4 12" /></Svg>;
const ChevronLeft = (p) => <Svg {...p}><polyline points="15 18 9 12 15 6" /></Svg>;
const ChevronRight = (p) => <Svg {...p}><polyline points="9 18 15 12 9 6" /></Svg>;
const Plus = (p) => <Svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Svg>;
const X = (p) => <Svg {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>;
const Copy = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);
const RotateCcw = (p) => (
  <Svg {...p}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </Svg>
);
const Printer = (p) => (
  <Svg {...p}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </Svg>
);
const Lock = (p) => (
  <Svg {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);









/* =========================================================
   DESIGNSYSTEM
   Warmes Editorial-Journal. Kontraste gegen WCAG AA geprüft.
========================================================= */
const C = {
  paper: "#FAF7F2",
  sand: "#F1E9DE",
  taupe: "#E5DACB",
  line: "#D4C6B3",
  ink: "#4A3B2E",
  body: "#5F5245",
  muted: "#665847",
  terra: "#8E4C36",
  terraSoft: "#F5E7E0",
  sage: "#55624D",
  sageSoft: "#EAEEE5",
  white: "#FFFDFA",
};

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Poppins', 'Helvetica Neue', Arial, sans-serif";
const HAND = "'Dancing Script', cursive";

const STORAGE_KEY = "liebe-ohne-altersgrenzen-journal";

/* Funktioniert sowohl in der Vorschau als auch als eigenständige Datei. */
const store = {
  async get(k) {
    if (typeof window !== "undefined" && window.storage) return window.storage.get(k, false);
    const v = localStorage.getItem(k);
    if (v === null) throw new Error("noch nichts gespeichert");
    return { value: v };
  },
  async set(k, v) {
    if (typeof window !== "undefined" && window.storage) return window.storage.set(k, v, false);
    localStorage.setItem(k, v);
    return true;
  },
  async del(k) {
    if (typeof window !== "undefined" && window.storage) return window.storage.delete(k, false);
    localStorage.removeItem(k);
    return true;
  },
};

/* =========================================================
   KAPITEL
========================================================= */
const CH = [
  { id: 1, title: "Unsere Geschichte", mode: "gemeinsam", teaser: "Wie alles anfing – und was daraus geworden ist." },
  { id: 2, title: "Unser Beziehungsrad", mode: "erst allein", teaser: "Acht Bereiche, ehrlich eingeschätzt – und was daraus für euch beide folgt." },
  { id: 3, title: "Sprachen der Liebe", mode: "erst allein", teaser: "Wodurch fühlt ihr euch geliebt – und wodurch übersehen?" },
  { id: 4, title: "Kommunikation", mode: "erst allein", teaser: "Eine Gebrauchsanweisung für euch selbst." },
  { id: 5, title: "Konflikte & Reparatur", mode: "erst allein", teaser: "Wie ihr streitet – und wie ihr wieder zueinander findet." },
  { id: 6, title: "Werte & Lebensentwürfe", mode: "erst allein", teaser: "Was euch wirklich wichtig ist, einzeln und zusammen." },
  { id: 7, title: "Geld & Entscheidungen", mode: "gemeinsam", teaser: "Verantwortung, Sicherheit und wer was entscheidet." },
  { id: 8, title: "Nähe & Zärtlichkeit", mode: "erst allein", teaser: "Privat reflektieren, freiwillig teilen." },
  { id: 9, title: "Außenwelt & Grenzen", mode: "gemeinsam", ageGap: true, teaser: "Was gehört euch – und was gehört den anderen?" },
  { id: 10, title: "Balance", mode: "erst allein", ageGap: true, teaser: "Fühlen sich beide Stimmen gleich wertvoll an?" },
  { id: 11, title: "Lebensphasen", mode: "gemeinsam", ageGap: true, teaser: "Unterschiedliche Zeitpunkte, ein gemeinsamer Weg." },
  { id: 12, title: "Unsere Zukunft", mode: "gemeinsam", teaser: "Eure Zeitachse und ein Board mit euren Wünschen." },
  { id: 13, title: "Alltag & Rituale", mode: "gemeinsam", teaser: "Kleine verlässliche Momente – und eine Woche zum Abhaken." },
  { id: 14, title: "Unser Manifest", mode: "gemeinsam", teaser: "Alles Wichtige auf einer Seite, aus euren Antworten." },
  { id: 15, title: "Unsere Liste", mode: "gemeinsam", teaser: "Alles Praktische auf einen Blick – zum Kopieren und Aufheben." },
  { id: 16, title: "Brief an dich", mode: "erst allein", teaser: "Warum ich mich heute wieder für dich entscheide." },
];

const USE_MODES = [
  { k: "abend", label: "Gemeinsam an einem Abend", note: "Nehmt euch drei bis vier Stunden. Handys weg, etwas zu trinken, keine Termine danach." },
  { k: "etappen", label: "In mehreren Etappen", note: "Ein bis zwei Kapitel pro Woche. So bleibt Zeit, dass Gesagtes nachwirkt." },
  { k: "getrennt", label: "Erst getrennt, dann gemeinsam", note: "Jede:r füllt die persönlichen Teile allein aus. Danach setzt ihr euch zusammen und vergleicht." },
  { k: "checkin", label: "Als regelmäßiger Check-in", note: "Einmal im Quartal oder zum Jahrestag. Ältere Antworten bleiben erhalten." },
];

/* --------------------- Kapitel 1 --------------------- */
const STORY_HOW = [
  "Über gemeinsame Freunde", "Bei der Arbeit", "Online oder über eine App",
  "Beim Weggehen", "Über ein Hobby oder den Sport", "Zufällig unterwegs",
  "Über die Familie", "Ganz anders",
];

const STORY_ATTRACT = [
  "Der Humor", "Die Ruhe", "Das Aussehen", "Die Art zu reden",
  "Die Selbstsicherheit", "Die Ehrlichkeit", "Dass es sich leicht anfühlte",
  "Das Lachen", "Die Neugier", "Dieselben Themen", "Dass da wirklich zugehört wurde",
  "Dass es anders war als sonst",
];

const STORY_REAL = [
  "Beim ersten gemeinsamen Urlaub",
  "Als es einem von uns schlecht ging",
  "Als die Familie davon erfahren hat",
  "Als wir zusammengezogen sind",
  "Nach dem ersten großen Streit",
  "Als klar war, wen ich anrufe, wenn etwas passiert",
  "Es gab keinen Moment – es wurde einfach",
  "Ein anderer Moment",
];

const STORY_ADMIRE = [
  "Wie du mit Druck umgehst", "Deine Geduld", "Deinen Humor", "Deine Ehrlichkeit",
  "Wie du für uns einstehst", "Deine Disziplin", "Deine Warmherzigkeit",
  "Wie du zuhörst", "Deinen Mut", "Wie du Dinge einfach machst",
];

const STORY_GROWN = [
  "Vertrauen", "Gelassenheit", "Humor", "Selbstverständlichkeit", "Geduld",
  "Nähe", "Ehrlichkeit", "Eine eigene Sprache", "Verlässlichkeit", "Freiraum",
];

const SPECIAL_LABELS = [
  "Kennengelernt", "Zusammen seit", "Verlobt seit", "Verheiratet seit", "Unser Tag",
];

const MEMORY_KINDS = [
  "Ein ganz normaler Tag, der hängengeblieben ist",
  "Eine Reise oder ein Ausflug",
  "Ein Moment, in dem eine:r für die andere Seite da war",
  "Etwas, das gründlich schiefging und heute lustig ist",
  "Ein Abend, an dem ihr nicht aufhören konntet zu reden",
  "Ein erstes Mal",
];

const MEMORY_HINTS = {
  "Ein ganz normaler Tag, der hängengeblieben ist":
    "Meistens ein Sonntag ohne Programm. Woran erinnert ihr euch – das Wetter, das Essen, ein Satz?",
  "Eine Reise oder ein Ausflug":
    "Nicht der ganze Urlaub. Ein einzelner Moment daraus: eine Autofahrt, ein Abendessen, ein Weg zurück zum Hotel.",
  "Ein Moment, in dem eine:r für die andere Seite da war":
    "Was ist passiert, und was hat die andere Person getan? Oft war es etwas Kleines.",
  "Etwas, das gründlich schiefging und heute lustig ist":
    "Die Geschichten, die ihr Freunden erzählt. Welche kommt euch zuerst in den Sinn?",
  "Ein Abend, an dem ihr nicht aufhören konntet zu reden":
    "Wo wart ihr, und worum ging es? Und wie spät ist es geworden?",
  "Ein erstes Mal":
    "Erstes Date, erste gemeinsame Wohnung, erstes Mal bei den Eltern – was davon ist euch geblieben?",
};

const MILESTONE_IDEAS = [
  "Kennengelernt", "Erstes Date", "Zusammengekommen", "Erste gemeinsame Reise",
  "Zusammengezogen", "Ersten großen Streit überstanden", "Verlobt", "Geheiratet",
  "Kind bekommen", "Haustier", "Umzug in eine neue Stadt", "Eine Krise gemeinsam überstanden",
];

/* --------------------- Kapitel 2 --------------------- */
const AFFECTION = [
  { k: "worte", label: "Worte", desc: "Gesagt zu bekommen, was jemand an dir schätzt. Anerkennung, Ermutigung, ein ehrliches Kompliment.", give: "Sag einmal am Tag etwas Konkretes statt etwas Allgemeines.", miss: "Schweigen liest du schnell als Distanz, auch wenn keine gemeint ist." },
  { k: "zeit", label: "Gemeinsame Zeit", desc: "Ungeteilte Aufmerksamkeit. Nicht im selben Raum sein, sondern wirklich beieinander.", give: "Zwanzig Minuten ohne Handy zählen mehr als ein halber Abend nebenbei.", miss: "Halbe Anwesenheit fühlt sich für dich schlimmer an als Abwesenheit." },
  { k: "hilfe", label: "Unterstützung", desc: "Dass jemand etwas tut. Aufgaben abnimmt, mitdenkt, entlastet.", give: "Übernimm eine wiederkehrende Aufgabe ganz, statt einmalig zu helfen.", miss: "Schöne Worte ohne Taten klingen für dich schnell hohl." },
  { k: "beruehrung", label: "Berührung", desc: "Körperliche Nähe im Alltag. Die Hand im Vorbeigehen, eine lange Umarmung.", give: "Zehn Sekunden umarmen statt zwei. Der Unterschied ist erstaunlich groß.", miss: "Ohne Berührung fühlst du dich weit weg, auch wenn sonst alles stimmt." },
  { k: "gesten", label: "Kleine Aufmerksamkeiten", desc: "Etwas mitbringen, an etwas denken, eine Kleinigkeit besorgen. Es geht um den Gedanken, nicht den Wert.", give: "Merk dir, was beiläufig erwähnt wird, und komm später darauf zurück.", miss: "Du merkst genau, ob jemand an dich gedacht hat, als du nicht dabei warst." },
];

const SEEN_MISS = [
  "Wenn ich erzähle und nebenbei das Handy läuft",
  "Wenn ich etwas geschafft habe und niemand fragt",
  "Wenn Pläne gemacht werden, ohne mich zu fragen",
  "Wenn ich mich erkläre und trotzdem nicht ankomme",
  "Wenn nur ich an Termine und Besorgungen denke",
  "Wenn ich müde bin und es niemand merkt",
  "Wenn wir tagelang nur noch organisieren",
  "Wenn ich nachfrage und nur „passt schon“ zurückkommt",
];

const SEEN_WISH = [
  "Mehr Umarmungen ohne Anlass",
  "Mehr ehrliche Komplimente",
  "Mehr ungeteilte Aufmerksamkeit",
  "Mehr Hilfe im Alltag, ohne dass ich frage",
  "Mehr Zeit ohne Handy",
  "Mehr Interesse an meinem Tag",
  "Mehr Rückendeckung nach außen",
  "Mehr Zeit für mich allein",
  "Mehr Spontanes",
  "Weniger Programm, mehr Ruhe",
];

const SEEN_Q = [
  { k: "bewundere", q: "Was bewundere ich an meinem Gegenüber?", hint: "Ein Satz reicht. Aber der soll von dir kommen, nicht aus einer Liste.", ph: "" },
  { k: "unverstanden", q: "Was versteht mein Gegenüber vielleicht noch nicht ganz über mich?", hint: "Das ist oft der wertvollste Satz im ganzen Kapitel.", ph: "", optional: true },
];

/* Bilder für die Qualitätszeit-Auswahl (Kapitel 3) */
const QT_IMG = {
  qt1: "data:image/jpeg;base64,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",
  qt2: "data:image/jpeg;base64,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",
  qt3: "data:image/jpeg;base64,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",
  qt4: "data:image/jpeg;base64,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",
  qt5: "data:image/jpeg;base64,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",
  qt6: "data:image/jpeg;base64,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",
  qt7: "data:image/jpeg;base64,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",
  qt8: "data:image/jpeg;base64,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",
  qt9: "data:image/jpeg;base64,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",
  qt10: "data:image/jpeg;base64,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",
  qt11: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgwKCA0MCwwPDg0QFCIWFBISFCkdHxgiMSszMjArLy42PE1CNjlJOi4vQ1xESVBSV1dXNEFfZl5UZU1VV1P/2wBDAQ4PDxQSFCcWFidTNy83U1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1P/wgARCAEYAZADASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAgMAAQQFBv/EABgBAAMBAQAAAAAAAAAAAAAAAAABAgME/9oADAMBAAIQAxAAAAHiZdeWXRBGjqoimrsKuiBjQNUwSBO7SprYWFga4hwxEqREvQylmly5mcwYACGurqaZYEqs87kOJdzTN3P60tWToaWctunGEz1nqSRQXILMal2fSlCqZTS6YDUuoBOWcthgaosbsrVSS5kuIs1we0seyatGjOAo0JcwhNi6Kha4qRblMUDXJOabZsm0dXDok03zxYU5bqnQq0siQHTNo3QtCnKml0S2rCRqXKET0GqtpFLypfLWe5bltt1Z689XaUHK006pPPozoFG8GsxaIGOtYNWpqk7JRAfR53Yz06p0eGoJ0LDgxlaRybut8XAZJ5IVXLJIGhTUxQ3QCsITQWwQIh0TVmDFWZytDeMzYFxyVWmsjAGsDLy3INsvNNUHlpyXNC2gSLaaTZ01fZ5HXy02mu8tWAwQ5gwannjc3x0gFAIy6m7ohvW4M7zFVOYJRlsDRNLcxkUMO08wORYDc7HO08dK2ojBZZvJrk6xRUdWZuzjrxluTcWkquWFXczvzgPRpm1qnTVvTIvXvx9aLxvfzWhRM1S9ecLnQKBqRGgqOqLZhtiB91KVMGkTkWh+jnLDpKxNb0ELI0wlqx3nsfzdCYFkc1vbgubJWtgcvp8onBqkqblRkYuIuUIPMFzW0JJrX1uJ0s72zLY242rayo0ouFLau5w1daZ9i8NY66ry2BZ2IuJKupkkCpcB2rn3N9QMQzQDY6ZW9BquiMrPbSEifOqq0xZFvAye6XyA6uOkgtBozL2UAxkVZ9yIInZ4NyhsVXIwlMWGKrrTPWJDFyDQhGSpl1AuVYSSBJdBKuBKuANFBnpxFNbiTUXnG60zt+dqOnadEWWDegMxmI5d20FnACHYBCoM9rY0VFAizSGWpNM9iyGLESBzUkakuAJDYXdWFXIFSWElWA3b1WcWAImJcqBbVNWxbQ2ac2mLIY1PntkHRCTm7UAaJVoizQzM5LWm3Vp0l+drJJNM7Yu0MqtE2mtRTWKuhnqcsq6grCwKVAkaKYyo0zTl2Rac+kB53oe5vPpQOtCNaDanUqpmfQmANEaQXnqCetgNYg0zy6MbUYsgdYknefTlayyTTO6uhM0ZXxq00VFaM0CpXGnUpJ5TSnTRNkEieJPW5mmQ7MOoTkMGaQbxYzNstPFrzsEy1LA9KTHspBp4A3KqUE1iEXpAasenLUsMCTM1mmeXTkaRJNMyExFbktjQyXc0VhBnAgMrODnc7n2GxqZFvy7Wo4OjpXUZB3xVy9ABU2TKCPzANx5mJvJYp6WZRDcvI4GBrWLNYMZIwgQGyg5Y9XI1nzORUqklwV1BUwKTZFMVHLktYPjSK0iwejg2xTHrLO3ps05b0otlWPn89qNstKVhSaSXJuNRRq9mY5eoWGGdepQZt+TLefa57xQoggNdz94EtyWL5XX5NQiSaQUGCIZAvRT4uzopulPgYh1JcrOgDoXjdF6DQUvS7EIbsWZdSLDOhJlaDq3j56exzmr3ZtKeximJxL6Tw4unhFkcsaz051VS0buaxPRrwPVN5HU5NSuSaRJIEYvQm06vPQyA0WUJMVtpmIdWWoACqkUvQjLemJqYYp9ZGVAGzK4Hs0ompl0ZWpoya03kzPNaW8NwdNfMVUUhidIkpjmEo09MScVWbTlsqSXF22S1vUxNtAU0ZpYBGADcSGorDpx1MsLqeqXNibLRA2O5+uaSFDUt14dc10sOnmzehKo5pgEPQ8+pjpz8npuUHIzdNVxzQenbEbG6VnWmWs6GbPI9FTUkudFSRUlQGWNqoS4LQKmAUS4F2QgK2IaILqlUkETksTg1Bnpyvl7ee9E1cqAdrtPu9zyfVy07uXKhzjzxKrPlenowq5dSzZl1TSKKRonNryaZSSXLZJLq5AZJJoKkaKSDkkRUkZUkAKkqZJBWcgxqRMikTYMk1Kkaq5GjZJFEciqhkRmCTXKXI090k0uSRovLJplJJc//xAApEAACAgEEAQQCAwEBAQAAAAAAAQIRAxASITEgEyIyQQQwIzNDQhRA/9oACAEBAAEFAj7L0el8aKiv0sei/sydiZuNw2f5x60bpLwxL2ZW4Y//ACuQvxIHowRKkMchsydR6H34rVcpaM3m9m9nqEZl3o9P9Mner0/zj1ekuReGH+v8hfw9RciU2MY9MnUdGV5fe0SrWUr8lKhSsei/sy9+P+cemJ15YJVD8if8OTLWJZLx7rTYxm7nJ1HR9srivD6uhPSb4806Pr6X9mXvR606TE7HwJ8LkWKZ6Mz0ZkbhHPP+PNP+Lf7YT9m4lIbF8snUeh98l+VWooXBk71jCzabGVWkD6X9mXvx/wCPpDOz8SPuSKKJr25l7Mq/iL45GMj8sgtGMrReEbFpk+Xp8aY0JG3iUDZzVL6/0cUz00bEbEemjYP42PTk/D+KZZZIz/DN/VpGZKI0R+WQWjfK5LV+Ee+pXpL+x8LJGjEixZERqWj0+nDnbI2yKke49x7h34/juoKRuNw5Gf45X/HekeFYyPyyC0mR4jV6JirRcFbo7eDKLmM+SPVcNSQl7sk6LFJkZJ6VoxWzazayuWVokYcuFQWf8YbxTPV/HHPCZ1xli/TrSyxkflkFpNHYmVwiJVqHLUdr0yRtHbgRJUtMyNg8bWkJ6fUiB9t8vvbw+/td6QdGMguM8P45Yri8UT04m1FIpHBPvdpNFNnTREjwQ+KorWYxMv2turlW8b3tR0cd2mKVjxfwZFREUGOD0x+h6GSlP7j3pKSiY+sfCyx3wcvyCSzDjkNszbI2s2j1n1/zt9tpM/zUU4wsU+HlihZJPT6a5XWN2J7TLL3Q4IuJJJwuTJxpRdOP5bhjc7LNzNxZvOz2icUbo6PmWIi+LLGSQx6S61kva+W+RR9y7tbd1Nzb1hKtETjY4tEXTlyMjRu4ixKxpU+H2V5/aH8h/K6mmbjcWNkh6S603Ico7Xo/m+POE6Iu2Pgk7lekSMdxKNSXK53T/s+LKFBDxD4L02nQ/kh/K5Cn/H6kz1WerI3S0t6S68LLHL9XqSHJvwTMbJ2pQm64Sv3PSJBWieNSKSKWrXm+PBdT68n+370jOjfwpWZJVFd6R6jxix6ZVtktPtC8pi8J9aP/AOOtE6EyfPgj/LHxBGYr9UvmvCXWj1f/AMcXQ3fgjvB9f9ZFzkfv+vOXX/S8Mmr1f71y9o+2ISJKtV1j5x42Y/k3Qlze56SltFJ+E+kLwyeVWbWbX+2Py+nynouCesUYnUl7Y4+mTOIr7lOjtoWuQj45f1TS84wbJRcXpHtD4c1pHkY9MZ1NkGWMqozlz2Lxn2Lwy+Me9bMj1o2iiRicIdMnBrSJFk1Yhoi6bjaaFEhwP55Z0R6jRY+pY5X4vp9+OTxj34VZtKFErRcJ86USjtku6FImqEty20QJK1YpF1J3OWwUYs2UKyXdnp2LCekh4ySdLyyeK8K8LZu03FbR/Bu4ZtI8NRb0XDu1Ymz07Ekj7uImi4s3RrcjbGR6SPibzbI9xaOGenFjwEouOs/FeF62OWi6UWY2xblGGKSJqOSMYpk1teOxRW7JHa4/Khm89Q5YjaUUbT3Ihm5TTUsY24PcX4zxHKJeV+NnOseSOO3VFLYvh7dqpKt0Ghqn+Q1SdNsvRaLSJtNpQ4pik8bhO04pkobWWbyL3D0Zk784nBtZT8Yu1u9y7UtokoOVMxp4ybolKzNK5ll6IsssTFejWk/ipbJQyE63TlRFrb3KCHrk+XmoiWriNaxdMiKSRUk29yhL1Fue3LlVVZtNqEhIeNEoOJuIox9xWm1EojRkQmKfuzSsviIsnG93XD4WT5eUV5NDRWilxvQpUJtilw8kdssvvS0plMSLorTJDbOJEWt0ZFxksjyS1jy2RtHqDnan8vGK586HGvHnShIRCEYLLlPUFkExiPyCPUO3JRFlRvLttomtynHa34Jm4lzo+/GHX6JePoyPTo2Hpspo3umkzaiOJMhijGM/7D8jqPWNnDJ4h7okckrnNs9WRKW7zsl4UVpDrw3U2XyMl3pgUduTKOZ6gsgnZN83pAT4l87M3KiIjuYsMmS/ElGOxocR/pfXkuvDtRZLhWORLvRSaLTODg4Iy9j0RATJPnwwdQiZFalAnF3HHzkjtk/CESh2jdx5rwTJF8XxRQ1xAl34LrWJft8fxEmoxH1OJn9rhL3Zvnqj/nSS/R9a2drvTg3G46bd/piSlx44cm0h+S0f+rh/kWZpXJMyfLVH/Ok+vJH29bE6/dWta2WWKzebyMiTtkvCJLrSfWv/xAAfEQACAgIDAQEBAAAAAAAAAAAAARARAiASITAxQFH/2gAIAQMBAT8Be9l6OL8Gy/B6seqKmxl7Ioq4WJwKGUUVOH2X4qMSuxl/0s+lTUYdFlji9kJSmch0zgj4LscJWMQupetRZyo5dw+hMT7LOImXFll6ueRY3osqOcLWiiioRfumX1Clr8ShDF4KHKVnAeOlQoQxaNy5c4ljOJxEoyxoXm5cqbHkcyx9o4laUUVu5TLmjHVli1+OLnLRLWyyyypc2OnDYmIyleFT3DFLY5RlFC1cWWJwhykLtDxHCjL0ULSuS6McGi+zL7CjL8SZyeijL7H/xAAfEQACAgIDAQEBAAAAAAAAAAAAARARAiASITAxQEH/2gAIAQIBAT8BW9FbVv2JeK2W1obihFbMsuGzkWIssuc/kp+Lm+ooqL1z7GiheDLhDKPhyPo+hQ3Qhj7P7C1uKZwOMLsoaKLGrKiiiocqeJxEtHicYetllxRRSK9mpf5XDEPyUt0chZaXDEMQ9KlSpyKEWchuMWPzUqXpxOMJ0zmctb8FpU2ZaooetXrjo3Nw0UULEuVouoqcZfhc9QhyhaYxY9VFFDUMUvIbpiyFDjH0cPS6fZnmsiujH5DjH8TRShQ4x+R//8QAKBAAAQQBBAEEAwEBAQAAAAAAAAERITEQAiAwQEEiUFFhEjJxgWBi/9oACAEBAAY/AvaHQddRMn6lda8T1UF9xQXD9GO1BRWJTKp0m7K+5KvTXg0iJthdrlllll+xIo+zwp8fwVH4LLL3Nr06nP1URdENZ+qn6KRT8b4YXME887Fyg+5c/wCkoUUUVwth+GD0jKShGXRIwyj4XKC6VtSOBs2WWWXtdR8sN5G8kwfJ42qeF+lIjF4+EHTC6cWWXwINzMMmFEQ9JPDN49R6dMZYblQReW8/3gkjhbyK/gXbHF9llYvq2Su9tKNufNFFe0MnB9cad503JnSJ7emkYQRPbtSDjiqflqIrrV2NSfGW8qJpT2Cdr8K/aZiyfYGU+uB02Jidnz3XwwyjZZR03yOVj0qThmILLIkrsRQ44i5id8Jmy8yQUQfsViiiFJ6cHy5UCEMomn4Hvw44rI+F44UnEQeovd6Sei0kL/BnVVIvyavx8H56tIztqU/AdBkH5ZoScR0JxW+D7Fah0oREtRtVn/oTjra3jEE9hZwzWougT8L0+CUJ/ZCp4ZPrH0RtnYr/AOEdRij+CSgutFbV8CaksfSTiuD+Zgk9Iypwr0I6KcEWT3aLxBI2LLEbKbIPnN9WcNufzxriMshKjunZ/FRF3zsVOSnP1I7DjYftL7M3BX/Bf//EACcQAAMAAgICAgMAAwEBAQAAAAABESExEEFRYSBxgZGhMLHRweHx/9oACAEBAAE/IR7cfQbTQlzxCjiNPyO2GoJFoXwXw24dcD4lGI0Gh4Rsa+cgPVeFxgDhvF5TzgQ7fYWugmpEMl2KEvj0cbR8JeS4g+hLwpI1kRF7CGSyxx4g3PZlCdLKyVbUfgSZIe+HQhq4TExijGscbE6ZIYopSi3iyQ+iaHOxm983fFouMWxdmd/BH8EPKKMcLRZ6+K9MZiIc0OuHRxB638GkyXFUbsEUpRwlhmvRSd6IS+Q02PClxaLhQlRiH8HWowiu+Jwu/h2d8XA5sFqcnRwvRc58nA9Y6EIJVtNxlNFrGCiPxExMKT7NMTLzDAQh4Rz2NgajRzZekNlU4JqexK8LConjzxa1hXgzV9cogG/iHiGzaEVG3ydXCwXA+GY4JWWyN0VaDLeOWznH9HNTKEZoSbfDQao1QjYeLA43tkGjNvix4GZ4ZnmcJ/A2p3K4Wxm2hLEoR4Ni8C4BF7n4NMGvkxgSxJm4moLsbDyI5GqE/rhhrsY3GqKZBmg1RqhGqNXo7ApRMUWz0TuJZehK3OMWE7bsoshsY4QgMjDR3XB6EHOTnwJk4p+xhyyN4PsQmyD8WG/visbYgOx/RoOpqIdX2Qwpl7NM1VaLN09kZNZIwGnyhaFiBVbhrP0MmIiC0IQYf4BeTSbyMMVNdsbN0S7otmmJcIYi35INkqZ6mp2dopQHg/8AhTO1Gw8idr9Q0sFakmhEgYWGYa0MMajqaCEVMbWYHNx4N4aCWxFQ6C0SDMGmQh+HZhFDBzsyexGN1DjyWj8ixEFWUaeC2NhaGtpjnJ+WD8PgU2RYRY9hteuET+wpVDEx0JCsuPaOo19B+MPwIieB6hgQwKjQXR1Ip+hGV2V6CVTexWdXCcN0akDB3s8CqLwyxpktLqBSVojEPXhIfX/cHhYMdh2NXoipnJTkp0PDo7E7vBZ2RRmUIYJR0ZO12IklNHHs08T6Hd4Oww/JH5p7hfkYcQ0iUbcJsgmHsW2J/ZTMwm31CFlTezWP8C45H0UlEiyTk1dk0wEtwn/A0DTk0hLjsejj7PEfa49GVhs7xg8D2SvM2yxR2NrZiXkzumKwjdjZZxuLD3moPge+IYn2JDoI26DsaXA9k7IrS+x3W/XNkembYgkOIP8AExsWGTb9itnRGTQXkNWGJ3o7/wCxkdkJpTAhCEITjHjjulw17YY+RmgnB8T3xfyMTtRFtFSVE16yIZz56GgvKo1REjb2ZgryMfGdGD4E4H9DQ29BYHdg/oJRG+xOx7bZhrfsVtGo+CyLO0gcZumobXpkdtReASXZjZqIbtuV+X++DfE+K4UXuJujF/hTadTgkjejNviYohTJGeH2Jm5Xo/YH2NRJ3yOq9jRi2uFwJVwUe0N8LoQSEzGkdih1/wA4hPRCDTWdaMf4QxRv8iFsXh2LyjP0NRGKN98LyzWBw8fbM6+GYdslNZZNIm4m/YsRCEIQfKGhCC+FsPhvHxevklw9QkQux4cWcQw7UH6Hljwb/aZDZnnoTPkOMsHYuITiEGNfgaL5b/4D+MHy2NQjZs0xmhAPGeHng3+BoWfzmJ/hHtizGO8eE8MiF8mjCz8TTls/4Hf+HQkEMLPofwbDHoZyQfgJSnNgr0Cr94rGSEJT2PbgneXG7fBc683NE+E+R6j2uXv57+E1aW0InPsQRbGa4WyiMSL+GDBbjpitpJns8IXlAeGQhfZXZ8WKMbJoIXzJiyxaEIlWciaqx8ssa4/pIJy+bE7X6NFjyilaOxMJoToQRTfoh7uxxX0RtsdNp1Gmh5nlSLeTLV8VwnjhqEosDCF82gomJrzx6OaEx5RTcgloU4JlVng2ReiKrY9TuHwyuuKMmRt9CJMGYKwLnQkr2RMDpwJOwlN4EIQmMGpTEIQjf5CIQjXY6C4rGHPM9BNNUs+GJV7iwHhyVQ5eET4XaIE2OmehooKx7FGxPWyqK0IxSnsrbpG0TX5E2yM2sY02JYZOnAak8h6eSRCDaG7fCKITNuXxuJi5RGCogRcsTXTEjUKyy/0GsNrItabWRfzHehsDqZoTbtJC1Oh3/wCQ0t3xaecGet4F8RfJlNcpi6UfSFGiS9GRWvGBNeX9expYLwhQuN8jq+K7GzWX8G3aPOtCp/7Ihh7PVf4PAr+Hd+40j8lEzf4NG4uLwrPshD3ringZLTRGk14II28HcMRkeW/BjaH9Gsq+nhn/AOaA9S5dtoTsu08TRgfVyS0dkdjqFobF2s8UaFGmUQx7qfZFFafaZveZWLecnogVx5WmJehDwxJZmMwesFHJlCXnD0NNwg9fx06IXiovkd6I3TI+FqCII9t6MGS2Bzp0CFeP7GBeAXTyyZB68kK8AnQ/G3siIj7FVdc/og8N2UekwJBMZPYwxX2LcoTqbR2iVMsCBpqrwzOPjwJtdMUo86ITCEgyXUxEsfnRbkTrX9FP+yG/9FXkq8mDTO9c7PAXhDpQ0mxE0ZTAjQpXVGRgKcFmC9ZIEo/CIoZPaE79YHoeJ6CTfoxQghHkzKDa0W7U4GiWz8DLs9DFliutRjnmAwFq6JP8cWNYfn/BJV8UFjlT9Ef/AIZXsqZvFRZUpX4Hlc9Vnd+wSiwmt+US21p2JvbwJjz4YyQlEitdk+D1IQuhD2M6x9CarK4VV/QSpiaCXmiz19Bs8CHRQnBujAYxHhowxY8dbLIaYCdIVIxGwb5pr2JCFxOGe/3waaHLIUwka3kVgs7YF2Itp3+GP3cOsl5XksyZS7vBP0w/GM8GRLyOCVGUSwxIsusfC8tgbwJujz4MuopvLnwYtoRPO/IkeR2bKJgouYhKuUWaRsFiN3ytQkLmEIPHH6HerwJ0ZWZ3T7GRM+xCMmkKjSTfliFdGTyxXTE29lJ57GGiGCCVEkIY9zYxK8rsSy+NiRC85E1lrLLyiBiNGM28ulKJw8gn6Z2DWPmLyTExcPhaqP8A0UW6JNsUU3C9j7gl8mK5D0hDJgcXPE7AO5K35Nj6QnwG8hKSslxk3+xG2HZKMo1/RFPGSDo3G8jeBbIuEL0LIbA981wnBSiELAD4T8C3u9DwzQwbhCHcMEpVigSJQg84p8MQasF7EKTViNLI0do+fY3wflihVR9f9D5SOhzmiEmLGxKiwPfwg0NEQ3XFxRMaXAFoesGWySGvCmtfMPsJlKUXwGMQ1vnsvKF69k2nYZe4PuDQ9mLcsqpclwxqvQ8uA6yH8lv642lEyhlEJdO0Zs0Oqx1M4yQk+BDB8IccO/imJdELRkKoeJTiIQSFFh+cHzpoaQ2JmDp2ISaQWF4G/JDTyMNvB8QhPBeEPC8ClLwjRog3R3oQ7sSxCY1Z8ri+NG+bY2NhlNBmhS/DZJ8Fw1wSYqLDi8K4vFEyLKvfItXyuGn5n//aAAwDAQACAAMAAAAQhJLDXVfn3JbAiDT3sFFXQenWa9EVc/VyM3Ew06IVCVmMfcGm4P8AYPj5N4Iz33C585feFEu39YsBaQ483rHHrGGH+C0ncP8A4ZekHn3X9wSZtgciu315IB31H4ABFyTcvGikmA7KMqnmN/y8rI0ehFNqj4oksNNLrNwB5YzNCkmB3hPDgBgles88NssS7do/O+axzg6BEIhj0eOKv2skxdpwkHGFSx9zSYaishZRoseIdIq+BPjI0igTARTTj0wsFBbY2lv+GCdtKYwsiSDibxWo3jj6Xffdoqfy1MXC9Cjazjy+vwftRJFWexETrz6FxEUZZzvx1kv5h/ZBeGGiqTLV0hMOyygdTATIOpAlQk6kZPPWuvudQNx+wDMv8lTLZ7W8uM8KvjeXkc6bwMBu8Caml5/ivMS9NNdWM9/ftBdSGEIJz+CLwID13wKB/wA//Ddc/A//xAAfEQEBAQADAQEBAQEBAAAAAAABABEQITFBUSBhMHH/2gAIAQMBAT8Qm8ERNixDvDeobV94HuIkF7sD5wKn2Syzgz7E/nIw7w9c73P6ShfkD9lDYLIyY+8PVvC+MRSc4JJPyMXxLW3bmH5DY7EPbJNNL7Ps9FqF7ZDSNvSQe9o8ups92HCmWTMlrWNuEf5l7OzN7vsnV2QfkNMumyzO76WD5IcLosVYGwxnU4RxvMvV4WyPyX/Jf8l7smd2D2PIhvbgKtyV1GursShhKfbWEX/i0FvUOnDweNf1n9SPy3vZ492mXvcv29sSyB9mbJIUq8PnO/8ADJTq1Hy9RJYWWWcFk+cv/AbJLrL1wIs/eN4eXjgeBiU/jQbnHmTeA5jDdnUcKOPPL6tTUyFH7jJ7vYTt+2fZIwli2yBseBx55fUNpw/GF8I/EeiM/ePZ1ZdEa5kJEgssJMn1zhGm1k33iCOMvJasx6wlpaMhL0M/vAd48f1ZJlqQYmCW9ECwsgnkcGLJdhto7YEv28cjWOWTOMieTDMT2XUi20YB5DKXLo2222zt5NLe53aTeoCDNYEbvUMceBrAkh/gtt23bJM7n3hcLjSGWGrv2Y7Lgd8Z3+j+Hgsgm21kLSHqfePf8X//xAAfEQEBAQADAQADAQEAAAAAAAABABEQITFBIFFhMHH/2gAIAQIBAT8QmX/JmYhWp4I8k4fOEmYUOrV94AI8hth4Zj95yTIvHOR+pn9kD5AuWyDEPOCzPOP2mAA3hRh/Z1wAFixEn2eUyby/7bD3fI8iwW8tl3bPgyukY3Zw46nEdttthjCxNbP7idRkF8jy26benZ47Pa2XUPkQ1ba2cE9ZLSM4z029Q8T3Ah/YP7B/YLYhh5KeXbtkh1wgThuicXRjWsA8sJDwwtncO+DgcYsWff4Aw4OoaX2TLPl5agyvkOe8EPEA4Pec/wANhe7O49vExDbbb+B7yf4LIYG7yPD/ADjOCePXCcDdp+GNzj3LHg/nFng/aeBPHrkd2Ig7JmJFr08f5b8YcnWCeNZS3g8e+fcljZH7T+zMMIfl/V0m23bLnDbWEbbbWHY98ps4LqHPOLZeN+27HAiDCbGxhjDSGyzIvX5Gxq6epSVbYTttNrakh9njLU6WOknfHrlYWzwQ7Fsz2JJo+Xq1I2JDSE9SSfgdizjLI2cmFkIZHTsrNuEuDYHctNOFewT8csyy2OzI84FkOMZLD4vGiBg48cbz/I4bZYgsIGyn28cePwv/xAAnEAEAAgICAgIDAAIDAQAAAAABABEhMUFRYXEQgZGhscHRIOHw8f/aAAgBAQABPxAhr2QW9eamIXQikJQDqoKHhlqN1C2g3HwCO11OoQ4Ymfgm0PhIIFBExn85R6JS5oHEtwlDU0xcnsn6UNQh3JV9ofAZa8IwrQXFL/MGplrXlDcf2QSvqibwQY5uKUDP6QQ4JZA1c28/AmdJ9SK6HEVvfMLFCLOAckOplOZcK4TVgqlEtX9A5jBEZwS8UvRKSD2vEBDpY2zCbLPj1I6T+c/Wlyuvg4CNp/H4QG1CFjFXaqmKXCkJJv8A4nB8n9hd1oTqiXoIPE3hY9xTYmv38KsQ3+VxE2UeZnIirtlSsS2AxW4ZAtdorI3/AAeJzKCWNSUjU3OJdcSzqJG0GHIXPNxlTkqZCODMvpP0oEGwV3R+Hf1P1oRSritu7XUVsmIh8DAhslArKn9mk0UjIS2gA8kRllhG1Us0KxY+/hViX/e4/o4jlu+ZWgPExXxd+5Z5ncSALvlmJYJxGPFyfEdsdQLxxEqvETCiUthsiU4zzMB0+YJzvmJhP4TD1SyJuMDEsmIjcSjMcFoTAmri6RKsUIhJbgh5SPbHjY/MHx/MI2VzxDa2x/YSR0QQ6hAhdQayUylTJ7l4q2Xe0i/JP0IGJshZj/ZCkoY0rxr4QVcFqPFTCEVeCOK4XUuB1zFlrOGLB1Hn4F4Dcsnk4iGiTudxveXOI285hSGOCVhP4T9KBCC+YJVwWs5i/SC0AFbhXADiB4ZdRY2gjkZpRMcDUCWD4lH1Qg+iJiMeyBpVLFBAqvEH5Z+1P1ppDnHoGe4xNslS11zNhqJq0ELEdkFYKnLDplslHmJGoBaioXMbisL0MqDQtfEPkHuA5I16E4jzRWUFYViAYNvL8dXqAk5IdDHzzBtnAWdtKLwCCIxAaOIolZI9BMQKX4IMRBU8ShHj/YcQ8RdeYAMUembrXJxM0BbGbOpb7Z+zP0vhRh2Xcd2ijHVUnLHl0rqDD2lsNXEzTMDy4CEAI4oYkXuD+ylwSjV5lWKFpOmUini56IjAK1y6qZaNqGY1FpGC6u8x4zIy5NSrlKIY0pTolOzLKYGOo0RshR9UuOJ5G5+AUvXwir1/sIP1PNMnAsIydNRUeEN++azo9fABEyMMsF56jaG3L1NtNVi5Qiwiy4VkICYGGEojfYJLKSFhTMoTCO/3AaFAVwM16h1SxbiQALiOKLyn+In2WnMlJgTgLgrbBkfoiNra3uCg0dOYJt4GWfBqajhFFAZ4seQRARJbQ9wSlgfhFstuJuFlsn9gD+y/3F1XzVTqOUpOl/uW5/6/zEVrCzNQrPiOb3CI9QYLXAX0vJLObnSm/wB4cPUGJwJCCsK0gAx5MvZHDiO1C4xViufExcVlBubEvavihj8asuqF8xUOA4mX0xUHMUy5XlmDkbWNgJvAFRQRVv8AEJCirK5vISklY4mM1cHuUyXEfe4XUQuJULxRtIZuXlBb9kzwbGVUHECD0CwbglD6VFVYeBcSzmH7h1ABiGXGPY/BBqPxQX+if9ejkAJ6pCBAK6BqZgouDoith7SZKV2lh9SVng3HQAq8xw4ruoYQioNh4y/4gVSpS5id0C1wIAAvIXF2RacMCAjNaphwve8sAy4m/W0sBr75X9ghQciEqB88xcFRtpYe5Q2MvECA2kyQYHCxcYHDGYCgBEe/9IxXS0PcS2mQ9QWzwIkhe4ZJDtHurUm5WAnZkibVhjEWK30jYufDkQeWSYr+SUVXccs3YaWri+qDqMWy7qExoQ3UwR2yikNeIR2MlVuYJTCKpj0Vev5nqwArJZ2quVeY3u4zY9xaLuV7KmPqXDpui/MQHGqFf/qGWdy906GYWWywO/ErrnKHHQRN4st/Y1gcyztapyRb2MtwaLF9fEXwzCrUYUOb4gNyBasZgBbYwpmayuZZitSgr4h8UQjDFScvgEwc3zmOb7ljbjjJZYZIAZZicxGArNA1HKMW8JUEhC1IuLwio5fz8A0x4NS4qOYKYjopD1KPDBdfC8aqPSl8JtbiLq5bvSrUzKox3LHRWPzEpG0pBGtGar9TIcMQqSV6lOpTqU6lOojqE27EqGsEyoj+iJxGDMPPwfKXfA5QghmDmycwc6X2ShxS1UwGpYKWFeCIliSMPK2Lb/wqnEfMvg335JggPE46WSmt7RkDjiY6tFYVAQAdqYwF+BwRDkDSMJRdagtwlVPWf7AIuuUohkqOBh1GNgdyqEPjEFux4ITuDYy1wPKKyNlLbMGN6hG4xuJhoHGJRD4j3C1d8ASnIrU/nIuO/gmJzv5ULstnmLS452ZzFtMe5jTmINKJatWnMa+cv6i2/HE2f8KlySORqAUP7CFFB1xH8JKzLD+kEW2mJSoYDgMsx8KyxbFfe/RmVNlW5d13b6lxyazMVHDFdy8sEKoY5hOzBsxZKQlHSrmCTa8SwpB5qoXS6eoYh47shSUaigOUY0zmvLKdI/8Ap8SpLLg3bSXCkyP38Dt+KrE4i2EMmCmWONfA3LqaZz/wpi1rcpN7YaFmScRWth8B7HZAFtGr4+4QEQd1L2qmrbCC1ejMejnMu3hmUKCzTs/cCWt/9qPGTPXPcuiy0HNPMyFjWoYBzuJqNJmZCmItB7m9GvlIwhe7ctnjPLAVeXzMO4wEU3FLCCnFFmRFzBjuyXmuHmbI6Ge5XwvUoyxbZgBuHuSm0oHbqGGmLibOoWFrslC1zMnIuEsjFvaFzMPEcXRi/iA0KLN7dc9EJBLS1+IFQs3mUFN83MoBD4KlKmmoKOIJXq8RW9hOIzAWpdZ54jCOWMePcJRx8J+P5FeHc4gfG4AihjywKbdz8koZ2ygOcTCtw8ymhi16TI/mDCDl4IrX3DQMua2z91/mGhxZ9GpjEP8ACH7lXWdzZgLTKuQIp7QhK+Elu8TAXjPwHGZUS5jj1HUIDuRjFn4r4qMCwcfLKuaiq0QPZ+HAqjfiWzWdvM4eGGYCO0wenUEpR7qGq45mqrcTLzO2N0PWYV+qqz0GJlBt2y49DjmVZBVh0TjHPzFj4XFytEpX6O5Sxp+G5WDlgvrYisilc3KxMPrHUIo2X3MfhjqBUMPbDpP3EP8ABETCJ7lTfBgy/lQlOTgghgl3glPoTMvJcEmL5IoeKlbzEC9dzYOZoe5xfmWjxwwLGnCRubCPR/1NC9wCt4GuP/McKnRBVLOF/wBlTLw1EHPSdjsFG3MpadMDFNfqUb9scpRD4WGMIypriWAOWCgEJASqUB5IqK51qbbmYXLlsBKC2UUB5izbwmmA84INT/EJgHp7cyuQypzXmUh4vJKoO6jChdK6ZgXKWniGm4a1ZGW4V/LDWiT8gn+oAE4QwPCK7idO2hjP/iK1agB0yul5OIWLH6goH8xBLeXEv7VFa4JeygOEy1FZNIRZYwjr4VwIG9hAGkTVEtA8wvqGeGCcMQ1zBxa/BKeVG5QVI47jFGhcXHXCc8kSi3EqdEfV6h8O0wRUDfUQWslXMiu2/MDcvMUrtGZH2jrRucR7mBtpj8kCRUDVzWRWl+/+oMgYvZLl52TlLVu8xWhURG9REVSlusQRM/JxhlFmEeKizRHa9xhN+GO5/OZErzF3jUcgX5j2KrKt2wIaA8Qisx9Q1CmKrm4aXLOHmYk4LDIDC/yMhmnD4gXbJuOfEoQvtGy5WNkIiAH5JhaLpOAVqPnRkZrxrfR3MRasKSpgko5VKQN3XZGKZdKqmRChpbGMJUF3UVr24iGwb3eZWoruqY65biyivr3G5HkcR4cAaYHKRxUGRxiGSYwhUEs/3H+0YQV6j+pufEXieTKvTKLAI0J0FsobC+IGQr9ywOzhlqo3hHmUsx5Tn/pBr73v6ThgxUFyilKgY1trcTdiqf8AUtwIXYVUxbq3CblHLAaFKGcZ1cPUqoR2k076FLMGQcM/mNquQJhggCK4DUGriOAYCtCpNmYMSAuBnZ3mGq7wV16QlsuLOsuYdE83Lqv+oagQqQXVxWCG8+Usdg0/aEl2zal3HbAOCqisArlbQ16likBSoetPzG6QLxwYUJfqa4wl9yrJqOn6lE3D3CnMRFnEPLEcy8EwKQg9wbFeQ3E3hzvDLq0cOUHjSC/yA4mSFhO5dLPmihLQ3xLBF50SxFzrKWbQYlAA43ipKWZCtF4uLSUsAyfyY3CgsDjOGANjMxrQmpQw1xGtBnxEBq6gCiy8xBgiytMTK2TxHRcmqaSX1NkUVN+4afLoZvvzDmFD2Qg8a6PsgRY3s+zuMLzVVn6mvY85nB8lDjiEcNVymI54sOu4FuXxEFL9tSvuvOvzKGPwRgpiAxMG9sA1Ehl9RsBfqKLfwSrYn1NS4LtKiCsS22CBFA3UFB3cudIWOL5xEZyylujDkGUth0dRJBBSjKeY3qUPWO4xKiJd6qJwH0c+6gqEYnTmWR3mCac+4y3X6iatzCeDBDglS+ZSQCoWsaZTsiRnD9x2WH8hVQR09yiCl294huG3kg8j+xN3Y+NxcmunmBBSoKL7ixo5PMQMdFPMoBsrSXK2aOo7+bjmXUtAboNRsoJ1AyyvnKOyrwRXtfZLiG3TCrABI44hjkstahkooruZgEtu2pzBQBll066qw5z43ENUD81zKmC5WQwGGaK2Vz+JU8C2aX1NpIaLzEOWpabeJZ0m2odxAVMFXOxh1JYVm3FShwNkOT8qmDDiVPUCAzmnZyfiFU7b11GexTSaLqW2v+GF0UdcxAufHcNuB5RSooiiYfqMbHVVmEtel/C7+BlxYxiDcOgc+IfE9QGojVOTpzMkH01FTRrnh9QdFCPgPmBrnT3MoUAKXUBoCnPyzFUkPf3KnLELfgl68O8BhnMoxQ1ZpWUs0LUs8ThQSvA5sZntrzLDIYB/qmgH4htATpJrS/KNnr3WyGeYIa0wImHZr+IgWXpO0gToeDMNtiWJvh2QwiWMG6rAoOpa3qLuK7YW/DFbIMnbxEBlLwxMWKAmX1PcRhy/UMqozUscd/Fy5c20Sisy38Q+GI3nddcJsmycddfce1JNRrzFtgPU0gDBNrBUnZK1mZZa9gppQjIglpfXEu/QPCdrMxc01z21Fs7euoUFEyKPqC5wblTDi1VUslxGqMPOw6ZWthzOoLGW4DWmdDzGUq4HJFlnTMZQC8cyiws+koCCty2SjoSz5GI1VsEUgPEqFQlAfI7uGYaspmBYsr6f/cwKgQWH+Irbf/LNNEqJjDMIW+DF6TjmELdvlxBwSnpjBaJmoBIA2D7giqVGs6lZ595imaHiAYogoGrauUPXbki9ELwYlLRh9F6zEkgjTUoHcXUyVGSPMxTZjNxDRuwJSZpgMN9VMSQ8Aw+Klq6oYDp/1AilitYshBpVFkVLVzfUbFe8Ry+x8BMUxrFfmNwwc1EVF3zEtGqtv/lX7MCDXwgykssOXUxYP5OYNwp58xlLWYBVuY7sPRAQFrwRqJtMcL9RGpy0AdwA/RDKvhL8Qy1wj6jRaHiWdFlVxinRQTPM08wQZPmLC2MFj/qK7ATIe2NwhdXiJT5gf8wuqxjhA+BbK9xXDFKaju+jtmhxKOUabOoOdxFaj9IhSrOZlV+o8vkTeJQjGvxEBfEyjivA0x6Or5mH7VzNymSjwR3GE/HqLippLEBO44XcNHUCy1hcGLKtJxJJQniD5hrHglhdRk3A0QzYPbEIAZQl+4xDLTfMoUQ0GiHAHsZ4XpSVHkQnlLxYDZDpFV1uIy6g2CXsalBlCFkBNTd80RHwELzmVOo3HFEPhOh3FL2GmIIyrRRXaEl7GmWtZhe0gmE8XUbLa4vFgy6CwyJemK7hNpplDfERbVb4LD1Axh0yty+c24VQswf9QqVukhUoWcTt3cJ9YMWIxUyrqoxCgcw11ABWiXAKZs/NfDBYbxB2sLF4mD8ADySqwElxps9Swi1cTmhdnE0oZdxqzPJDYMuiEYfGlEVzmPMzE9NTbbAgQAgEt8byQktiVQGG9tepR+YgLqpm3mNmU6g3qCJiO14lvglKdwy9R+Vly4YMv2M0Sh+GxD7lCJ9Shmqc+oCij7QRTug9J+oqUXUsWjLF3bCPw5RGLnUEYoKyw+B5ZQlZfiFu4M7iYKQJYHmGAI5bmLAX1LIt0QGjPPEfjabk49XKDklSWax+cfD7YsY4OiK6miLMtEORmGJygxUauZbYpFlscKY/A/G0MkWC7gOY+0RuxoiTiK+IUVQLW6nMTHuPawbI3LoZY/O83I8FyisQA4/4/wD/2Q==",
  qt12: "data:image/jpeg;base64,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",
};

const QUALITY_TIME = [
  { k: "qt1", label: "Serienabende mit Popcorn auf dem Sofa" },
  { k: "qt2", label: "Aktiv sein und Abenteuer erleben" },
  { k: "qt3", label: "Tiefe Gespräche bei Kerzenlicht" },
  { k: "qt4", label: "Zusammen kochen und genießen" },
  { k: "qt5", label: "Neue Orte entdecken und reisen" },
  { k: "qt6", label: "Gemütliche Morgen und langsame Tage" },
  { k: "qt7", label: "In Bewegung sein und uns gegenseitig antreiben" },
  { k: "qt8", label: "Einfach zusammen sein und den Moment genießen" },
  { k: "qt9", label: "Über unsere Zukunft sprechen und Pläne schmieden" },
  { k: "qt10", label: "Romantische Abende nur für uns zwei" },
  { k: "qt11", label: "Kuscheln und nah sein, ohne Anlass" },
  { k: "qt12", label: "Nebeneinander abschalten, ohne viel zu reden" },
];

/* --------------------- Kapitel 3 --------------------- */
const COMM_Q = [
  { k: "ansprechen", type: "one", q: "Wie spreche ich schwierige Themen an?", opts: [
    "Direkt und ziemlich sofort",
    "Vorsichtig, mit ein bisschen Anlauf",
    "Erst, wenn sich einiges aufgestaut hat",
    "Am liebsten gar nicht",
  ] },
  { k: "sicher", type: "many", max: 3, q: "Was brauche ich, um mich zu öffnen?", opts: [
    "Ruhe und keine Zuschauer", "Zeit, ohne Termin danach", "Dass du mich ausreden lässt",
    "Nebenbei etwas tun – Auto, Spaziergang, Abwasch", "Körperliche Nähe",
    "Die Zusage, dass es später nicht gegen mich verwendet wird",
  ] },
  { k: "abwehr", type: "many", max: 3, q: "Welche Sätze lösen bei mir sofort Abwehr aus?", opts: [
    "„Du immer …“ oder „Du nie …“", "„Jetzt sei nicht so empfindlich“", "„Das bildest du dir ein“",
    "„Ist doch nicht so schlimm“", "„Beruhig dich erst mal“", "Schweigen als Antwort",
    "Vergleiche mit anderen",
  ] },
  { k: "zuhoeren", type: "one", q: "Höre ich zu, um zu verstehen – oder um zu antworten?", opts: [
    "Meistens, um zu verstehen", "Kommt stark aufs Thema an",
    "Oft baue ich innerlich schon die Antwort", "Ehrlich gesagt fast immer, um zu antworten",
  ] },
  { k: "konflikt", type: "many", max: 2, q: "Was wünsche ich mir in Konflikten?", opts: [
    "Dass wir leiser werden", "Dass wir beim Thema bleiben",
    "Dass mir jemand zuhört, bevor eine Lösung kommt", "Dass wir es am selben Abend klären",
    "Dass wir eine Pause machen dürfen", "Dass danach eine Umarmung kommt",
  ] },
];

const REACH_ME = [
  { k: "still", start: "Wenn ich still werde, bedeutet das meistens …", ph: "… dass ich sortiere, nicht dass ich beleidigt bin." },
  { k: "gereizt", start: "Wenn ich gereizt wirke, brauche ich eigentlich …", ph: "… kurz Luft und danach die Frage, was los ist." },
  { k: "zurueck", start: "Was mir hilft, wieder auf dich zuzugehen, ist …", ph: "… ein erster Schritt von dir, auch ein kleiner." },
];

/* --------------------- Kapitel 4 --------------------- */
const CONFLICT = [
  {
    k: "rueckzug", label: "Ich ziehe mich zurück",
    strength: "Du eskalierst nicht. Du sagst im Affekt selten etwas, das du bereust.",
    risk: "Dein Rückzug wird leicht als Desinteresse gelesen. Die andere Seite sieht nur, dass du weg bist – nicht, dass du zurückkommst.",
    step: "Sag beim Rückzug einen Satz dazu: wie lange du brauchst und dass du wiederkommst. Das macht aus Flucht eine Pause.",
  },
  {
    k: "angriff", label: "Ich werde laut oder scharf",
    strength: "Bei dir bleibt nichts unausgesprochen. Man weiß immer, woran man ist.",
    risk: "Tempo und Lautstärke überfahren die andere Seite. Was du als Klärung meinst, kommt als Angriff an.",
    step: "Zähl innerlich bis drei und sag den Satz noch einmal – langsamer und ohne „du“ am Anfang.",
  },
  {
    k: "rechtfertigen", label: "Ich rechtfertige mich sofort",
    strength: "Dir ist wichtig, richtig verstanden zu werden. Das zeigt, dass dir die Beziehung nicht egal ist.",
    risk: "Wer sich erklärt, hört in dem Moment nicht zu. Die andere Seite fühlt sich dann doppelt übergangen.",
    step: "Frag zuerst: „Habe ich richtig verstanden, dass …?“ Deine Erklärung kommt danach – sie läuft dir nicht weg.",
  },
  {
    k: "harmonie", label: "Ich lenke ein, damit Ruhe ist",
    strength: "Du kannst deeskalieren wie kaum jemand. Aus Meinungsverschiedenheiten wird bei dir kein Krieg.",
    risk: "Was du schluckst, verschwindet nicht. Es sammelt sich und kommt später als etwas raus, das nicht zum Anlass passt.",
    step: "Sag einmal pro Streit einen Satz, der dir unangenehm ist. Nur einen. Das reicht für den Anfang.",
  },
  {
    k: "loesung", label: "Ich will sofort eine Lösung",
    strength: "Du bleibst handlungsfähig, wenn andere feststecken.",
    risk: "Nicht jedes Gefühl ist ein Problem, das gelöst werden will. Manchmal will es nur gehört werden.",
    step: "Frag: „Willst du eine Idee von mir – oder erstmal nur erzählen?“ Diese Frage rettet erstaunlich viele Abende.",
  },
  {
    k: "ueberfordert", label: "Ich bin schnell überfordert",
    strength: "Du spürst früh, wenn ein Gespräch kippt. Diese Antenne haben nicht viele.",
    risk: "Überforderung sieht von außen aus wie Gleichgültigkeit oder Drama – beides trifft es nicht.",
    step: "Vereinbart ein Wort oder Zeichen, das heißt: Ich bin raus, aber nicht weg. Danach die Pause-Regel unten.",
  },
];

const PAUSE_SIGNS = [
  "Wir werden lauter", "Wir reden im Kreis", "Sätze mit „immer“ und „nie“",
  "Eine:r wird sarkastisch", "Eine:r verlässt den Raum", "Alte Themen kommen hoch",
  "Es geht längst nicht mehr ums eigentliche Thema", "Eine:r sagt gar nichts mehr",
];

const PAUSE_LENGTH = [
  "Mindestens 20 Minuten", "Höchstens eine Stunde",
  "Bis zum Abend, dann reden wir", "Bis zum nächsten Morgen – aber nie länger",
];

const PAUSE_PROMISE = [
  "„Ich bin nicht weg. Ich brauche nur kurz.“",
  "„Lass uns nach dem Abendessen weiterreden.“",
  "„Ich will das klären, aber nicht jetzt.“",
  "„Gib mir zwanzig Minuten, dann komme ich zu dir.“",
];

const PAUSE_BACK = [
  "Eine:r geht mit einer Umarmung auf die andere Seite zu",
  "Wir sagen unseren Satz und setzen uns nochmal hin",
  "Wir machen erst etwas Normales zusammen und reden danach",
  "Wir schreiben uns kurz, bevor wir wieder reden",
];

const PERPETUAL_TOPICS = [
  "Ordnung und Sauberkeit", "Handyzeit", "Pünktlichkeit", "Wie viel wir unterwegs sind",
  "Geld", "Familie und Schwiegereltern", "Nähe und Abstand", "Aufgabenverteilung",
  "Wie wir Urlaub machen", "Erziehung", "Das Tempo im Alltag", "Wie viel geredet wird",
];

const PERPETUAL_NEEDS = [
  "Sicherheit", "Freiheit", "Anerkennung", "Ruhe", "Zugehörigkeit",
  "Fairness", "Verlässlichkeit", "Kontrolle über den eigenen Tag", "Gesehen werden",
];

const REPAIR_LINES = [
  "Ich will nicht recht haben. Ich will nur wieder normal mit dir reden.",
  "Es tut mir leid, wie ich das gesagt habe.",
  "Der Punkt, den du gemacht hast, stimmt. Zumindest zum Teil.",
  "Können wir nochmal von vorn anfangen? Ich fange an.",
  "Ich bin immer noch anderer Meinung. Aber ich bin nicht mehr sauer auf dich.",
];

/* --------------------- Willkommen: wenn es unangenehm wird --------------------- */
const SOFT_LINES = [
  "Sag das nochmal. Ich will das richtig verstehen.",
  "Das trifft mich gerade. Ich brauche zwei Minuten, dann bin ich wieder da.",
  "Ich muss darauf nichts erwidern. Ich lass es erstmal so stehen.",
];

/* --------------------- Kapitel 5 --------------------- */
const VALUES = [
  "Familie", "Freiheit", "Sicherheit", "Karriere", "Reisen", "Heimat",
  "Gesundheit", "Abenteuer", "Geld", "Persönliche Entwicklung", "Kinder", "Spiritualität",
  "Freundschaften", "Ehrlichkeit", "Verlässlichkeit", "Humor", "Ruhe", "Nähe",
  "Unabhängigkeit", "Respekt", "Kreativität", "Natur", "Ordnung", "Spontaneität",
  "Zusammenhalt", "Großzügigkeit", "Neugier", "Tradition", "Gerechtigkeit", "Gelassenheit",
  "Leidenschaft", "Loyalität", "Mut", "Wertschätzung", "Zugehörigkeit", "Selbstbestimmung",
];

const SCRIBBLES = [
  "M50 7C79 6 96 22 96 49C96 77 78 94 49 94C21 94 4 76 4 49C4 23 21 8 45 6",
  "M52 5C81 8 97 25 95 52C93 79 74 95 46 94C19 93 3 74 5 47C7 22 25 7 50 6C58 6 66 8 70 11",
  "M48 8C77 5 95 24 96 51C97 76 77 95 48 95C22 95 4 75 5 48C6 24 22 9 44 7",
];

/* --------------------- Kapitel 6 --------------------- */
const MONEY_Q = [
  { k: "entscheiden", type: "one", q: "Wie treffen wir finanzielle Entscheidungen?", opts: [
    "Alles getrennt, jede:r für sich", "Alles gemeinsam",
    "Gemeinsam ab einer bestimmten Summe", "Meistens entscheidet eine:r von uns",
  ] },
  { k: "sicherheit", type: "many", max: 3, q: "Was bedeutet finanzielle Sicherheit für uns?", opts: [
    "Rücklagen auf dem Konto", "Ein fester Job", "Keine Schulden", "Eigentum",
    "Uns spontan etwas leisten können", "Eine Absicherung fürs Alter", "Ein Notgroschen für die Familie",
  ] },
  { k: "einkommen", type: "one", q: "Wie gehen wir mit unterschiedlichen Einkommen um?", opts: [
    "Gleiche Beträge", "Gleiche Anteile vom Einkommen", "Eine:r zahlt mehr – bewusst so",
    "Wir rechnen gar nicht auf", "Darüber haben wir nie gesprochen",
  ] },
  { k: "transparenz", type: "many", optional: true, q: "Wo wünschen wir uns mehr Transparenz?", opts: [
    "Gehälter", "Schulden", "Sparen und Anlagen", "Ausgaben fürs Hobby",
    "Geschenke", "Unterstützung für die Familie", "Nichts – wir sind offen",
  ] },
];

const MONEY_TASKS = [
  "Rechnungen bezahlen", "Den Überblick behalten", "Große Anschaffungen",
  "Alltagseinkäufe", "Versicherungen & Verträge", "Urlaub planen", "Sparen",
];

/* --------------------- Kapitel 7 --------------------- */
const CLOSE_PRIVATE = [
  { k: "nah", type: "many", max: 3, q: "Wann fühle ich mich emotional nah?", opts: [
    "Wenn wir lange reden", "Beim Nebeneinanderliegen",
    "Wenn du merkst, dass etwas ist, bevor ich es sage", "Wenn wir zusammen lachen",
    "Nach einem Streit, der geklärt ist", "Wenn wir zusammen etwas schaffen",
    "Beim Sex", "Wenn du mich nach außen verteidigst",
  ] },
  { k: "distanz", type: "many", max: 3, q: "Was schafft für mich Distanz?", opts: [
    "Handy am Tisch", "Wenn wir nur noch organisieren", "Kritik vor anderen",
    "Wenn du nicht nachfragst", "Zu wenig Zeit für mich allein",
    "Wenn Nähe nur zu bestimmten Zeiten passiert", "Wenn ein Streit im Raum stehen bleibt",
  ] },
  { k: "stress", type: "one", q: "Wie verändert Stress meine Nähe?", opts: [
    "Ich suche dann mehr Nähe", "Ich brauche dann mehr Abstand",
    "Ich merke es selbst kaum", "Kommt darauf an, woher der Stress kommt",
  ] },
  { k: "fehlt", type: "many", optional: true, q: "Welche Form von Zärtlichkeit fehlt mir manchmal?", opts: [
    "Umarmungen ohne Anlass", "Händchenhalten", "Küsse im Vorbeigehen",
    "Nebeneinander einschlafen", "Massagen", "Ausgesprochene Komplimente", "Nähe ohne Erwartung",
  ] },
];

const CLOSE_TOGETHER = [
  "Was war ein Moment, in dem du dich mir besonders nah gefühlt hast?",
  "Woran merkst du, dass ich gerade nicht erreichbar bin?",
  "Was wünschst du dir mehr – und was weniger?",
  "Wie können wir über dieses Thema reden, ohne dass es sich wie eine Prüfung anfühlt?",
  "Gibt es etwas, das du dich bisher nicht getraut hast zu sagen?",
];

/* --------------------- Kapitel 8 --------------------- */
const OUTSIDE_TOPICS = [
  "Wie wir uns kennengelernt haben",
  "Unser Altersunterschied",
  "Unsere Zukunftspläne",
  "Wie wir mit Geld umgehen",
  "Ob und wann wir Kinder wollen",
  "Wie es uns als Paar gerade geht",
  "Was in unserem Schlafzimmer passiert",
  "Konflikte, die wir gerade haben",
  "Gesundheitliche Themen",
  "Was Familie oder Freunde über uns gesagt haben",
];

const REPLIES = [
  { tone: "Freundlich", lines: ["Danke für die Sorge – uns geht es wirklich gut.", "Schön, dass dich das interessiert. Uns passt es so.", "Wir haben das für uns geklärt."] },
  { tone: "Humorvoll", lines: ["Ja, wir haben nachgerechnet. Es passt trotzdem.", "Stimmt, wir sind ein statistischer Ausreißer.", "Das fragen wir uns auch jeden Morgen. Und dann frühstücken wir."] },
  { tone: "Klar", lines: ["Das ist unsere Entscheidung, und die steht.", "Ich möchte darüber nicht diskutieren.", "Ihr müsst das nicht verstehen. Nur respektieren."] },
  { tone: "Gespräch beenden", lines: ["Ich wechsle jetzt das Thema.", "Dazu sage ich nichts mehr.", "Lass uns über etwas anderes reden."] },
];

/* --------------------- Kapitel 9 --------------------- */
const BALANCE_AREAS = [
  "Geld", "Wohnen", "Freizeit", "Freundschaften",
  "Familienplanung", "Karriere", "Große Anschaffungen", "Reisen", "Alltag",
];

const BALANCE_SCALE = [
  { v: 0, label: "Eher die andere Seite" },
  { v: 1, label: "Leicht ungleich" },
  { v: 2, label: "Ausgewogen" },
  { v: 3, label: "Eher ich" },
];

/* --------------------- Kapitel 10 --------------------- */
const PHASE_TOPICS = [
  { k: "karriere", label: "Ausbildung & Karriere", q: "Was steht bei jedem von uns beruflich in den nächsten Jahren an?" },
  { k: "kinder", label: "Kinderwunsch & Elternschaft", q: "Wo stehen wir bei diesem Thema – und wann wollen wir wieder darüber sprechen?" },
  { k: "energie", label: "Energie & Freizeit", q: "Wie unterschiedlich sind unsere Bedürfnisse nach Ruhe und nach Unternehmung?" },
  { k: "wohnen", label: "Wohnort", q: "Wo wollen wir leben – und was hängt für jeden von uns daran?" },
  { k: "ruhestand", label: "Arbeiten & Ruhestand", q: "Wie stellen wir uns die Zeit vor, in der einer von uns weniger arbeitet?" },
  { k: "gesundheit", label: "Gesundheit & Fürsorge", q: "Was möchten wir geregelt haben, bevor es jemand regeln muss?" },
  { k: "freunde", label: "Freundeskreise", q: "Wie gehen wir damit um, dass unsere Umfelder unterschiedlich sein können?" },
];

const PHASE_STATUS = [
  "Haben wir geklärt", "Haben wir mal angerissen", "Nie darüber gesprochen", "Betrifft uns nicht",
];

/* --------------------- Kapitel 11 --------------------- */
const HORIZONS = [
  { k: "jahr", label: "In einem Jahr", note: "Nah genug, dass es konkret werden muss." },
  { k: "fuenf", label: "In fünf Jahren", note: "Weit genug für größere Entscheidungen." },
  { k: "zehn", label: "In zehn Jahren", note: "Hier zeigt sich, ob eure Richtungen zusammenpassen." },
  { k: "spaeter", label: "Später im Leben", note: "Der Teil, über den die wenigsten Paare je sprechen." },
];

const FUTURE_AREAS = [
  "Beziehung", "Familie", "Wohnen", "Reisen", "Arbeit",
  "Gesundheit", "Finanzen", "Persönliche Entwicklung", "Gemeinsame Erlebnisse",
];

/* --------------------- Kapitel 12 --------------------- */
const RITUAL_IDEAS = [
  "Ein fester Abend pro Woche, der nicht verschoben wird",
  "Beim Rausgehen und Reinkommen kurz umarmen",
  "Sonntags fünf Minuten die Woche besprechen",
  "Einmal im Monat etwas machen, das keiner von uns kennt",
  "Handys beim Essen in einen anderen Raum",
  "Abends erzählen, was heute gut war",
  "Einmal im Quartal ein längeres Gespräch über uns",
  "Sich gegenseitig etwas mitbringen, ohne Anlass",
];

const SEASON_DATES = {
  fruehling: ["Den ersten warmen Abend draußen verbringen, ohne Plan", "Auf einem Markt je drei Zutaten blind kaufen und daraus kochen", "Eine Fahrradtour zu einem Ort, an dem keiner von euch war", "Frühstück im Grünen, mit Decke und zu viel Essen", "Einmal richtig früh aufstehen und den Sonnenaufgang anschauen"],
  sommer: ["Abends baden gehen, wenn alle anderen schon weg sind", "Freiluftkino oder Autokino", "Eine Nacht draußen schlafen, notfalls im Garten", "Eisdielen-Tour: drei Läden, je eine Kugel, ihr kürt die beste", "Spontan ins Auto und zwei Stunden in eine Richtung fahren"],
  herbst: ["Waldspaziergang und danach heiße Schokolade", "Zusammen etwas backen, das schiefgehen darf", "Regentag auf dem Sofa, Handys aus, zwei Filme", "Flohmarkt, und jeder sucht dem anderen etwas unter fünf Euro", "Ein altes Fotoalbum durchgehen, jeder erzählt drei Geschichten"],
  winter: ["Ein Menü zu zweit kochen, drei Gänge, Kerzenlicht", "Schlittschuhlaufen, auch wenn es keiner kann", "Ein Wochenende irgendwo ohne Empfang", "Die Fotos des Jahres sortieren und ein Album machen", "Jahresrückblick: jeder nennt fünf Momente"],
};

const SEASONS = [
  { k: "fruehling", label: "Frühling" },
  { k: "sommer", label: "Sommer" },
  { k: "herbst", label: "Herbst" },
  { k: "winter", label: "Winter" },
];


/* --------------------- Kapitel 2: Beziehungs-Rad --------------------- */
const WHEEL_AREAS = [
  { k: "vertrauen", label: "Vertrauen",
    desc: "Kann ich mich auf dich verlassen? Fühle ich mich sicher, auch wenn wir uns nicht einig sind?",
    help: "Redet einmal darüber, woran ihr merkt, dass ihr euch sicher fühlt – nicht erst, wenn es fehlt." },
  { k: "reden", label: "Kommunikation",
    desc: "Reden wir über das, was wirklich ansteht – oder nur über Termine und Erledigungen?",
    help: "Nehmt euch pro Woche zwanzig Minuten, in denen es nicht um Organisation geht." },
  { k: "naehe", label: "Nähe",
    desc: "Körperliche und emotionale Nähe: Umarmungen, Zärtlichkeit, das Gefühl, gemeint zu sein.",
    help: "Benennt Alltagsnähe und körperliche Nähe getrennt. Sonst wird eins mit dem anderen verwechselt." },
  { k: "zeit", label: "Gemeinsame Zeit",
    desc: "Zeit, in der ihr wirklich zu zweit seid – ohne Handy, ohne To-do-Liste nebenher.",
    help: "Ein fester Termin, der nicht verschoben wird, wirkt mehr als viele spontane Vorsätze." },
  { k: "alltag", label: "Organisation",
    desc: "Wie Haushalt, Termine und Planung verteilt sind – auch das unsichtbare Mitdenken.",
    help: "Prüft die Verteilung ehrlich – auch die unsichtbaren Aufgaben wie Planen und Mitdenken." },
  { k: "freiraum", label: "Freiraum",
    desc: "Zeit und Raum für dich allein: Hobbys, Freunde, Rückzug – ohne schlechtes Gewissen.",
    help: "Jede:r braucht etwas, das nur ihm oder ihr gehört. Sprecht aus, wie viel das gerade ist." },
  { k: "zukunft", label: "Zukunft",
    desc: "Habt ihr ein gemeinsames Bild davon, wohin es geht? Und redet ihr darüber?",
    help: "Ein Abend im Jahr, an dem ihr über die nächsten Jahre redet. Mehr braucht es nicht." },
  { k: "streit", label: "Konflikte",
    desc: "Nicht ob ihr streitet, sondern wie: Werdet ihr laut, verletzend, oder findet ihr wieder zueinander?",
    help: "Wichtig ist nicht, ob ihr streitet, sondern wie ihr danach wieder zueinander findet." },
];

/* --------------------- Kapitel 13: Stimmung --------------------- */
const MOOD_BARS = [
  { k: "nah", label: "Verbunden", note: "Momente, in denen ihr euch als Team erlebt." },
  { k: "mittel", label: "Irgendwo dazwischen", note: "Nebeneinander her, ohne dass etwas falsch wäre." },
  { k: "fern", label: "Auf Distanz", note: "Zeiten, in denen ihr euch weit weg fühlt." },
];

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/* --------------------- Kapitel 12: Visionboard --------------------- */
const VISION_SUGGEST = [
  "Ein gemeinsames Zuhause", "Ein Kind", "Ein Hund", "Heiraten",
  "Eine große Reise", "Ein Jahr im Ausland", "Weniger arbeiten",
  "Etwas Eigenes aufbauen", "Ein Garten", "Näher ans Meer",
  "Finanziell sorgenfrei", "Eine Sprache zusammen lernen",
];

/* --------------------- Impulse & Meilensteine --------------------- */
const IMPULSES = {
  2: "Kein Rad läuft überall auf zehn. Es geht darum, dass keine Speiche zu weit zurückfällt.",
  3: "Unterschiedliche Antworten bedeuten nicht automatisch Unvereinbarkeit.",
  4: "Verstanden zu werden beginnt oft damit, genauer zu erklären, was in uns passiert.",
  5: "Ein Konflikt ist nicht beendet, wenn niemand mehr spricht, sondern wenn wieder Verbindung entstanden ist.",
  7: "Über Geld zu sprechen ist selten romantisch. Es nicht zu tun, wird irgendwann teurer.",
  8: "Nähe entsteht nicht nur durch große Gespräche, sondern durch kleine verlässliche Momente.",
  10: "Balance heißt nicht, dass alles exakt gleich verteilt ist. Sondern dass beide das Gefühl haben, gefragt zu werden.",
  12: "Pläne, die niemand ausspricht, sind keine gemeinsamen Pläne.",
  13: "Was ihr regelmäßig tut, prägt eure Beziehung mehr als das, was ihr euch vornehmt.",
};

const MILESTONES = [
  { at: 25, title: "Ein Viertel geschafft", text: "Ihr habt bereits über Dinge gesprochen, die im Alltag oft unausgesprochen bleiben. Das ist mehr, als die meisten Paare bewusst tun." },
  { at: 50, title: "Halbzeit", text: "Nehmt euch ruhig eine Pause und kommt später zurück. Alles bleibt gespeichert. Manches wirkt sowieso erst über Nacht nach." },
  { at: 75, title: "Drei Viertel", text: "Ab hier geht es weniger ums Sammeln und mehr ums Verbinden. Die letzten Kapitel führen eure Antworten zusammen." },
  { at: 100, title: "Angekommen", text: "Ihr habt euch durch alle sechzehn Kapitel gearbeitet. Das Manifest und der Brief bleiben – kommt in ein paar Monaten wieder her." },
];

const DISCLAIMER = "Dieses Workbook dient der persönlichen Reflexion und dem gemeinsamen Gespräch. Es ersetzt keine Paarberatung, Psychotherapie, medizinische oder rechtliche Beratung. Bei Gewalt, Kontrolle, Angst oder akutem Unterstützungsbedarf wendet euch bitte an eine geeignete professionelle Beratungsstelle.";

const PRIVACY = "Eure Eingaben werden ausschließlich lokal in eurem Browser gespeichert und nicht an uns oder Dritte übertragen.";

/* =========================================================
   BAUSTEINE
========================================================= */
function Kicker({ children, color }) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: 12, letterSpacing: 2.6, fontWeight: 600,
      textTransform: "uppercase", color: color || C.terra, marginBottom: 12,
    }}>{children}</div>
  );
}

function H2({ children }) {
  return (
    <h2 style={{
      fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(31px, 7.4vw, 46px)",
      lineHeight: 1.1, color: C.ink, margin: 0,
    }}>{children}</h2>
  );
}

function H3({ children, style }) {
  return (
    <h3 style={{
      fontFamily: SERIF, fontWeight: 500, fontSize: 26, lineHeight: 1.25,
      color: C.ink, marginTop: 0, marginRight: 0, marginBottom: 16, marginLeft: 0, ...style,
    }}>{children}</h3>
  );
}

function P({ children, style }) {
  return (
    <p style={{
      fontFamily: SANS, fontSize: 15.5, fontWeight: 300, lineHeight: 1.72,
      color: C.body, marginTop: 0, marginRight: 0, marginBottom: 18, marginLeft: 0, ...style,
    }}>{children}</p>
  );
}

function Card({ children, style, tone, intro }) {
  const bg = tone === "white" ? C.white : tone === "sage" ? C.sageSoft : tone === "terra" ? C.terraSoft : C.sand;
  return (
    <section style={{
      background: bg, borderRadius: 18, padding: "32px 24px 34px", marginBottom: 34, ...style,
    }}>{children}</section>
  );
}

function Lead({ children }) {
  return (
    <div style={{ borderLeft: `2px solid ${C.terra}`, paddingLeft: 18, margin: "0 0 30px" }}>
      {React.Children.map(children, (c, i) => (
        <p key={i} style={{
          fontFamily: SERIF, fontSize: 19.5, fontStyle: "italic", fontWeight: 400,
          lineHeight: 1.55, color: C.ink, margin: i === 0 ? "0 0 12px" : 0,
        }}>{c}</p>
      ))}
    </div>
  );
}

function Impulse({ text }) {
  if (!text) return null;
  return (
    <div style={{
      background: C.sageSoft, borderRadius: 14, padding: "22px 24px",
      marginBottom: 20, textAlign: "center",
    }}>
      <div style={{ color: C.sage, fontSize: 15, letterSpacing: 7, marginBottom: 10 }}>✦</div>
      <p style={{
        fontFamily: SERIF, fontSize: 20, fontStyle: "italic", fontWeight: 400,
        lineHeight: 1.5, color: C.ink, margin: 0,
      }}>{text}</p>
    </div>
  );
}

function Pending({ children, status }) {
  return (
    <div style={{
      border: `1px dashed ${C.line}`, borderRadius: 18, padding: "28px 24px",
      marginBottom: 34, background: "transparent",
    }}>
      <div style={{
        fontFamily: SANS, fontSize: 11.5, letterSpacing: 2.2, fontWeight: 600,
        textTransform: "uppercase", color: C.muted, marginBottom: 9,
      }}>Eure Auswertung – noch nicht freigeschaltet</div>
      <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, color: C.muted, margin: 0 }}>
        {children}
      </p>
      {status && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 15 }}>
          {status.map((x) => (
            <span key={x.name} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              fontFamily: SANS, fontSize: 13, fontWeight: 500,
              color: x.done ? C.sage : C.terra,
              background: x.done ? C.sageSoft : C.terraSoft,
              borderRadius: 20, padding: "7px 14px",
            }}>
              {x.done ? <Check size={13} color={C.sage} /> : <span aria-hidden="true" style={{
                width: 11, height: 11, borderRadius: "50%", border: `1.5px solid ${C.terra}`,
              }} />}
              {x.name}{x.done ? "" : " fehlt noch"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Result({ title, children }) {
  return (
    <section style={{
      background: C.white, border: `1px solid ${C.terra}`, borderRadius: 18,
      padding: "32px 24px 34px", marginBottom: 34,
    }}>
      <Kicker>{title}</Kicker>
      {children}
    </section>
  );
}

function Btn({ children, onClick, variant = "solid", small, full, style, title }) {
  const skin = variant === "solid"
    ? { background: C.terra, color: C.white, borderColor: C.terra }
    : variant === "quiet"
    ? { background: "transparent", color: C.body, borderColor: C.line }
    : { background: C.white, color: C.ink, borderColor: C.line };
  return (
    <button type="button" onClick={onClick} title={title} style={{
      fontFamily: SANS, fontSize: small ? 13 : 15, fontWeight: 500,
      padding: small ? "10px 18px" : "14px 28px", minHeight: 44,
      borderWidth: 1, borderStyle: "solid", borderRadius: 40, cursor: "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      width: full ? "100%" : "auto", ...skin, ...style,
    }}>{children}</button>
  );
}

function Field({ label, hint, value, onChange, rows = 3, placeholder, optional, id }) {
  const fid = id || `f-${(label || "").slice(0, 24).replace(/\W/g, "")}`;
  const offen = !optional && !(value || "").trim();   // Pflichtfeld, noch leer
  return (
    <div style={{ marginBottom: 30 }}>
      {label && (
        <label htmlFor={fid} style={{
          display: "block", fontFamily: SANS, fontSize: 15, fontWeight: 500,
          color: C.ink, marginBottom: hint ? 5 : 10, lineHeight: 1.45,
        }}>
          {label}
          {optional && (
            <span style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: 1,
              textTransform: "uppercase", color: C.muted, marginLeft: 9,
              border: `1px solid ${C.line}`, borderRadius: 20, padding: "2px 9px",
              verticalAlign: "middle", whiteSpace: "nowrap",
            }}>freiwillig</span>
          )}
        </label>
      )}
      {hint && (
        <div style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 300, fontStyle: "italic",
          color: C.muted, marginBottom: 10, lineHeight: 1.5,
        }}>{hint}</div>
      )}
      <textarea
        id={fid} value={value || ""} rows={rows} placeholder={placeholder || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box", resize: "vertical",
          fontFamily: SANS, fontSize: 15.5, fontWeight: 300, lineHeight: 1.6, color: C.ink,
          background: offen ? C.terraSoft : C.white,
          border: `1px solid ${offen ? C.terra : C.line}`, borderRadius: 10,
          padding: "14px 16px", outline: "none", minHeight: 44,
        }}
      />
      {offen && (
        <div style={{
          fontFamily: SANS, fontSize: 12.5, fontWeight: 400, color: C.terra,
          marginTop: 7, lineHeight: 1.5,
        }}>Wird für die Auswertung gebraucht</div>
      )}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, numeric, flex = 1, id }) {
  const fid = id || `i-${(label || "").slice(0, 20).replace(/\W/g, "")}`;
  return (
    <div style={{ flex, minWidth: 0 }}>
      {label && (
        <label htmlFor={fid} style={{
          display: "block", fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: 1,
          textTransform: "uppercase", color: C.muted, marginBottom: 7,
        }}>{label}</label>
      )}
      <input
        id={fid} value={value || ""} placeholder={placeholder || ""}
        inputMode={numeric ? "numeric" : "text"}
        onChange={(e) => onChange(numeric ? e.target.value.replace(/[^0-9]/g, "").slice(0, 3) : e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box", fontFamily: SANS, fontSize: 15.5,
          fontWeight: 300, color: C.ink, background: C.white,
          border: `1px solid ${C.line}`, borderRadius: 10, padding: "13px 15px",
          outline: "none", minHeight: 44,
        }}
      />
    </div>
  );
}

/* Auswahlknopf für Einfach- und Mehrfachauswahl */
function Choice({ label, note, selected, onClick, box = "check", disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={selected}
      style={{
        display: "flex", alignItems: "flex-start", gap: 13, width: "100%", textAlign: "left",
        padding: "14px 16px", marginBottom: 9, cursor: disabled ? "default" : "pointer",
        borderRadius: 12, minHeight: 44,
        border: `1px solid ${selected ? C.terra : C.line}`,
        background: selected ? C.terra : C.white,
        color: selected ? C.white : C.body,
        opacity: disabled && !selected ? 0.45 : 1,
      }}>
      <span aria-hidden="true" style={{
        width: 19, height: 19, flexShrink: 0, marginTop: 2,
        borderRadius: box === "radio" ? "50%" : 6,
        border: `1px solid ${selected ? C.white : C.line}`,
        background: selected ? C.white : "transparent",
        display: "grid", placeItems: "center",
      }}>
        {selected && <Check size={11} color={C.terra} />}
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontFamily: SANS, fontSize: 15, fontWeight: 400, lineHeight: 1.5 }}>{label}</span>
        {note && (
          <span style={{
            display: "block", fontFamily: SANS, fontSize: 13, fontWeight: 300, lineHeight: 1.5,
            marginTop: 5, color: selected ? "rgba(255,253,250,0.85)" : C.muted,
          }}>{note}</span>
        )}
      </span>
    </button>
  );
}

/* Einfachauswahl mit Beschriftung */
function Pick({ label, hint, options, value, onChange, optional }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {label && (
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: C.ink, marginBottom: hint ? 5 : 10, lineHeight: 1.45 }}>
          {label}
          {optional && (
            <span style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase",
              color: C.muted, marginLeft: 9, border: `1px solid ${C.line}`, borderRadius: 20, padding: "2px 9px",
              verticalAlign: "middle", whiteSpace: "nowrap",
            }}>freiwillig</span>
          )}
        </div>
      )}
      {hint && (
        <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 300, fontStyle: "italic", color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>{hint}</div>
      )}
      {options.map((o) => {
        const on = value === o;
        return (
          <button key={o} type="button" aria-pressed={on} onClick={() => onChange(on ? "" : o)}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
              padding: "12px 15px", marginBottom: 7, cursor: "pointer", borderRadius: 11, minHeight: 44,
              border: `1px solid ${on ? C.terra : C.line}`,
              background: on ? C.terra : C.white,
              color: on ? C.white : C.body,
            }}>
            <span aria-hidden="true" style={{
              width: 17, height: 17, flexShrink: 0, borderRadius: "50%",
              border: `1px solid ${on ? C.white : C.line}`,
              background: on ? C.white : "transparent", display: "grid", placeItems: "center",
            }}>
              {on && <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.terra }} />}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: on ? 500 : 300, lineHeight: 1.45 }}>{o}</span>
          </button>
        );
      })}
    </div>
  );
}

/* Mehrfachauswahl als Chips */
function Chips({ label, hint, options, values = [], onToggle, max, optional }) {
  const full = max && values.length >= max;
  return (
    <div style={{ marginBottom: 32 }}>
      {label && (
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: C.ink, marginBottom: hint ? 5 : 10, lineHeight: 1.45 }}>
          {label}
          {optional && (
            <span style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase",
              color: C.muted, marginLeft: 9, border: `1px solid ${C.line}`, borderRadius: 20, padding: "2px 9px",
              verticalAlign: "middle", whiteSpace: "nowrap",
            }}>freiwillig</span>
          )}
        </div>
      )}
      {hint && (
        <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 300, fontStyle: "italic", color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>
          {hint}{max ? ` Bis zu ${max}.` : ""}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => {
          const on = values.includes(o);
          return (
            <button key={o} type="button" aria-pressed={on} disabled={full && !on}
              onClick={() => onToggle(o)}
              style={{
                padding: "10px 15px", minHeight: 44, cursor: full && !on ? "default" : "pointer", borderRadius: 24,
                border: `1px solid ${on ? C.sage : C.line}`,
                background: on ? C.sage : C.white,
                color: on ? C.white : C.body,
                opacity: full && !on ? 0.4 : 1,
                fontFamily: SANS, fontSize: 13.5, fontWeight: on ? 500 : 300, lineHeight: 1.35, textAlign: "left",
              }}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

/* Bildauswahl im Raster */
function PhotoGrid({ options, images, values = [], onToggle, max }) {
  const full = max && values.length >= max;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, alignItems: "stretch" }}>
      {options.map((o) => {
        const on = values.includes(o.k);
        return (
          <button key={o.k} type="button" aria-pressed={on} disabled={full && !on}
            onClick={() => onToggle(o.k)}
            style={{
              position: "relative", padding: 0, overflow: "hidden", borderRadius: 12,
              cursor: full && !on ? "default" : "pointer", background: on ? C.sand : C.white,
              border: `2px solid ${on ? C.terra : "transparent"}`,
              boxShadow: on ? "none" : `0 0 0 1px ${C.line}`,
              opacity: full && !on ? 0.45 : 1,
              display: "flex", flexDirection: "column", width: "100%", height: "100%",
            }}>
            <span style={{ position: "relative", display: "block", width: "100%", paddingTop: "68%", overflow: "hidden", flexShrink: 0 }}>
              <img src={images[o.k]} alt="" style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center", display: "block",
              }} />
              <span aria-hidden="true" style={{
                position: "absolute", top: 9, left: 9, width: 22, height: 22, borderRadius: "50%",
                background: on ? C.terra : "rgba(255,253,250,0.9)",
                border: `1px solid ${on ? C.terra : "rgba(255,255,255,0.9)"}`,
                display: "grid", placeItems: "center",
              }}>
                {on && <Check size={13} color={C.white} />}
              </span>
            </span>
            <span style={{
              display: "flex", alignItems: "center", flex: 1, minHeight: 62,
              fontFamily: SANS, fontSize: 12.5, fontWeight: on ? 500 : 300, lineHeight: 1.4,
              color: on ? C.ink : C.body, padding: "10px 12px", textAlign: "left",
            }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* Umschalter zwischen den beiden Personen */
function WhoTabs({ who, setWho, names, counts }) {
  return (
    <div role="tablist" aria-label="Person auswählen" style={{
      display: "flex", background: C.taupe, borderRadius: 40, padding: 4, marginBottom: 22,
    }}>
      {["a", "b"].map((k) => (
        <button key={k} role="tab" aria-selected={who === k} type="button"
          onClick={() => setWho(k)}
          style={{
            flex: 1, padding: "12px 6px", minHeight: 44, cursor: "pointer",
            border: "none", borderRadius: 40,
            background: who === k ? C.terra : "transparent",
            color: who === k ? C.white : C.body,
            fontFamily: SANS, fontSize: 14.5, fontWeight: 500,
          }}>
          {names[k]}
          {counts && <span style={{ fontWeight: 300, opacity: 0.8 }}> ({counts[k]})</span>}
        </button>
      ))}
    </div>
  );
}


/* Beschriftung auf zwei Zeilen umbrechen, damit nichts abgeschnitten wird */
function wrapLabel(s) {
  if (s.length <= 11 || !s.includes(" ")) return [s];
  const words = s.split(" ");
  let best = 1, diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const l = words.slice(0, i).join(" ").length;
    const r = words.slice(i).join(" ").length;
    if (Math.abs(l - r) < diff) { diff = Math.abs(l - r); best = i; }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/* Netzdiagramm für zwei Personen */
function Radar({ a, b, names, showB, ideal }) {
  const W = 470, H = 350, cx = W / 2, cy = H / 2, R = 90, n = WHEEL_AREAS.length;
  const pt = (i, r) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
  };
  const poly = (vals) => WHEEL_AREAS
    .map((it, i) => pt(i, ((vals[it.k] || 0) / 10) * R).join(",")).join(" ");
  const anyA = WHEEL_AREAS.some((it) => a[it.k]);
  const anyB = WHEEL_AREAS.some((it) => b[it.k]);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Beziehungsrad mit acht Bereichen für ${names.a}${showB ? ` und ${names.b}` : ""}`}
        style={{ width: "100%", maxWidth: 480, display: "block", margin: "0 auto" }}>

        {/* ruhige Ringe statt Netz */}
        <circle cx={cx} cy={cy} r={R} fill={C.sand} fillOpacity="0.45" />
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <circle key={f} cx={cx} cy={cy} r={R * f} fill="none"
            stroke={C.line} strokeOpacity={f === 1 ? 0.9 : 0.45} strokeWidth="1" />
        ))}
        {WHEEL_AREAS.map((_, i) => {
          const [x, y] = pt(i, R);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y}
            stroke={C.line} strokeOpacity="0.35" strokeWidth="1" />;
        })}

        {ideal ? (
          <polygon points={WHEEL_AREAS.map((_, i) => pt(i, R).join(",")).join(" ")}
            fill={C.sage} fillOpacity="0.2" stroke={C.sage} strokeWidth="2.5"
            strokeLinejoin="round" />
        ) : (
          <>
            {showB && anyB && (
              <>
                <polygon points={poly(b)} fill={C.sage} fillOpacity="0.2"
                  stroke={C.sage} strokeWidth="2.5" strokeLinejoin="round" />
                {WHEEL_AREAS.map((it, i) => {
                  if (!b[it.k]) return null;
                  const [x, y] = pt(i, (b[it.k] / 10) * R);
                  return <circle key={it.k} cx={x} cy={y} r="4" fill={C.sage} />;
                })}
              </>
            )}
            {anyA && (
              <>
                <polygon points={poly(a)} fill={C.terra} fillOpacity="0.2"
                  stroke={C.terra} strokeWidth="2.5" strokeLinejoin="round" />
                {WHEEL_AREAS.map((it, i) => {
                  if (!a[it.k]) return null;
                  const [x, y] = pt(i, (a[it.k] / 10) * R);
                  return <circle key={it.k} cx={x} cy={y} r="4" fill={C.terra} />;
                })}
              </>
            )}
          </>
        )}

        {WHEEL_AREAS.map((it, i) => {
          const [x, y] = pt(i, R + 22);
          const anchor = Math.abs(x - cx) < 6 ? "middle" : x > cx ? "start" : "end";
          const lines = wrapLabel(it.label);
          const isTop = i === 0, isBottom = i === n / 2;
          const base = y + (isTop ? -6 : isBottom ? 6 : 0);
          return (
            <text key={it.k} x={x} textAnchor={anchor}
              style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, fill: C.ink }}>
              {lines.map((ln, li) => (
                <tspan key={li} x={x} y={base + (lines.length === 1 ? 5 : li === 0 ? -2 : 15)}>{ln}</tspan>
              ))}
            </text>
          );
        })}
      </svg>
      {showB && !ideal && (
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 6 }}>
          {[[C.terra, names.a], [C.sage, names.b]].map(([col, nm]) => (
            <span key={nm} style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: SANS, fontSize: 12.5, color: C.body }}>
              <span aria-hidden="true" style={{ width: 11, height: 11, borderRadius: 3, background: col }} />{nm}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* Regler mit Beschriftung */
function Slider({ label, desc, value, onChange, min = 1, max = 10, suffix, offen }) {
  const id = `sl-${label.replace(/\W/g, "")}`;
  return (
    <div style={{
      marginBottom: 18, padding: desc ? "16px 16px 12px" : 0,
      borderRadius: desc ? 12 : 0,
      background: desc ? (offen ? C.terraSoft : C.sand) : "transparent",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <label htmlFor={id} style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 500, color: C.ink }}>{label}</label>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, color: offen ? C.muted : C.terra }}>
          {value}{suffix || ""}
        </span>
      </div>
      {desc && (
        <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 300, lineHeight: 1.55, color: C.muted, margin: "6px 0 10px" }}>
          {desc}
        </p>
      )}
      <input id={id} type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: C.terra, height: 30, display: "block" }} />
      {desc && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 300, color: C.muted }}>da liegt was</span>
          <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 300, color: C.muted }}>läuft richtig gut</span>
        </div>
      )}
    </div>
  );
}

function Pill({ children, tone }) {
  const map = {
    gap: { bg: C.terraSoft, fg: C.terra, bd: C.terra },
    solo: { bg: "transparent", fg: C.muted, bd: C.line },
    duo: { bg: C.sageSoft, fg: C.sage, bd: C.sage },
  };
  const t = map[tone] || map.solo;
  return (
    <span style={{
      display: "inline-block", fontFamily: SANS, fontSize: 10.5, letterSpacing: 1.5,
      fontWeight: 600, textTransform: "uppercase", color: t.fg,
      background: t.bg, border: `1px solid ${t.bd}`, borderRadius: 20,
      padding: "3px 10px", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

/* =========================================================
   APP
========================================================= */
/*
  Teilt den Inhalt eines Kapitels automatisch in Übungen auf.
  Regel: Jede Karte beginnt eine neue Übung. Eine Auswertung schließt
  die Übung ab – sie steht also immer direkt bei der Aufgabe, zu der sie gehört.
*/
/* Rendert eine Frage entweder als Einfach- oder als Mehrfachauswahl */
function QBlock({ item, value, onChange }) {
  if (item.type === "one") {
    return (
      <Pick label={item.q} hint={item.hint} optional={item.optional} options={item.opts}
        value={value || ""} onChange={onChange} />
    );
  }
  const arr = value || [];
  const toggle = (o) => {
    const drin = arr.includes(o);
    if (!drin && item.max && arr.length >= item.max) return;
    onChange(drin ? arr.filter((x) => x !== o) : [...arr, o]);
  };
  return (
    <Chips label={item.q} hint={item.hint} optional={item.optional} options={item.opts}
      max={item.max} values={arr} onToggle={toggle} />
  );
}

function Steps({ children, step, setStep, setStepCount, setStepIsIntro }) {
  const groups = useMemo(() => {
    const flat = React.Children.toArray(children).filter(Boolean);
    const out = [];
    let cur = null, closed = true, hasCard = false;
    flat.forEach((ch) => {
      const t = ch.type;
      const isBox = t === Card;
      const isEnd = t === Result || t === Pending;
      if (closed || (isBox && hasCard)) {
        cur = []; out.push(cur); closed = false; hasCard = false;
      }
      cur.push(ch);
      if (isBox) hasCard = true;
      if (isEnd) closed = true;
    });
    return out.length ? out : [flat];
  }, [children]);

  const istIntro = (g) => g.some((ch) => ch.props && ch.props.intro);
  const total = groups.length;
  const idx = step < 0 ? total - 1 : Math.min(step, total - 1);
  const uebungen = groups.filter((g) => !istIntro(g)).length;
  const nummer = groups.slice(0, idx + 1).filter((g) => !istIntro(g)).length;
  const aktuellIntro = groups[idx] ? istIntro(groups[idx]) : false;

  useEffect(() => { setStepCount(total); }, [total]);
  useEffect(() => { if (step !== idx) setStep(idx); }, [idx]);
  useEffect(() => { if (setStepIsIntro) setStepIsIntro(aktuellIntro); }, [aktuellIntro]);

  return (
    <>
      {total > 1 && (
        <div className="no-print" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
            <span style={{
              fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: 1.6,
              textTransform: "uppercase", color: C.terra,
            }}>{aktuellIntro ? "Einführung" : `Übung ${nummer} von ${uebungen}`}</span>
            <div style={{ flex: 1, display: "flex", gap: 4 }}>
              {groups.map((_, i) => (
                <span key={i} aria-hidden="true" style={{
                  flex: 1, height: 4, borderRadius: 4,
                  background: i < idx ? C.terra : i === idx ? C.terra : C.taupe,
                  opacity: i > idx ? 1 : i === idx ? 1 : 0.45,
                }} />
              ))}
            </div>
          </div>
        </div>
      )}
      {groups[idx]}
    </>
  );
}

function App() {
  const [screen, setScreen] = useState("welcome");   // "welcome" | "toc" | 1..14 | "ende"
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [milestone, setMilestone] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tmp, setTmp] = useState({});            // flüchtige Eingaben
  const [step, setStep] = useState(0);          // aktuelle Übung im Kapitel
  const [stepCount, setStepCount] = useState(1);
  const [stepIsIntro, setStepIsIntro] = useState(false);   // steht gerade eine Einführung?
  const saveT = useRef(null);
  const pillT = useRef(null);
  const seenMs = useRef({});
  const posterRef = useRef(null);
  const railRef = useRef(null);

  const [d, setD] = useState({
    profile: { a: "", b: "", ageA: "", ageB: "" },
    useMode: "",
    wheel: { a: {}, b: {} },
    wheelSet: { a: {}, b: {} },
    wheelNote: "",
    story: {},
    storyAttract: { a: [], b: [] },
    storyAdmire: { a: [], b: [] },
    storyGrown: [],
    milestones: [],
    special: { label: "", date: "" },
    affection: { a: [], b: [] },
    qtime: { a: [], b: [] },
    seenMiss: { a: [], b: [] },
    seenWish: { a: [], b: [] },
    seen: { a: {}, b: {} },
    comm: { a: {}, b: {} },
    reach: { a: {}, b: {} },
    conflict: { a: [], b: [] },
    pause: {},
    repair: "",
    repairFirst: "",
    perpetual: [],
    perpetualWhy: [],
    values: { a: [], b: [] },
    valuesTop: { a: [], b: [] },
    core: [],
    money: {},
    moneyTasks: {},
    moneyNote: "",
    close: { a: {}, b: {} },
    closeFree: { a: "", b: "" },
    closeShared: "",
    outside: { open: [], private: [] },
    outsideNote: "",
    balance: { a: {}, b: {} },
    balanceNote: "",
    phases: {},
    phaseStatus: {},
    future: {},
    futureAreas: [],
    vision: [],
    rituals: [],
    ritualMarks: {},
    weekNote: "",
    mood: { nah: 55, mittel: 30, fern: 15 },
    dateSeason: "fruehling",
    dateDone: [],
    promise: "",
    letters: { a: "", b: "" },
    letterDate: "",
    visited: {},
    lastScreen: null,
  });

  /* ---------- Schriften ---------- */
  useEffect(() => {
    if (document.getElementById("wb-fonts")) return;
    const l = document.createElement("link");
    l.id = "wb-fonts";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Poppins:wght@300;400;500;600&family=Dancing+Script:wght@600&display=swap";
    document.head.appendChild(l);
  }, []);

  /* ---------- Laden ---------- */
  useEffect(() => {
    (async () => {
      try {
        const r = await store.get(STORAGE_KEY);
        if (r && r.value) setD((p) => ({ ...p, ...JSON.parse(r.value) }));
      } catch (e) { /* erster Besuch */ }
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback((next) => {
    if (saveT.current) clearTimeout(saveT.current);
    saveT.current = setTimeout(async () => {
      try {
        await store.set(STORAGE_KEY, JSON.stringify(next));
        setSaved(true);
        if (pillT.current) clearTimeout(pillT.current);
        pillT.current = setTimeout(() => setSaved(false), 1400);
      } catch (e) { console.error("Speichern fehlgeschlagen", e); }
    }, 450);
  }, []);

  const up = useCallback((fn) => {
    setD((prev) => {
      const next = typeof fn === "function" ? fn(prev) : { ...prev, ...fn };
      persist(next);
      return next;
    });
  }, [persist]);

  /* ---------- Namen ---------- */
  const names = useMemo(() => ({
    a: (d.profile.a || "").trim() || "Person A",
    b: (d.profile.b || "").trim() || "Person B",
  }), [d.profile.a, d.profile.b]);

  const other = (k) => (k === "a" ? names.b : names.a);


  /* ---------- Fortschritt ---------- */
  const chapterFilled = useCallback((id) => {
    const has = (o) => o && Object.values(o).some((v) => (typeof v === "string" ? v.trim() : (v || []).length));
    switch (id) {
      case 1: return has(d.story) || (d.milestones || []).length > 0 || has(d.storyAttract) || has(d.storyAdmire);
      case 2: return Object.keys(d.wheel.a).length > 0 || Object.keys(d.wheel.b).length > 0;
      case 3: return d.affection.a.length > 0 || d.affection.b.length > 0 || (d.qtime.a || []).length > 0 || (d.qtime.b || []).length > 0 || has(d.seen.a) || has(d.seen.b);
      case 4: return has(d.comm.a) || has(d.comm.b) || has(d.reach.a) || has(d.reach.b);
      case 5: return d.conflict.a.length > 0 || d.conflict.b.length > 0 || has(d.pause);
      case 6: return d.valuesTop.a.length > 0 || d.valuesTop.b.length > 0 || d.core.length > 0;
      case 7: return has(d.money);
      case 8: return has(d.close.a) || has(d.close.b) || has(d.closeFree) || !!d.closeShared.trim();
      case 9: return d.outside.open.length > 0 || d.outside.private.length > 0;
      case 10: return Object.keys(d.balance.a).length > 0 || Object.keys(d.balance.b).length > 0;
      case 11: return has(d.phaseStatus) || has(d.phases);
      case 12: return has(d.future) || d.futureAreas.length > 0 || d.vision.length > 0;
      case 13: return d.rituals.length > 0 || d.dateDone.length > 0 || Object.keys(d.ritualMarks).length > 0;
      case 14: return !!d.promise.trim();
      case 15: return d.rituals.length > 0 || d.core.length > 0 || d.dateDone.length > 0;
      case 16: return !!d.letters.a.trim() || !!d.letters.b.trim();
      default: return false;
    }
  }, [d]);

  const doneCount = CH.filter((c) => chapterFilled(c.id)).length;
  const pct = Math.round((doneCount / CH.length) * 100);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }, [screen]);

  useEffect(() => {
    if (!loaded) return;
    const hit = [...MILESTONES].reverse().find((m) => pct >= m.at);
    if (hit && !seenMs.current[hit.at]) {
      seenMs.current[hit.at] = true;
      if (pct > 0) setMilestone(hit);
    }
  }, [pct, loaded]);

  const go = (s, atStep) => {
    setScreen(s);
    setStep(typeof atStep === "number" ? atStep : 0);
    setStepCount(1);
    if (typeof s === "number") up((p) => ({ ...p, visited: { ...p.visited, [s]: true }, lastScreen: s }));
    else up((p) => ({ ...p, lastScreen: s }));
  };

  /* Weiter: erst durch die Übungen, dann ins nächste Kapitel */
  const next = () => {
    if (screen === "welcome") return go("toc");
    if (screen === "toc") return go(1);
    if (typeof screen === "number") {
      if (step < stepCount - 1) { setStep(step + 1); return; }
      return go(screen >= CH.length ? "ende" : screen + 1);
    }
  };
  const prev = () => {
    if (typeof screen === "number" && step > 0) { setStep(step - 1); return; }
    if (screen === "toc") return go("welcome");
    if (screen === 1) return go("toc");
    if (screen === "ende") return go(CH.length, -1);
    if (typeof screen === "number") return go(screen - 1, -1);
  };

  /* ---------- Kleine Helfer ---------- */
  const setIn = (path, key, val) => up((p) => ({ ...p, [path]: { ...p[path], [key]: val } }));
  const setWho2 = (path, who, key, val) => up((p) => ({
    ...p, [path]: { ...p[path], [who]: { ...p[path][who], [key]: val } },
  }));
  const toggleIn = (arr, val, max) => {
    const has = arr.includes(val);
    if (!has && max && arr.length >= max) return arr;
    return has ? arr.filter((x) => x !== val) : [...arr, val];
  };

  const who = tmp.who || "a";
  const setWho = (k) => setTmp((t) => ({ ...t, who: k }));

  /* Datumszeile für das Bild: nur das besondere Datum, sonst nichts */
  const dateLine = useCallback(() => {
    const sp = d.special || {};
    if (!sp.date) return "";
    const [y, m, day] = sp.date.split("-");
    if (!y || !m || !day) return "";
    const txt = new Date(Number(y), Number(m) - 1, Number(day))
      .toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
    return sp.label ? `${sp.label} ${txt}` : txt;
  }, [d.special]);

  /* =======================================================
     UNSER BILD – direkt auf eine Zeichenfläche gemalt.
     Dadurch ist die Vorschau exakt das, was gespeichert wird.
  ======================================================= */
  const PW = 1080, PH = 1350;
  const SER = "Georgia, 'Times New Roman', serif";
  const SNS = "Helvetica, Arial, sans-serif";

  /* Buchstaben einzeln setzen, damit Sperrung überall funktioniert */
  const spaced = (ctx, text, cx, y, spacing) => {
    const chars = Array.from(text);
    const w = chars.map((c) => ctx.measureText(c).width);
    const total = w.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let x = cx - total / 2;
    const prev = ctx.textAlign;
    ctx.textAlign = "left";
    chars.forEach((c, i) => { ctx.fillText(c, x, y); x += w[i] + spacing; });
    ctx.textAlign = prev;
  };

  const heart = (ctx, cx, cy, sc) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sc, sc);
    ctx.beginPath();
    ctx.moveTo(0, -4.2);
    ctx.bezierCurveTo(-1.6, -8.4, -8, -8.4, -8, -2.6);
    ctx.bezierCurveTo(-8, 2.4, -1.8, 6, 0, 8.4);
    ctx.bezierCurveTo(1.8, 6, 8, 2.4, 8, -2.6);
    ctx.bezierCurveTo(8, -8.4, 1.6, -8.4, 0, -4.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  /* Bilder einmal laden und behalten */
  const qtImgCache = useRef({});
  const loadImg = (src) => new Promise((res) => {
    if (qtImgCache.current[src]) return res(qtImgCache.current[src]);
    const im = new Image();
    im.onload = () => { qtImgCache.current[src] = im; res(im); };
    im.onerror = () => res(null);
    im.src = src;
  });

  const drawPoster = useCallback(async (cv) => {
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const rcx = 540, rcy = 522, rR = 168, n = WHEEL_AREAS.length;
    const pt = (i, r) => {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [rcx + Math.cos(ang) * r, rcy + Math.sin(ang) * r];
    };
    const hasA = WHEEL_AREAS.some((x) => d.wheel.a[x.k]);
    const hasB = WHEEL_AREAS.some((x) => d.wheel.b[x.k]);
    const qtBoth = (d.qtime.a || []).filter((x) => (d.qtime.b || []).includes(x)).slice(0, 4);
    const ms = (d.milestones || []).filter((x) => x.y)
      .sort((x, y) => x.y.localeCompare(y.y)).slice(0, 4);

    const labelBottom = rcy + rR + 38 + 12 + 27;
    const legendY = labelBottom + 34;
    const qtTitleY = legendY + 66;
    const qtImgY = qtTitleY + 26;
    const qtImgH = 138;
    const afterQt = qtBoth.length ? qtImgY + qtImgH : legendY;
    const msTitleY = afterQt + 62;
    const msRowY = msTitleY + 40;

    /* Hintergrund und Rahmen */
    ctx.clearRect(0, 0, PW, PH);
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, PW, PH);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(26, 26, PW - 52, PH - 52);
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.55;
    ctx.strokeRect(38, 38, PW - 76, PH - 76);
    ctx.globalAlpha = 1;

    /* Ecken */
    ctx.strokeStyle = C.terra;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.7;
    [[26, 26, 1, 1], [PW - 26, 26, -1, 1], [26, PH - 26, 1, -1], [PW - 26, PH - 26, -1, -1]]
      .forEach(([x0, y0, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(x0, y0 + sy * 4); ctx.lineTo(x0, y0 + sy * 46);
        ctx.moveTo(x0 + sx * 4, y0); ctx.lineTo(x0 + sx * 46, y0);
        ctx.stroke();
      });
    ctx.globalAlpha = 1;
    ctx.lineCap = "butt";

    /* weicher Kreis hinter dem Rad */
    ctx.fillStyle = C.sand;
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.arc(rcx, rcy, rR + 72, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    ctx.setLineDash([2, 9]);
    ctx.beginPath(); ctx.arc(rcx, rcy, rR + 72, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    /* Kopfzeile */
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = C.muted;
    ctx.font = `19px ${SNS}`;
    spaced(ctx, "UNSER BILD", rcx, 112, 7);

    ctx.textAlign = "center";
    ctx.fillStyle = C.ink;
    ctx.font = `66px ${SER}`;
    ctx.fillText(`${names.a} & ${names.b}`, rcx, 196);

    const dl = dateLine();
    if (dl) {
      ctx.fillStyle = C.muted;
      ctx.font = `21px ${SNS}`;
      ctx.fillText(dl, rcx, 239);
    }

    /* Zierlinie mit Herz */
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(392, 276); ctx.lineTo(500, 276);
    ctx.moveTo(580, 276); ctx.lineTo(688, 276);
    ctx.stroke();
    ctx.fillStyle = C.terra;
    heart(ctx, 540, 274, 1.5);

    /* Rad: Netz */
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.2;
    [2, 4, 6, 8, 10].forEach((lvl) => {
      ctx.beginPath();
      WHEEL_AREAS.forEach((_, i) => {
        const [x, y] = pt(i, (lvl / 10) * rR);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath(); ctx.stroke();
    });
    WHEEL_AREAS.forEach((_, i) => {
      const [x, y] = pt(i, rR);
      ctx.beginPath(); ctx.moveTo(rcx, rcy); ctx.lineTo(x, y); ctx.stroke();
    });

    const shape = (vals, col) => {
      ctx.beginPath();
      WHEEL_AREAS.forEach((it, i) => {
        const [x, y] = pt(i, ((vals[it.k] || 0) / 10) * rR);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = col; ctx.globalAlpha = 0.24; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
    };
    if (hasB) shape(d.wheel.b, C.sage);
    if (hasA) shape(d.wheel.a, C.terra);

    /* Radbeschriftung */
    ctx.fillStyle = C.ink;
    ctx.font = `20px ${SNS}`;
    WHEEL_AREAS.forEach((it, i) => {
      const [x, y] = pt(i, rR + 38);
      ctx.textAlign = Math.abs(x - rcx) < 6 ? "center" : x > rcx ? "left" : "right";
      const lines = wrapLabel(it.label);
      const isTop = i === 0, isBottom = i === n / 2;
      const base = y + (isTop ? -12 : isBottom ? 12 : 0);
      lines.forEach((ln, li) => {
        ctx.fillText(ln, x, base + (lines.length === 1 ? 7 : li === 0 ? -3 : 24));
      });
    });

    /* Legende */
    if (hasA || hasB) {
      ctx.textAlign = "left";
      ctx.font = `21px ${SNS}`;
      ctx.fillStyle = C.terra; ctx.fillRect(392, legendY, 18, 18);
      ctx.fillStyle = C.body; ctx.fillText(names.a, 420, legendY + 15);
      ctx.fillStyle = C.sage; ctx.fillRect(580, legendY, 18, 18);
      ctx.fillStyle = C.body; ctx.fillText(names.b, 608, legendY + 15);
    }

    const diamond = (x, y) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = C.terra; ctx.globalAlpha = 0.75;
      ctx.fillRect(-4.5, -4.5, 9, 9);
      ctx.restore();
    };

    /* Qualitätszeit */
    if (qtBoth.length) {
      ctx.fillStyle = C.terra;
      ctx.font = `18px ${SNS}`;
      spaced(ctx, "ZEIT, DIE UNS BEIDEN GUTTUT", rcx, qtTitleY, 5);
      diamond(232, qtTitleY - 6);
      diamond(848, qtTitleY - 6);

      const gap = 16;
      const cw = Math.min(224, (820 - (qtBoth.length - 1) * gap) / qtBoth.length);
      const total = qtBoth.length * cw + (qtBoth.length - 1) * gap;
      const imgs = await Promise.all(qtBoth.map((k) => loadImg(QT_IMG[k])));
      imgs.forEach((im, i) => {
        const x = (PW - total) / 2 + i * (cw + gap);
        if (im) {
          const sc = Math.max(cw / im.width, qtImgH / im.height);
          const sw = cw / sc, sh = qtImgH / sc;
          ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, qtImgY, cw, qtImgH);
        } else {
          ctx.fillStyle = C.sand; ctx.fillRect(x, qtImgY, cw, qtImgH);
        }
        ctx.strokeStyle = C.line; ctx.lineWidth = 1;
        ctx.strokeRect(x, qtImgY, cw, qtImgH);
      });
    }

    /* Zeitleiste */
    if (ms.length) {
      ctx.fillStyle = C.terra;
      ctx.font = `18px ${SNS}`;
      spaced(ctx, "UNSERE ZEITLEISTE", rcx, msTitleY, 5);
      diamond(232, msTitleY - 6);
      diamond(848, msTitleY - 6);

      if (ms.length > 1) {
        ctx.strokeStyle = C.line; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(352, msRowY - 8);
        ctx.lineTo(352, msRowY + (ms.length - 1) * 36 - 8);
        ctx.stroke();
      }
      ms.forEach((m, i) => {
        const y = msRowY + i * 36;
        ctx.textAlign = "right";
        ctx.fillStyle = C.terra; ctx.font = `28px ${SER}`;
        ctx.fillText(m.y, 318, y);
        ctx.beginPath(); ctx.arc(352, y - 8, 7, 0, Math.PI * 2);
        ctx.fillStyle = C.terra; ctx.fill();
        ctx.beginPath(); ctx.arc(352, y - 8, 12, 0, Math.PI * 2);
        ctx.strokeStyle = C.terra; ctx.lineWidth = 1; ctx.globalAlpha = 0.4; ctx.stroke(); ctx.globalAlpha = 1;
        ctx.textAlign = "left";
        ctx.fillStyle = C.ink; ctx.font = `23px ${SNS}`;
        ctx.fillText(m.t, 384, y);
      });
    } else if (d.core.length === 3) {
      ctx.textAlign = "center";
      ctx.fillStyle = C.ink; ctx.font = `40px ${SER}`;
      ctx.fillText(d.core.join("  ·  "), rcx, msTitleY + 20);
    }

    /* Fußzeile */
    ctx.fillStyle = C.muted;
    ctx.font = `19px ${SNS}`;
    spaced(ctx, "WIR ZWEI · UNSER BEZIEHUNGSJOURNAL", rcx, PH - 62, 3);
    ctx.textAlign = "left";
  }, [d, names, dateLine]);

  /* Vorschau neu zeichnen, sobald Kapitel 14 offen ist */
  useEffect(() => {
    if (screen !== 14) return;
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) drawPoster(posterRef.current);
    }, 60);
    return () => { cancelled = true; clearTimeout(t); };
  }, [screen, drawPoster]);

  /* Aktives Kapitel im Streifen sichtbar halten */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof screen !== "number") return;
    const btn = rail.querySelector('[data-ch="' + screen + '"]');
    if (btn && btn.scrollIntoView) {
      btn.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [screen]);

  /* Bei jedem Übungswechsel nach oben springen */
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen, step]);

  const posterFile = async () => {
    const cv = posterRef.current;
    if (!cv) throw new Error("Zeichenfläche fehlt");
    await drawPoster(cv);
    const fname = `wir-zwei-${names.a}-${names.b}.png`.replace(/\s+/g, "-").toLowerCase();
    const dataUrl = cv.toDataURL("image/png");
    const blob = await new Promise((res) => cv.toBlob(res, "image/png"));
    return { blob, dataUrl, fname };
  };

  /*
    Speichern in drei Stufen, weil die App in einem eingebetteten Rahmen läuft
    und dort sowohl das Teilen-Menü als auch klassische Downloads blockiert sein können:
    1. Teilen-Menü (führt auf dem Handy zu „Bild sichern“)
    2. normaler Download
    3. das Bild einfach anzeigen – langes Antippen speichert es in die Galerie
  */
  const sharePoster = async () => {
    try {
      const { blob, dataUrl, fname } = await posterFile();
      if (blob && navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], fname, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file] });
            setTmp((t) => ({ ...t, posterFail: false }));
            return;
          }
        } catch (err) {
          if (err && err.name === "AbortError") return;
        }
      }
      setTmp((t) => ({ ...t, posterImg: dataUrl, posterName: fname, posterFail: false }));
    } catch (e) {
      setTmp((t) => ({ ...t, posterFail: true }));
    }
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: C.paper, display: "grid", placeItems: "center", padding: 24 }}>
        <p style={{ fontFamily: SERIF, fontSize: 26, color: C.ink, margin: 0 }}>Einen Moment …</p>
      </div>
    );
  }

  /* =======================================================
     WILLKOMMEN
  ======================================================= */
  const resumeAt = (() => {
    const ls = d.lastScreen;
    if (!ls || ls === "welcome" || ls === "toc") return null;
    return ls;
  })();

  const Welcome = () => {
    const a = parseInt(d.profile.ageA, 10), b = parseInt(d.profile.ageB, 10);
    const gap = !isNaN(a) && !isNaN(b) ? Math.abs(a - b) : null;
    const mode = USE_MODES.find((m) => m.k === d.useMode);
    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: 52, paddingTop: 12 }}>
          <div aria-hidden="true" style={{ color: C.line, fontSize: 17, letterSpacing: 10, marginBottom: 22 }}>✦ ✦ ✦</div>
          <h1 style={{
            fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(38px, 10vw, 62px)",
            lineHeight: 1.04, color: C.ink, margin: "0 0 18px",
          }}>Wir zwei</h1>
          <p style={{
            fontFamily: SANS, fontSize: 15, fontWeight: 300, lineHeight: 1.6,
            color: C.muted, maxWidth: 400, margin: "0 auto",
          }}>Das interaktive Beziehungsjournal für Paare, die sich bewusster verstehen und gemeinsam wachsen möchten. Mit drei eigenen Kapiteln für Paare mit Altersunterschied.</p>
        </div>

        <div style={{ maxWidth: 460, margin: "0 auto 46px" }}>
          <p style={{
            fontFamily: SERIF, fontSize: "clamp(21px, 5.2vw, 26px)", fontStyle: "italic",
            lineHeight: 1.5, color: C.ink, textAlign: "center", margin: "0 0 26px",
          }}>
            Man weiß erstaunlich genau, wie die andere Person ihren Kaffee trinkt. Und erstaunlich wenig darüber,
            was sie gerade beschäftigt.
          </p>
          <p style={{
            fontFamily: SANS, fontSize: 15.5, fontWeight: 300, lineHeight: 1.8,
            color: C.body, textAlign: "center", margin: 0,
          }}>
            Nicht aus Desinteresse. Es kommt nur nie der passende Moment. Dieses Journal stellt euch die Fragen,
            für die von allein kein Anlass entsteht – und sagt euch nach jeder Übung, was eure Antworten über euch verraten.
          </p>
        </div>

        <Card>
          <H3>Was euch erwartet</H3>
          <div>
            {[
              ["16 Kapitel", "in kleine Übungen aufgeteilt, eine pro Bildschirm"],
              ["Rund 10 Minuten", "pro Kapitel – ihr könnt jederzeit aufhören und später weitermachen"],
              ["Auswertung sofort", "nach jeder Übung, nicht erst ganz am Ende"],
              ["Alles bleibt bei euch", "die Antworten werden nur auf diesem Gerät gespeichert"],
            ].map(([t, sub]) => (
              <div key={t} style={{ display: "flex", gap: 13, alignItems: "flex-start", marginBottom: 18 }}>
                <span aria-hidden="true" style={{
                  width: 7, height: 7, borderRadius: "50%", background: C.terra, marginTop: 9, flexShrink: 0,
                }} />
                <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: C.body, margin: 0 }}>
                  <strong style={{ fontWeight: 600, color: C.ink }}>{t}</strong> – {sub}
                </p>
              </div>
            ))}
          </div>
          <P style={{ marginTop: 8, marginBottom: 0, fontSize: 14.5 }}>
            Kein Test, keine Punktzahl, keine richtige Antwort. Am Ende habt ihr ein Manifest, ein Bild zum Aufhängen –
            und ein paar Gespräche, die sonst nicht stattgefunden hätten.
          </P>
        </Card>

        <Card tone="white">
          <H3>Unsere Empfehlung: ein Kapitel pro Abend</H3>
          <P>
            Ihr könntet das an einem Wochenende durcharbeiten. Wir raten davon ab. Die Fragen wirken nach,
            und dafür brauchen sie Abstand – ein Kapitel, dann darüber reden, dann schlafen.
          </P>
          <P style={{ marginBottom: 0 }}>
            In zwei bis drei Wochen seid ihr durch. Das klingt lang und ist es nicht: Es sind zehn Minuten am Abend,
            statt eines Abends, nach dem ihr beide erschöpft seid und die Hälfte wieder vergessen habt.
          </P>
        </Card>

        <Card>
          <H3>Wer seid ihr?</H3>
          <P style={{ fontSize: 14, marginBottom: 18 }}>Tragt eure Namen ein. Dann spricht euch das Journal persönlich an statt von „Person A“ und „Person B“. Das Alter ist freiwillig.</P>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <TextInput label="Name" flex={2} value={d.profile.a} placeholder="z. B. Alex"
              onChange={(v) => setIn("profile", "a", v)} />
            <TextInput label="Alter" flex={1} numeric value={d.profile.ageA}
              onChange={(v) => setIn("profile", "ageA", v)} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <TextInput label="Name" flex={2} value={d.profile.b} placeholder="z. B. Sam"
              onChange={(v) => setIn("profile", "b", v)} />
            <TextInput label="Alter" flex={1} numeric value={d.profile.ageB}
              onChange={(v) => setIn("profile", "ageB", v)} />
          </div>
          {gap !== null && (
            <p style={{
              fontFamily: SANS, fontSize: 14.5, fontWeight: 300, lineHeight: 1.6, color: C.body,
              marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.line}`,
            }}>
              {gap === 0
                ? "Ihr seid gleich alt. Auch dann sind Lebensphasen selten identisch – die Kapitel funktionieren genauso."
                : `Zwischen euch liegen ${gap} ${gap === 1 ? "Jahr" : "Jahre"}. Drei Kapitel gehen darauf besonders ein. Der Rest gilt für jedes Paar.`}
            </p>
          )}
        </Card>

        <Card>
          <H3>Wie möchtet ihr das Journal nutzen?</H3>
          <P style={{ fontSize: 14, marginBottom: 18 }}>Das ändert nichts an den Inhalten – es hilft nur, realistisch zu planen.</P>
          {USE_MODES.map((m) => (
            <Choice key={m.k} label={m.label} note={m.note} box="radio"
              selected={d.useMode === m.k}
              onClick={() => up((p) => ({ ...p, useMode: p.useMode === m.k ? "" : m.k }))} />
          ))}
          {mode && (
            <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 300, lineHeight: 1.6, color: C.body, marginTop: 14, marginBottom: 0 }}>
              Gute Wahl. {mode.note}
            </p>
          )}
        </Card>

        <Card tone="sage">
          <H3>Bevor ihr anfangt</H3>
          {[
            "Niemand muss alles beantworten. Fragen, die als freiwillig gekennzeichnet sind, dürft ihr überspringen – und alle anderen auch.",
            "Pausen sind ausdrücklich erlaubt. Alles speichert sich automatisch, ihr könnt jederzeit zurückkommen.",
            "Was hier geteilt wird, wird nicht gegen die andere Person verwendet. Das ist die einzige Regel, die wirklich zählt.",
          ].map((t) => (
            <div key={t} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <span aria-hidden="true" style={{ color: C.sage, flexShrink: 0, marginTop: 2 }}>—</span>
              <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: C.body, margin: 0 }}>{t}</p>
            </div>
          ))}
        </Card>

        <Card tone="white">
          <H3>Wenn eine Antwort wehtut</H3>
          <P style={{ fontSize: 14.5 }}>
            Irgendwann passiert es. Eine:r von euch sagt etwas, das der andere so nicht auf dem Schirm hatte, und der Abend kippt kurz.
            Das heißt nicht, dass etwas schiefläuft. Meistens ist genau das die Stelle, an der es interessant wird.
          </P>
          <P style={{ fontSize: 14, marginBottom: 14 }}>Drei Sätze, die in so einem Moment mehr helfen als jede Erklärung:</P>
          {SOFT_LINES.map((line) => (
            <div key={line} style={{
              display: "flex", gap: 11, alignItems: "flex-start",
              background: C.sand, borderRadius: 10, padding: "12px 14px", marginBottom: 7,
            }}>
              <span aria-hidden="true" style={{ color: C.line, fontFamily: SERIF, fontSize: 21, lineHeight: 1, marginTop: 2 }}>„</span>
              <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 300, lineHeight: 1.55, color: C.ink, margin: 0 }}>{line}</p>
            </div>
          ))}
          <P style={{ marginTop: 16, marginBottom: 0 }}>
            Und eine Abmachung vorab: Wer etwas ausspricht, tut es nicht, um zu verletzen. Wer etwas hört, muss es nicht sofort einordnen.
            Ihr dürft ein Thema offen liegen lassen und morgen weitermachen.
          </P>
        </Card>

        <Card>
          <H3>Wo dieses Journal aufhört</H3>
          <P style={{ marginBottom: 0 }}>
            Es funktioniert unter einer Bedingung: Beide machen freiwillig mit, und keiner von euch hat Angst vor der Reaktion des anderen.
            Wenn das gerade nicht so ist – wenn ihr in einer echten Krise steckt, etwas Größeres passiert ist oder ein Gespräch schon lange nicht mehr
            ohne Eskalation möglich war –, dann ist ein Workbook nicht das falsche, aber das zu kleine Werkzeug. Dafür gibt es Paarberatung,
            und das früh in Anspruch zu nehmen ist kein Scheitern, sondern schlicht effizienter.
          </P>
        </Card>

        <div style={{ textAlign: "center", marginTop: 30, marginBottom: 26 }}>
          {resumeAt ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Btn onClick={() => go(resumeAt)}>
                {typeof resumeAt === "number" ? `Weiter bei Kapitel ${resumeAt}` : "Weitermachen"} <ChevronRight size={16} />
              </Btn>
              <Btn variant="ghost" onClick={() => go("toc")}>Zur Übersicht</Btn>
            </div>
          ) : (
            <Btn onClick={() => go("toc")}>Weiter zur Übersicht <ChevronRight size={16} /></Btn>
          )}
        </div>

        {FinePrint()}
      </div>
    );
  };

  const FinePrint = () => (
    <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 20, marginTop: 10 }}>
      <p style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 300, lineHeight: 1.65, color: C.muted, margin: "0 0 10px" }}>
        <Lock size={11} style={{ verticalAlign: "-1px", marginRight: 6 }} aria-hidden="true" />
        {PRIVACY}
      </p>
      <p style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 300, lineHeight: 1.65, color: C.muted, margin: 0 }}>
        {DISCLAIMER}
      </p>
    </div>
  );

  /* =======================================================
     ÜBERSICHT
  ======================================================= */
  const Toc = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Kicker>Die Reise</Kicker>
        <H2>{d.profile.a ? `${names.a} und ${names.b}` : "Sechzehn Kapitel"}</H2>
        <p style={{
          fontFamily: SERIF, fontSize: 20, fontStyle: "italic", lineHeight: 1.5,
          color: C.body, maxWidth: 460, margin: "18px auto 0",
        }}>Ihr müsst nicht der Reihe nach vorgehen. Aber es lohnt sich.</p>
      </div>

      {ProgressBar()}

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Btn onClick={() => go(resumeAt || 1)}>
          {resumeAt ? `Weiter bei Kapitel ${resumeAt}` : "Mit Kapitel 1 beginnen"} <ChevronRight size={16} />
        </Btn>
      </div>

      {CH.map((c) => {
        const done = chapterFilled(c.id);
        return (
          <button key={c.id} type="button" onClick={() => go(c.id)}
            style={{
              display: "flex", gap: 15, alignItems: "flex-start", width: "100%", textAlign: "left",
              background: C.sand, border: "none", borderRadius: 14, cursor: "pointer",
              padding: "18px 18px", marginBottom: 9, minHeight: 44,
            }}>
            <span aria-hidden="true" style={{
              fontFamily: SERIF, fontSize: 21, fontWeight: 500, lineHeight: 1.15,
              color: done ? C.terra : C.muted, width: 24, flexShrink: 0,
            }}>{done ? "✓" : c.id}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: C.ink }}>{c.title}</span>
                {c.ageGap && <Pill tone="gap">Altersunterschied</Pill>}
              </span>
              <span style={{ display: "block", fontFamily: SANS, fontSize: 13.5, fontWeight: 300, lineHeight: 1.5, color: C.body, marginBottom: 6 }}>
                {c.teaser}
              </span>
              <Pill tone={c.mode === "gemeinsam" ? "duo" : "solo"}>{c.mode}</Pill>
            </span>
            <ChevronRight size={17} color={C.line} style={{ flexShrink: 0, marginTop: 4 }} aria-hidden="true" />
          </button>
        );
      })}

      <Card tone="white" style={{ marginTop: 22 }}>
        <H3>Zwei Hinweise, die den Unterschied machen</H3>
        <P>Fangt nicht an, wenn ihr müde seid oder gerade Streit hattet. Das klingt banal und entscheidet trotzdem darüber, ob die Antworten ehrlich oder ausweichend werden.</P>
        <P style={{ marginBottom: 0 }}>Und wenn eine Frage unangenehm ist, überspringt sie nicht sofort. Meistens ist genau die gemeint. Ihr dürft sie trotzdem liegen lassen und später zurückkommen.</P>
      </Card>

      <div style={{ textAlign: "center", marginTop: 26, marginBottom: 26 }}>
        <Btn onClick={() => go(resumeAt || 1)}>
          {resumeAt ? `Weiter bei Kapitel ${resumeAt}` : "Mit Kapitel 1 beginnen"} <ChevronRight size={16} />
        </Btn>
      </div>
      {FinePrint()}
    </div>
  );

  const ProgressBar = () => (
    <div style={{ marginBottom: 26 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 12,
        letterSpacing: 1.2, textTransform: "uppercase", color: C.muted, marginBottom: 8,
      }}>
        <span>{doneCount} von {CH.length} Kapiteln begonnen</span>
        <span>{pct} %</span>
      </div>
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
        style={{ height: 5, background: C.taupe, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: C.terra, borderRadius: 4, transition: "width .35s" }} />
      </div>
    </div>
  );

  /* =======================================================
     KAPITEL 1 – UNSERE GESCHICHTE
  ======================================================= */
  const Ch1 = () => {
    const ms = d.milestones || [];
    const msSorted = [...ms].sort((x, y) => (x.y || "9999").localeCompare(y.y || "9999"));
    const norm = (v) => (v && !Array.isArray(v) ? v : { a: [], b: [] });
    const admire = norm(d.storyAdmire);
    const attract = norm(d.storyAttract);
    const bothAdmire = (admire.a || []).length > 0 && (admire.b || []).length > 0;
    const picked = [
      d.story.kennen, d.story.ernst,
      (attract.a || []).length + (attract.b || []).length,
      (admire.a || []).length + (admire.b || []).length,
      (d.storyGrown || []).length, ms.length,
    ].filter(Boolean).length;

    const addMs = (t) => up((p) => {
      const cur = p.milestones || [];
      return cur.some((x) => x.t === t)
        ? { ...p, milestones: cur.filter((x) => x.t !== t) }
        : { ...p, milestones: [...cur, { t, y: "" }] };
    });
    const setYear = (t, y) => up((p) => ({
      ...p, milestones: (p.milestones || []).map((x) => (x.t === t ? { ...x, y } : x)),
    }));
    /* Erst nach dem Tippen sortieren – während der Eingabe würde das Feld den Fokus verlieren */
    const sortiereMeilensteine = () => up((p) => ({
      ...p,
      milestones: [...(p.milestones || [])].sort((x, y) => (x.y || "9999").localeCompare(y.y || "9999")),
    }));

    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Jedes Paar hat eine Version seiner Geschichte, die es Fremden erzählt. Kurz, rund, ein bisschen glattgeschliffen.</>
          <>Und darunter liegt die andere: mit den Umwegen, den Zweifeln, dem Moment, in dem es auch hätte anders laufen können. Um die geht es hier.</>
        </Lead>

        <Card>
          <Pick label="Wie habt ihr euch kennengelernt?" options={STORY_HOW}
            value={d.story.kennen} onChange={(v) => setIn("story", "kennen", v)} />
          {d.story.kennen === "Ganz anders" && (
            <Field label="Dann erzählt kurz, wie es war" rows={3}
              placeholder="Zwei Sätze reichen."
              value={d.story.kennenText} onChange={(v) => setIn("story", "kennenText", v)} />
          )}
          <Pick label="Wann wurde euch klar, dass es ernst wird?" options={STORY_REAL}
            hint="Es gibt selten einen großen Moment. Meistens ist es ein unspektakulärer."
            value={d.story.ernst} onChange={(v) => setIn("story", "ernst", v)} />
          {d.story.ernst === "Ein anderer Moment" && (
            <Field label="Welcher Moment war es?" rows={3}
              placeholder="Auch ein ganz kleiner zählt."
              value={d.story.ernstText} onChange={(v) => setIn("story", "ernstText", v)} />
          )}
        </Card>

        <Card tone="white">
          <H3>Euer besonderes Datum</H3>
          <P style={{ fontSize: 14, marginBottom: 16 }}>
            Ein Datum, das für euch zählt. Es erscheint später oben auf eurem Bild in Kapitel 14.
          </P>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
            {SPECIAL_LABELS.map((l) => {
              const on = (d.special || {}).label === l;
              return (
                <button key={l} type="button" aria-pressed={on}
                  onClick={() => setIn("special", "label", on ? "" : l)}
                  style={{
                    padding: "10px 15px", minHeight: 44, cursor: "pointer", borderRadius: 24,
                    border: `1px solid ${on ? C.terra : C.line}`,
                    background: on ? C.terra : C.white,
                    color: on ? C.white : C.body,
                    fontFamily: SANS, fontSize: 13.5, fontWeight: on ? 500 : 300,
                  }}>{l}</button>
              );
            })}
          </div>
          <input type="date" value={(d.special || {}).date || ""}
            aria-label="Besonderes Datum"
            onChange={(e) => setIn("special", "date", e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box", fontFamily: SANS, fontSize: 15.5,
              fontWeight: 300, color: C.ink, background: C.white,
              border: `1px solid ${C.line}`, borderRadius: 10, padding: "13px 15px",
              outline: "none", minHeight: 44,
            }} />
          {(d.special || {}).date && (
            <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 300, color: C.muted, margin: "12px 0 0", lineHeight: 1.5 }}>
              Auf eurem Bild steht dann: <span style={{ color: C.ink }}>{dateLine()}</span>
            </p>
          )}
        </Card>

        <Card tone="white">
          <H3>Unsere Zeitleiste</H3>
          <P style={{ fontSize: 14, marginBottom: 16 }}>
            Tippt an, was zu euch gehört, und tragt das Jahr ein. Am Ende habt ihr eure Geschichte auf einen Blick –
            und meistens fällt dabei auf, wie viel in kurzer Zeit passiert ist.
          </P>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: ms.length ? 22 : 0 }}>
            {MILESTONE_IDEAS.map((t) => {
              const on = ms.some((x) => x.t === t);
              return (
                <button key={t} type="button" aria-pressed={on} onClick={() => addMs(t)}
                  style={{
                    padding: "10px 15px", minHeight: 44, cursor: "pointer", borderRadius: 24,
                    border: `1px solid ${on ? C.sage : C.line}`,
                    background: on ? C.sage : C.white,
                    color: on ? C.white : C.body,
                    fontFamily: SANS, fontSize: 13.5, fontWeight: on ? 500 : 300,
                  }}>{t}</button>
              );
            })}
          </div>

          {ms.length > 0 && (
            <div style={{ position: "relative", paddingLeft: 26, marginTop: 4 }}>
              <span aria-hidden="true" style={{
                position: "absolute", left: 5, top: 14, bottom: 14, width: 2, background: C.line,
              }} />
              {ms.map((x, i) => (
                <div key={x.t} style={{
                  position: "relative", display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 0", borderTop: i === 0 ? "none" : `1px solid ${C.line}`,
                }}>
                  <span aria-hidden="true" style={{
                    position: "absolute", left: -26, width: 12, height: 12, borderRadius: "50%",
                    background: x.y ? C.terra : C.taupe, border: `2px solid ${C.paper}`,
                  }} />
                  <span style={{ flex: 1, minWidth: 0, fontFamily: SANS, fontSize: 14.5, fontWeight: 400, color: C.ink, lineHeight: 1.4 }}>{x.t}</span>
                  <input value={x.y || ""} placeholder="Jahr" inputMode="numeric" aria-label={`Jahr für ${x.t}`}
                    onChange={(e) => setYear(x.t, e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                    onBlur={sortiereMeilensteine}
                    style={{
                      width: 74, flexShrink: 0, boxSizing: "border-box", textAlign: "center",
                      fontFamily: SANS, fontSize: 14.5, fontWeight: 400, color: C.ink, background: C.sand,
                      border: `1px solid ${C.line}`, borderRadius: 9, padding: "10px 6px", outline: "none", minHeight: 44,
                    }} />
                </div>
              ))}
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, paddingTop: 14 }}>
                <span aria-hidden="true" style={{
                  position: "absolute", left: -26, width: 12, height: 12, borderRadius: "50%",
                  background: C.paper, border: `2px solid ${C.terra}`,
                }} />
                <span style={{ fontFamily: SERIF, fontSize: 20, fontStyle: "italic", color: C.terra }}>heute</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 300, color: C.muted, lineHeight: 1.5 }}>
                  – und hier fängt der Rest an
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <H3>Kurz getrennt: was jede:r für sich sieht</H3>
          <P style={{ fontSize: 14, marginBottom: 16 }}>
            Bei diesen beiden Fragen kommt selten dasselbe heraus – und das ist der interessante Teil.
            Schaltet oben um und antwortet nacheinander, bevor ihr vergleicht.
          </P>
          <WhoTabs who={who} setWho={setWho} names={names}
            counts={{ a: (admire.a || []).length + (attract.a || []).length, b: (admire.b || []).length + (attract.b || []).length }} />
          <Chips label={`Was hat ${names[who]} am Anfang an ${other(who)} angezogen?`} max={3}
            hint="Nicht nur das Offensichtliche. Oft war es eine Kleinigkeit."
            options={STORY_ATTRACT} values={attract[who] || []}
            onToggle={(o) => up((p) => ({ ...p, storyAttract: { ...attract, [who]: toggleIn(attract[who] || [], o, 3) } }))} />
          <Chips label={`Was bewundert ${names[who]} heute an ${other(who)}?`} max={3}
            hint="Heute, nicht damals. Das ist oft etwas anderes geworden."
            options={STORY_ADMIRE} values={admire[who] || []}
            onToggle={(o) => up((p) => ({ ...p, storyAdmire: { ...admire, [who]: toggleIn(admire[who] || [], o, 3) } }))} />
        </Card>

        {bothAdmire && (
          <Result title="Was ihr aneinander seht">
            <P>
              {names.a} bewundert an {names.b}: <strong style={{ fontWeight: 600, color: C.ink }}>{admire.a.join(", ")}</strong>.
            </P>
            <P>
              {names.b} bewundert an {names.a}: <strong style={{ fontWeight: 600, color: C.ink }}>{admire.b.join(", ")}</strong>.
            </P>
            <P style={{ marginBottom: 0 }}>
              Lest euch das gegenseitig einmal laut vor. Die meisten Menschen wissen erstaunlich genau, wofür sie kritisiert werden,
              und erstaunlich wenig darüber, wofür sie bewundert werden.
            </P>
          </Result>
        )}

        <Card>
          <Chips label="Was ist seit dem Anfang gewachsen?" max={3}
            hint="Diese Frage gilt euch beiden – hier reicht eine gemeinsame Antwort."
            options={STORY_GROWN} values={d.storyGrown || []}
            onToggle={(o) => up((p) => ({ ...p, storyGrown: toggleIn(p.storyGrown || [], o, 3) }))} />
          <Pick label="Welche Art von Erinnerung beschreibt euch am besten?" options={MEMORY_KINDS}
            hint="Nicht die schönste – die typischste. Sucht euch die Schublade aus, dann kommt der Rest von allein."
            value={d.story.erinnerungArt} onChange={(v) => setIn("story", "erinnerungArt", v)} />
          {d.story.erinnerungArt && (
            <Field label="Und welche genau?" rows={3} optional
              hint={MEMORY_HINTS[d.story.erinnerungArt] || ""}
              placeholder="Zwei, drei Sätze reichen völlig."
              value={d.story.erinnerung} onChange={(v) => setIn("story", "erinnerung", v)} />
          )}
        </Card>

        {picked < 3 && (
          <Pending>Bearbeitet drei der Aufgaben – dann steht hier, worauf ihr beim Vergleich eurer Erinnerungen achten könnt.</Pending>
        )}

        {picked >= 3 && (
          <Result title="Was euch dieses Kapitel gezeigt hat">
            {msSorted.filter((x) => x.y).length >= 2 && (
              <P>
                Eure Zeitleiste reicht von <strong style={{ fontWeight: 600, color: C.ink }}>{msSorted.filter((x) => x.y)[0].y}</strong> bis
                {" "}<strong style={{ fontWeight: 600, color: C.ink }}>{msSorted.filter((x) => x.y).slice(-1)[0].y}</strong>.
                Schaut sie euch einmal zusammen an – vor allem die Jahre, in denen mehrere Punkte dicht beieinander liegen.
              </P>
            )}
            <P>Wenn ihr das zu zweit ausgefüllt habt, ist euch vermutlich aufgefallen: An mindestens einer Stelle erinnert ihr euch unterschiedlich. Das ist normal und kein Streitpunkt – zwei Menschen erleben denselben Moment aus zwei Perspektiven, und die eigene Erinnerung fühlt sich immer wie die richtige an.</P>
            <P style={{ marginBottom: 0 }}>Interessanter als die Frage, wer recht hat, ist diese: Was sagt es über euch, dass jede:r sich ausgerechnet an <em>diesen</em> Teil erinnert?</P>
          </Result>
        )}
      </Steps>
    );
  };


  /* =======================================================
     KAPITEL 2 – WO WIR GERADE STEHEN
  ======================================================= */
  const Ch2 = () => {
    const mine = d.wheel[who] || {};
    /* „bestätigt“ heißt: bewusst angefasst – auch wenn der Wert bei 5 bleibt */
    const set = (w) => d.wheelSet && d.wheelSet[w] ? d.wheelSet[w] : {};
    const okd = (w, k) => !!(set(w)[k] || (d.wheel[w] || {})[k]);
    const doneA = WHEEL_AREAS.filter((x) => okd("a", x.k)).length;
    const doneB = WHEEL_AREAS.filter((x) => okd("b", x.k)).length;
    const doneMine = WHEEL_AREAS.filter((x) => okd(who, x.k)).length;
    const offene = WHEEL_AREAS.filter((x) => !okd(who, x.k));
    const full = doneMine === WHEEL_AREAS.length;
    const bothFull = doneA === WHEEL_AREAS.length && doneB === WHEEL_AREAS.length;

    const setWheel = (k, v) => up((p) => ({
      ...p,
      wheel: { ...p.wheel, [who]: { ...p.wheel[who], [k]: v } },
      wheelSet: { ...(p.wheelSet || {}), [who]: { ...((p.wheelSet || {})[who] || {}), [k]: true } },
    }));
    const bestaetigeRest = () => up((p) => {
      const w = { ...(p.wheel[who] || {}) }, ws = { ...((p.wheelSet || {})[who] || {}) };
      WHEEL_AREAS.forEach((x) => { if (!w[x.k]) w[x.k] = 5; ws[x.k] = true; });
      return { ...p, wheel: { ...p.wheel, [who]: w }, wheelSet: { ...(p.wheelSet || {}), [who]: ws } };
    });

    /* Kennzahlen für eine Person – so lässt sich beides nebeneinander zeigen */
    const read = (w) => {
      const v = WHEEL_AREAS.map((x) => ({ ...x, v: okd(w, x.k) ? ((d.wheel[w] || {})[x.k] || 5) : 0 })).filter((x) => x.v > 0);
      if (!v.length) return null;
      const lo = [...v].sort((x, y) => x.v - y.v)[0];
      const hi = [...v].sort((x, y) => y.v - x.v)[0];
      return {
        avg: v.reduce((s2, x) => s2 + x.v, 0) / v.length,
        low: lo, high: hi, spread: hi.v - lo.v,
        full: v.length === WHEEL_AREAS.length,
      };
    };
    const rA = read("a"), rB = read("b");
    const rMine = read(who);
    const avg = rMine ? rMine.avg : 0;
    const low = rMine ? rMine.low : null;
    const high = rMine ? rMine.high : null;
    const spread = rMine ? rMine.spread : 0;

    const gaps = bothFull
      ? WHEEL_AREAS.map((x) => ({ label: x.label, diff: Math.abs(d.wheel.a[x.k] - d.wheel.b[x.k]) }))
          .sort((x, y) => y.diff - x.diff)
      : [];

    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Eine Beziehung besteht aus mehreren Bereichen, und die halten sich selten die Waage. Meistens läuft vieles gut – und an einer Stelle hakt es seit Monaten, ohne dass es je jemand ausgesprochen hat.</>
          <>Diese acht Bereiche schätzt ihr gleich einzeln ein. Danach seht ihr, wo ihr dasselbe empfindet und wo eure Bilder auseinandergehen.</>
        </Lead>

        <Card tone="white" intro style={{ padding: "24px 14px 18px" }}>
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <Kicker>So sähe es aus, wenn überall alles rundläuft</Kicker>
          </div>
          <Radar a={{}} b={{}} names={names} ideal />
          <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6, color: C.muted, textAlign: "center", margin: "10px auto 0", maxWidth: 400 }}>
            Ein Beispiel, kein Ziel. Kaum ein Paar füllt alle acht Bereiche gleich weit aus – und das muss auch nicht sein.
            Interessant wird es an den Stellen, die deutlich zurückbleiben.
          </p>
        </Card>

        <Card>
          <WhoTabs who={who} setWho={setWho} names={names} counts={{ a: `${doneA}/8`, b: `${doneB}/8` }} />
          <H3>{names[who]}: Wie erlebst du diese acht Bereiche?</H3>
          <P style={{ fontSize: 14, marginBottom: 22 }}>
            Zehn heißt: läuft richtig gut. Eins heißt: da liegt etwas. Schätzt ein, wo ihr heute steht – nicht, wo ihr gern wärt.
            Jeder Regler startet in der Mitte; auch die Fünf zählt, ihr müsst sie nur einmal bestätigen.
          </P>
          {WHEEL_AREAS.map((x) => (
            <Slider key={x.k} label={x.label} desc={x.desc} value={mine[x.k] || 5}
              offen={!okd(who, x.k)}
              onChange={(v) => setWheel(x.k, v)} />
          ))}
          {offene.length > 0 && (
            <div style={{
              background: C.terraSoft, border: `1px solid ${C.terra}`, borderRadius: 12,
              padding: "16px 18px", marginTop: 6,
            }}>
              <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: C.ink, margin: "0 0 6px" }}>
                Noch {offene.length} von 8 offen
              </p>
              <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6, color: C.body, margin: "0 0 14px" }}>
                Diese Bereiche stehen noch unberührt bei 5: {offene.map((x) => x.label).join(", ")}.
                Wenn die Fünf für dich passt, bestätige sie – sonst zieht den Regler.
              </p>
              <Btn small onClick={bestaetigeRest}>Die übrigen bei 5 bestätigen</Btn>
            </div>
          )}
        </Card>

        <Impulse text={IMPULSES[2]} />

        {!full && (
          <Pending status={[
            { name: `${names.a} (${doneA}/8)`, done: doneA === WHEEL_AREAS.length },
            { name: `${names.b} (${doneB}/8)`, done: doneB === WHEEL_AREAS.length },
          ]}>Sobald alle acht Bereiche bestätigt sind, erscheint hier euer Rad mit der Auswertung.</Pending>
        )}

        {full && (
          <Card tone="white" style={{ padding: "26px 14px 20px" }}>
            <div style={{ textAlign: "center", marginBottom: 6 }}>
              <Kicker>{bothFull ? "Eure beiden Räder" : `Das Rad von ${names[who]}`}</Kicker>
            </div>
            <Radar a={d.wheel.a} b={d.wheel.b} names={names} showB={doneB === WHEEL_AREAS.length} />
            <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 300, color: C.muted, textAlign: "center", margin: "14px 0 0" }}>
              {bothFull
                ? "Achtet weniger auf die Größe als auf die Stellen, an denen die beiden Formen auseinanderlaufen."
                : `Fertig. Gebt jetzt weiter – das zweite Rad erscheint automatisch.`}
            </p>
          </Card>
        )}

        {full && (
          <Result title={bothFull ? "Was eure Räder einzeln zeigen" : `Was das Rad von ${names[who]} zeigt`}>
            {bothFull ? (
              <>
                <P>
                  <strong style={{ fontWeight: 600, color: C.ink }}>{names.a}</strong> liegt im Schnitt bei {rA.avg.toFixed(1)} –
                  am stärksten {rA.high.label}, am schwächsten {rA.low.label}.
                </P>
                <P>
                  <strong style={{ fontWeight: 600, color: C.ink }}>{names.b}</strong> liegt im Schnitt bei {rB.avg.toFixed(1)} –
                  am stärksten {rB.high.label}, am schwächsten {rB.low.label}.
                </P>
              </>
            ) : (
              <P>
                Der Schnitt liegt bei <strong style={{ fontWeight: 600, color: C.ink }}>{avg.toFixed(1)}</strong>.
                {" "}Am stärksten erlebst du <strong style={{ fontWeight: 600, color: C.ink }}>{high.label}</strong>, am schwächsten <strong style={{ fontWeight: 600, color: C.ink }}>{low.label}</strong>.
              </P>
            )}
            <P>
              {spread >= 4
                ? "Zwischen dem stärksten und dem schwächsten Bereich liegen mehrere Punkte. Genau das ist die Delle im Rad – es läuft bei euch nicht unrund, weil zu wenig da wäre, sondern weil es ungleich verteilt ist."
                : spread >= 2
                ? "Euer Rad läuft ziemlich rund. Die Unterschiede sind da, aber keiner fällt weit heraus. Das ist deutlich angenehmer als ein Rad mit lauter Neunen und einer Drei."
                : "Euer Rad ist auffällig gleichmäßig. Das heißt auch: Es gibt keine einzelne Baustelle, an der ihr ansetzen könnt. Wenn ihr etwas verändern wollt, geht es hier ums Gesamtniveau."}
            </P>
            <div style={{ background: C.sand, borderRadius: 12, padding: "16px 18px" }}>
              <Kicker color={C.ink}>Wo ich anfangen würde: {low.label}</Kicker>
              <P style={{ marginBottom: 0 }}>{low.help}</P>
            </div>
          </Result>
        )}

        {bothFull && (() => {
          const avgA = WHEEL_AREAS.reduce((x, y) => x + d.wheel.a[y.k], 0) / WHEEL_AREAS.length;
          const avgB = WHEEL_AREAS.reduce((x, y) => x + d.wheel.b[y.k], 0) / WHEEL_AREAS.length;
          const together = WHEEL_AREAS
            .map((x) => ({ label: x.label, help: x.help, sum: d.wheel.a[x.k] + d.wheel.b[x.k] }))
            .sort((x, y) => x.sum - y.sum);
          const weakest = together[0];
          const strongest = together[together.length - 1];
          const agree = gaps.filter((g) => g.diff <= 1).length;
          return (
            <Result title="Was eure beiden Räder zusammen zeigen">
              <P>
                Jetzt liegen zwei Formen übereinander. Das Interessante daran ist nicht, wessen Zahlen höher sind –
                sondern wo ihr denselben Alltag unterschiedlich erlebt.
              </P>

              <div style={{ background: C.sand, borderRadius: 12, padding: "16px 18px", marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: SANS, fontSize: 14, color: C.body }}>{names.a}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, color: C.terra }}>{avgA.toFixed(1)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: SANS, fontSize: 14, color: C.body }}>{names.b}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, color: C.sage }}>{avgB.toFixed(1)}</span>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6, color: C.muted, margin: "12px 0 0" }}>
                  {Math.abs(avgA - avgB) < 0.8
                    ? "Eure Gesamtbilder liegen dicht beieinander. Ihr schaut ähnlich auf eure Beziehung."
                    : `${avgA > avgB ? names.a : names.b} sieht das Ganze insgesamt etwas positiver. Das ist häufig – und meistens erlebt die Person mit den niedrigeren Zahlen einfach mehr von dem, was gerade fehlt.`}
                </p>
              </div>

              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: C.ink, marginBottom: 10 }}>
                Wo eure Formen auseinandergehen
              </div>
              {gaps.slice(0, 3).map((g) => (
                <div key={g.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.line}` }}>
                  <span style={{ fontFamily: SANS, fontSize: 14.5, color: C.ink }}>{g.label}</span>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 300, color: g.diff >= 3 ? C.terra : C.muted }}>
                    {g.diff === 0 ? "gleich" : `${g.diff} Punkte auseinander`}
                  </span>
                </div>
              ))}
              <P style={{ marginTop: 16 }}>
                {gaps[0].diff >= 3
                  ? <>Bei <strong style={{ fontWeight: 600, color: C.ink }}>{gaps[0].label}</strong> liegt ihr am weitesten auseinander. Das ist kein Widerspruch, den eine:r von euch auflösen muss. Ihr erlebt denselben Alltag verschieden – und beide Wahrnehmungen sind gültig. Fragt euch gegenseitig: Woran machst du deine Zahl fest? Meistens fällt beim Antworten ein konkreter Moment, den die andere Person gar nicht auf dem Schirm hatte.</>
                  : gaps[0].diff === 2
                  ? <>Die größte Abweichung liegt bei <strong style={{ fontWeight: 600, color: C.ink }}>{gaps[0].label}</strong>, und selbst die ist klein. Ihr habt ein ziemlich ähnliches Bild von eurer Beziehung – das ist seltener, als man denkt.</>
                  : "Ihr liegt überall dicht beieinander. Das heißt: Ihr redet offenbar genug miteinander, um euch nicht auseinanderzuleben. Nutzt das und geht ein Thema an, bevor es eins wird."}
              </P>
              <P>
                Bei {agree} von acht Bereichen seid ihr euch praktisch einig
                {agree >= 6 ? " – eine ungewöhnlich hohe Übereinstimmung." : agree >= 3 ? ". Das ist ein normaler Wert." : ". Das ist wenig, und genau deshalb lohnt sich dieses Gespräch."}
              </P>

              <div style={{ background: C.sageSoft, borderRadius: 12, padding: "16px 18px" }}>
                <Kicker color={C.sage}>Euer gemeinsamer Startpunkt</Kicker>
                <P style={{ marginBottom: 8 }}>
                  Zusammengerechnet steht <strong style={{ fontWeight: 600, color: C.ink }}>{strongest.label}</strong> bei
                  euch am stärksten da – das ist eure Reserve, wenn es woanders hakt.
                  {" "}Am schwächsten ist <strong style={{ fontWeight: 600, color: C.ink }}>{weakest.label}</strong>. Dort
                  würde ich anfangen, weil es beide betrifft und nicht nur eine:n von euch.
                </P>
                <P style={{ marginBottom: 0 }}>{weakest.help}</P>
              </div>
            </Result>
          );
        })()}

        {(doneA < WHEEL_AREAS.length || doneB < WHEEL_AREAS.length) && (
          <Pending status={[
            { name: `${names.a} (${doneA}/${WHEEL_AREAS.length})`, done: doneA === WHEEL_AREAS.length },
            { name: `${names.b} (${doneB}/${WHEEL_AREAS.length})`, done: doneB === WHEEL_AREAS.length },
          ]}>
            Sobald beide alle acht Regler eingestellt haben, liegen hier zwei Formen übereinander –
            mit einer Auswertung dazu, wo ihr euren Alltag unterschiedlich erlebt und wo ihr gemeinsam anfangen könnt.
          </Pending>
        )}

        {(doneA > 0 || doneB > 0) && (
          <Field label="Was fällt euch dazu ein?" optional rows={3}
            hint="Besonders zu dem Bereich, bei dem eure Zahlen am weitesten auseinanderliegen."
            value={d.wheelNote} onChange={(v) => up((p) => ({ ...p, wheelNote: v }))} />
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 3 – ICH SEHE DICH
  ======================================================= */
  const Ch3 = () => {
    const picks = d.affection[who] || [];
    const bothPicked = d.affection.a.length === 2 && d.affection.b.length === 2;
    const shared = bothPicked ? d.affection.a.filter((x) => d.affection.b.includes(x)) : [];
    const lab = (k) => (AFFECTION.find((x) => x.k === k) || {}).label;

    const qtA = d.qtime.a || [], qtB = d.qtime.b || [];
    const bothQt = qtA.length === 4 && qtB.length === 4;
    const qtLab = (k) => (QUALITY_TIME.find((x) => x.k === k) || {}).label;
    const qtShared = bothQt ? qtA.filter((x) => qtB.includes(x)) : [];
    const qtOnlyA = bothQt ? qtA.filter((x) => !qtB.includes(x)) : [];
    const qtOnlyB = bothQt ? qtB.filter((x) => !qtA.includes(x)) : [];
    const qtOnlyOther = [...qtOnlyA, ...qtOnlyB];

    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Eine Person räumt die Küche auf, weil sie liebt. Die andere hätte lieber gehört, dass sie großartig aussieht.</>
          <>Beides ist Zuneigung. Nur in zwei verschiedenen Sprachen – und beide Seiten fühlen sich übersehen, obwohl beide geben.</>
        </Lead>

        <WhoTabs who={who} setWho={setWho} names={names}
          counts={{ a: `${d.affection.a.length}/2`, b: `${d.affection.b.length}/2` }} />

        <Card>
          <H3>Was kommt bei dir am besten an, {names[who]}?</H3>
          <P style={{ fontSize: 14, marginBottom: 18 }}>
            Wählt genau zwei aus. Nicht die, die am nettesten klingen – die, bei denen ihr merkt: Ja, genau das fehlt mir, wenn es fehlt.
            {picks.length === 2 && " Noch einmal tippen, um die Auswahl zu ändern."}
          </P>
          {AFFECTION.map((af) => (
            <Choice key={af.k} label={af.label} note={af.desc}
              selected={picks.includes(af.k)}
              disabled={picks.length >= 2 && !picks.includes(af.k)}
              onClick={() => up((p) => ({
                ...p, affection: { ...p.affection, [who]: toggleIn(p.affection[who], af.k, 2) },
              }))} />
          ))}
        </Card>

        {(d.affection.a.length > 0 || d.affection.b.length > 0) && (
          <Card tone="white">
            <H3>Was das konkret füreinander heißt</H3>
            <P style={{ fontSize: 14, marginBottom: 20 }}>
              Links steht, was die eine Seite braucht – und damit gleichzeitig, worauf die andere achten kann. Beides gilt gleichzeitig.
            </P>
            {["a", "b"].map((k) => {
              const sel = d.affection[k] || [];
              if (!sel.length) return null;
              return (
                <div key={k} style={{
                  background: k === "a" ? C.terraSoft : C.sageSoft,
                  borderRadius: 12, padding: "18px 18px 6px", marginBottom: 12,
                }}>
                  <Kicker color={C.ink}>Damit erreichst du {names[k]}</Kicker>
                  {sel.map((code) => {
                    const af = AFFECTION.find((x) => x.k === code);
                    return (
                      <div key={code} style={{ marginBottom: 14 }}>
                        <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, color: C.ink, marginBottom: 5 }}>{af.label}</div>
                        <P style={{ marginBottom: 5 }}>{af.give}</P>
                        <P style={{ fontSize: 14, color: C.muted, margin: 0 }}>{af.miss}</P>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {(!d.affection.a.length || !d.affection.b.length) && (
              <P style={{ fontSize: 14, marginBottom: 0, fontStyle: "italic", color: C.muted }}>
                Sobald auch {d.affection.a.length ? names.b : names.a} gewählt hat, steht hier beides nebeneinander.
              </P>
            )}
          </Card>
        )}

        <Impulse text={IMPULSES[3]} />

        <Card tone="white">
          <Kicker>Aufgabe – unsere gemeinsame Zeit</Kicker>
          <H3>Was bedeutet für {names[who]} „Qualitätszeit“?</H3>
          <P style={{ fontSize: 14, marginBottom: 18 }}>
            Wählt die vier Bilder aus, die zeigen, wie ihr am liebsten Zeit miteinander verbringt.
            Es gibt kein richtig oder falsch – es geht um das, was sich für euch gut anfühlt.
            {(d.qtime[who] || []).length < 4 && ` Noch ${4 - (d.qtime[who] || []).length} frei.`}
          </P>
          <PhotoGrid options={QUALITY_TIME} images={QT_IMG} max={4}
            values={d.qtime[who] || []}
            onToggle={(k) => up((p) => ({ ...p, qtime: { ...p.qtime, [who]: toggleIn(p.qtime[who] || [], k, 4) } }))} />
        </Card>

        {bothQt && (
          <Result title="Eure gemeinsame Zeit im Vergleich">
            {qtShared.length > 0 ? (
              <>
                <P>Bei {qtShared.length === 1 ? "einem Bild" : `${qtShared.length} Bildern`} seid ihr euch einig:</P>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                  {qtShared.map((k) => (
                    <span key={k} style={{
                      fontFamily: SANS, fontSize: 13.5, fontWeight: 400, color: C.ink,
                      background: C.sageSoft, borderRadius: 20, padding: "7px 14px",
                    }}>{qtLab(k)}</span>
                  ))}
                </div>
                <P>Das ist eure sichere Bank. Wenn ihr nicht wisst, was ihr am Wochenende machen sollt, nehmt etwas davon – da liegt ihr bei beiden richtig.</P>
              </>
            ) : (
              <P>Ihr habt kein einziges Bild gemeinsam gewählt. Das klingt erstmal nach viel, ist es aber nicht: Es heißt nur, dass ihr Nähe über unterschiedliche Dinge herstellt. Wichtig wird es erst, wenn im Alltag immer nur die eine Sorte vorkommt.</P>
            )}
            {qtOnlyOther.length > 0 && (
              <div style={{ background: C.sand, borderRadius: 12, padding: "16px 18px" }}>
                <Kicker color={C.ink}>Was nur eine:r von euch gewählt hat</Kicker>
                <P style={{ marginBottom: 8 }}>
                  {qtOnlyA.length > 0 && <>{names.a}: {qtOnlyA.map(qtLab).join(" · ")}<br /></>}
                  {qtOnlyB.length > 0 && <>{names.b}: {qtOnlyB.map(qtLab).join(" · ")}</>}
                </P>
                <P style={{ marginBottom: 0 }}>
                  Genau hier entstehen die stillen Enttäuschungen. Nicht weil jemand etwas falsch macht, sondern weil man dem anderen die eigene Lieblingsform von Zeit schenkt und sich wundert, dass sie nicht ankommt. Nehmt euch aus dieser Liste je eine Sache vor – die der anderen Person, nicht die eigene.
                </P>
              </div>
            )}
          </Result>
        )}

        {!bothQt && (
          <Pending status={[
            { name: names.a, done: qtA.length === 4 },
            { name: names.b, done: qtB.length === 4 },
          ]}>Sobald beide vier Bilder gewählt haben, seht ihr hier, wo sich eure Vorstellung von gemeinsamer Zeit deckt – und wo nicht.</Pending>
        )}

        <Card>
          <H3>Und im Alltag, {names[who]}?</H3>
          <Chips label="Wann fühle ich mich übersehen?" max={3}
            hint="Das darf unangenehm sein. Es ist kein Vorwurf, nur eine Information."
            options={SEEN_MISS} values={d.seenMiss[who] || []}
            onToggle={(o) => up((p) => ({ ...p, seenMiss: { ...p.seenMiss, [who]: toggleIn(p.seenMiss[who] || [], o, 3) } }))} />
          <Chips label="Was wünsche ich mir häufiger?" max={3}
            hint="Als Wunsch gedacht, nicht als Kritik."
            options={SEEN_WISH} values={d.seenWish[who] || []}
            onToggle={(o) => up((p) => ({ ...p, seenWish: { ...p.seenWish, [who]: toggleIn(p.seenWish[who] || [], o, 3) } }))} />
          {SEEN_Q.map((q) => (
            <Field key={q.k} label={q.q} hint={q.hint} optional={q.optional} rows={2}
              value={(d.seen[who] || {})[q.k]}
              onChange={(v) => setWho2("seen", who, q.k, v)} />
          ))}
        </Card>

        {!bothPicked && (
          <Pending status={[
            { name: names.a, done: d.affection.a.length === 2 },
            { name: names.b, done: d.affection.b.length === 2 },
          ]}>Sobald beide je zwei Formen ausgewählt haben, seht ihr hier den Vergleich – und wo ihr aneinander vorbeigeben könntet, ohne es zu merken.</Pending>
        )}

        {bothPicked && (
          <Result title="Euer Vergleich">
            <P>
              {names.a} braucht vor allem <strong style={{ fontWeight: 600, color: C.ink }}>{d.affection.a.map(lab).join(" und ")}</strong>.
              {" "}Bei {names.b} sind es <strong style={{ fontWeight: 600, color: C.ink }}>{d.affection.b.map(lab).join(" und ")}</strong>.
            </P>
            <P>
              {shared.length === 2
                ? "Ihr habt beide dasselbe gewählt. Das macht vieles leicht – ihr müsst weniger übersetzen. Achtet nur darauf, dass ihr die anderen drei Formen nicht ganz vergesst."
                : shared.length === 1
                ? `Eine Überschneidung: ${lab(shared[0])}. Das ist euer gemeinsamer Nenner. Die jeweils andere Wahl ist der Punkt, an dem ihr aneinander vorbeigeben könnt, ohne es zu merken.`
                : "Ihr habt vier verschiedene Formen gewählt. Das ist überhaupt kein schlechtes Zeichen – es heißt nur, dass ihr bewusster übersetzen müsst. Was für die eine Seite selbstverständlich Liebe zeigt, kommt bei der anderen nicht automatisch an."}
            </P>
            <div style={{ background: C.sand, borderRadius: 12, padding: "16px 18px" }}>
              <Kicker color={C.ink}>Für heute Abend</Kicker>
              <P style={{ marginBottom: 0 }}>
                Sagt euch gegenseitig eine Sache, die die andere Person in der letzten Woche getan hat und die angekommen ist. Konkret, nicht allgemein. Das dauert zwei Minuten und wirkt länger als jedes Geschenk.
              </P>
            </div>
          </Result>
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 4 – KOMMUNIKATION
  ======================================================= */
  const Ch4 = () => {
    const filledA = Object.values(d.reach.a || {}).filter((v) => (v || "").trim()).length;
    const filledB = Object.values(d.reach.b || {}).filter((v) => (v || "").trim()).length;
    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Die meisten Missverständnisse entstehen nicht, weil zu wenig geredet wird. Sondern weil beide davon ausgehen, dass die andere Person schon weiß, wie sie gemeint sind.</>
          <>Dieses Kapitel ist im Grunde eine Gebrauchsanweisung – die ihr euch gegenseitig gebt.</>
        </Lead>

        <WhoTabs who={who} setWho={setWho} names={names} />

        <Card>
          <H3>Fünf Fragen für {names[who]}</H3>
          <P style={{ fontSize: 14, marginBottom: 20 }}>Antippen genügt. Es geht darum, wie es tatsächlich ist – nicht darum, wie es klingen soll.</P>
          {COMM_Q.map((q) => (
            <QBlock key={q.k} item={q}
              value={(d.comm[who] || {})[q.k]}
              onChange={(v) => setWho2("comm", who, q.k, v)} />
          ))}
        </Card>

        <Impulse text={IMPULSES[4]} />

        <Card tone="white">
          <H3>So erreichst du mich besser</H3>
          <P style={{ fontSize: 14, marginBottom: 20 }}>Drei Sätze zum Vervollständigen. Das ist der Teil dieses Journals, den ihr euch am ehesten gegenseitig zeigen solltet – deshalb lohnen sich hier eigene Worte.</P>
          {REACH_ME.map((r) => (
            <div key={r.k} style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: SERIF, fontSize: 19, fontStyle: "italic", color: C.ink, marginBottom: 8, lineHeight: 1.4 }}>
                {r.start}
              </div>
              <textarea rows={2} value={(d.reach[who] || {})[r.k] || ""} placeholder={r.ph}
                aria-label={r.start}
                onChange={(e) => setWho2("reach", who, r.k, e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", resize: "vertical",
                  fontFamily: SANS, fontSize: 15.5, fontWeight: 300, lineHeight: 1.6, color: C.ink,
                  background: C.sand, border: `1px solid ${C.line}`, borderRadius: 10,
                  padding: "13px 15px", outline: "none",
                }} />
            </div>
          ))}
        </Card>

        {filledA < 3 && filledB < 3 && (
          <Pending>Füllt mindestens drei der Satzanfänge aus – dann steht hier, wie ihr die Sätze am besten miteinander teilt.</Pending>
        )}

        {(filledA >= 3 || filledB >= 3) && (
          <Result title="Was ihr jetzt damit macht">
            <P>{names.a} hat {filledA} Sätze ausgefüllt, {names.b} hat {filledB}.</P>
            <P>
              {filledA >= 3 && filledB >= 3
                ? "Lest euch die Sätze gegenseitig vor – nicht kommentieren, nur vorlesen und zuhören. Und dann fragt bei genau einem nach: „Was meinst du damit konkret?“"
                : "Sobald beide Seiten ausgefüllt sind, lest ihr sie euch gegenseitig vor. Nicht kommentieren, nur vorlesen und zuhören."}
            </P>
            <P style={{ marginBottom: 0 }}>
              Der Satz über das, was euch verschließt, ist der wichtigste. Wenn ihr aus diesem Kapitel eine einzige Sache mitnehmt, dann diesen.
            </P>
          </Result>
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 5 – KONFLIKTE & REPARATUR
  ======================================================= */
  const Ch5 = () => {
    const picks = d.conflict[who] || [];
    const bothSet = d.conflict.a.length > 0 && d.conflict.b.length > 0;
    const overlap = bothSet ? d.conflict.a.filter((x) => d.conflict.b.includes(x)) : [];
    const lab = (k) => (CONFLICT.find((x) => x.k === k) || {}).label;
    const pauseDone = Object.values(d.pause).filter((v) => (typeof v === "string" ? v.trim() : (v || []).length)).length;

    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Fast jedes Paar streitet nach demselben Muster. Nicht über dasselbe Thema – nach demselben Ablauf.</>
          <>Wer das Muster kennt, kann es unterbrechen. Wer es nicht kennt, hält es für den Charakter der anderen Person.</>
        </Lead>

        <WhoTabs who={who} setWho={setWho} names={names}
          counts={{ a: d.conflict.a.length, b: d.conflict.b.length }} />

        <Card>
          <H3>Was macht {names[who]} im Streit?</H3>
          <P style={{ fontSize: 14, marginBottom: 18 }}>Mehrfachauswahl. Die meisten kennen zwei oder drei dieser Reaktionen bei sich – je nachdem, worum es geht und wie müde sie sind.</P>
          {CONFLICT.map((cf) => (
            <Choice key={cf.k} label={cf.label} selected={picks.includes(cf.k)}
              onClick={() => up((p) => ({
                ...p, conflict: { ...p.conflict, [who]: toggleIn(p.conflict[who], cf.k) },
              }))} />
          ))}
        </Card>

        {picks.length > 0 && (
          <Card tone="white">
            <Kicker>Dazu jeweils drei Gedanken</Kicker>
            {picks.map((k) => {
              const cf = CONFLICT.find((x) => x.k === k);
              return (
                <div key={k} style={{ marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${C.line}` }}>
                  <H3 style={{ marginBottom: 14 }}>{cf.label}</H3>
                  {[["Mögliche Stärke", cf.strength], ["Mögliches Risiko", cf.risk], ["Hilfreicher nächster Schritt", cf.step]].map(([h, t]) => (
                    <div key={h} style={{ marginBottom: 12 }}>
                      <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: C.muted, marginBottom: 5 }}>{h}</div>
                      <P style={{ marginBottom: 0 }}>{t}</P>
                    </div>
                  ))}
                </div>
              );
            })}
          </Card>
        )}

        <Impulse text={IMPULSES[5]} />

        <Card>
          <H3>Unsere Pause-Regel</H3>
          <P style={{ fontSize: 14, marginBottom: 20 }}>Jetzt gemeinsam. Legt vorher fest, was gilt, wenn ein Gespräch kippt – im Streit selbst kann das niemand mehr verhandeln.</P>
          <Chips label="Woran erkennen wir, dass wir eine Pause brauchen?" max={3}
            hint="Konkrete Zeichen, keine Stimmungen."
            options={PAUSE_SIGNS} values={d.pause.erkennen || []}
            onToggle={(o) => setIn("pause", "erkennen", toggleIn(d.pause.erkennen || [], o, 3))} />
          <Pick label="Wie lange darf eine Pause dauern?" options={PAUSE_LENGTH}
            hint="Legt euch fest. Unbestimmte Pausen fühlen sich für den Wartenden wie Bestrafung an."
            value={d.pause.dauer} onChange={(v) => setIn("pause", "dauer", v)} />
          <Pick label="Mit welchem Satz gehen wir raus?" options={PAUSE_PROMISE}
            hint="Ein fester Satz, den beide kennen. Er sagt: Ich bin nicht weg."
            value={d.pause.zusage} onChange={(v) => setIn("pause", "zusage", v)} />
          <Pick label="Wie finden wir danach wieder zueinander?" options={PAUSE_BACK}
            value={d.pause.zurueck} onChange={(v) => setIn("pause", "zurueck", v)} />
        </Card>

        <Card tone="white">
          <H3>Und wie kommt ihr wieder rein?</H3>
          <P style={{ fontSize: 14 }}>
            Die Pause-Regel klärt, wie ihr aus einem Streit rauskommt. Der Rückweg ist der Teil, den fast alle dem Zufall überlassen –
            und deshalb bleibt so oft eine Stunde übrig, in der beide warten, dass die andere Seite anfängt.
          </P>
          <Pick label="Unser Satz für danach" options={REPAIR_LINES}
            hint="Diese Sätze funktionieren, weil sie keine Diskussion neu eröffnen. Nehmt den, den ihr euch tatsächlich sagen hören könnt."
            value={d.repair} onChange={(v) => up((p) => ({ ...p, repair: v }))} />
          <Pick label="Wer macht bei uns normalerweise den ersten Schritt?"
            hint="Und die ehrlichere Frage hinterher: Ist das für beide in Ordnung?"
            options={[`Meistens ${names.a}`, `Meistens ${names.b}`, "Mal so, mal so", "Meistens keiner – es verläuft im Sand"]}
            value={d.repairFirst} onChange={(v) => up((p) => ({ ...p, repairFirst: v }))} />
        </Card>

        <Card>
          <H3>Nicht jeder Streit will gelöst werden</H3>
          <P style={{ fontSize: 14 }}>
            Ungefähr zwei Drittel aller Konflikte in langen Beziehungen werden nie gelöst. Sie hängen an Temperament, an Herkunft,
            an Bedürfnissen, die sich nicht wegdiskutieren lassen. Paare, die lange zusammenbleiben, haben nicht weniger davon –
            sie reden nur anders darüber.
          </P>
          <P style={{ fontSize: 14, marginBottom: 20 }}>
            Der Unterschied ist im Grunde simpel: Ein lösbares Thema braucht eine Entscheidung. Ein Dauerthema braucht nur, dass beide
            verstehen, warum es der anderen Seite so wichtig ist – und dass niemand mehr versucht zu gewinnen. Der Fehler ist nicht,
            das Thema zu haben. Der Fehler ist, es jedes Mal wieder lösen zu wollen.
          </P>
          <Chips label="Was ist bei uns so ein Dauerthema?" max={2}
            hint="Das eine, das alle paar Monate wiederkommt, meistens an einem anderen Anlass. Wenn euch sofort etwas einfällt, ist es das."
            options={PERPETUAL_TOPICS} values={d.perpetual || []}
            onToggle={(o) => up((p) => ({ ...p, perpetual: toggleIn(p.perpetual || [], o, 2) }))} />
          <Chips label="Was steckt für euch dahinter?" max={3}
            hint="Nicht die Position, sondern das Bedürfnis darunter. Ordnung heißt oft Sicherheit. Spontaneität heißt oft Freiheit."
            options={PERPETUAL_NEEDS} values={d.perpetualWhy || []}
            onToggle={(o) => up((p) => ({ ...p, perpetualWhy: toggleIn(p.perpetualWhy || [], o, 3) }))} />
          {(d.perpetual || []).length > 0 && (
            <P style={{ fontSize: 14, marginBottom: 0, marginTop: 4 }}>
              {(d.perpetual || []).join(" und ")} wird nicht verschwinden. Aber wenn ihr einmal ausgesprochen habt, was für den anderen daran hängt,
              hört das Thema auf, jedes Mal grundsätzlich zu werden – und wird zu etwas, das ihr eben habt.
            </P>
          )}
        </Card>

        {!bothSet && (
          <Pending>Wenn beide ihre Reaktionen markiert haben, erklärt euch die Auswertung hier, wie eure Muster zusammenspielen – und welche Kombination sich am schnellsten aufschaukelt.</Pending>
        )}

        {bothSet && (
          <Result title="Wie eure Muster zusammenspielen">
            <P>
              {names.a}: {d.conflict.a.map(lab).join(", ")}.<br />
              {names.b}: {d.conflict.b.map(lab).join(", ")}.
            </P>
            <P>
              {(d.conflict.a.includes("rueckzug") && d.conflict.b.includes("angriff")) ||
               (d.conflict.b.includes("rueckzug") && d.conflict.a.includes("angriff"))
                ? "Eine Seite zieht sich zurück, die andere geht nach vorn. Das ist die häufigste Kombination überhaupt – und die, die sich am schnellsten aufschaukelt: Je mehr die eine nachsetzt, desto weiter geht die andere weg. Beide fühlen sich dabei im Recht. Der Ausweg ist nicht mehr Druck, sondern eure Pause-Regel."
                : overlap.length > 0
                ? `Ihr teilt mindestens ein Muster: ${overlap.map(lab).join(", ")}. Das kann angenehm sein, weil ihr euch versteht – und schwierig, weil euch beiden dieselbe Fähigkeit fehlt. Wenn ihr beide einlenkt, wird nie etwas geklärt. Wenn ihr beide zurückzieht, redet irgendwann niemand mehr.`
                : "Eure Muster sind unterschiedlich, ohne direkt gegeneinander zu laufen. Das ist eine gute Ausgangslage. Wichtig bleibt: Sagt euch gegenseitig, was eure Reaktion bedeutet – von außen wird sie fast immer falsch gelesen."}
            </P>
            <P style={{ marginBottom: 0 }}>
              {pauseDone >= 3
                ? "Eure Pause-Regel steht. Schreibt euch den entscheidenden Satz irgendwo hin, wo ihr ihn im Ernstfall seht."
                : "Was jetzt noch fehlt, ist die Pause-Regel darüber. Die ist wichtiger als die Analyse – sie ist das Einzige aus diesem Kapitel, das im Streit tatsächlich hilft."}
            </P>
          </Result>
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 6 – WERTE & LEBENSENTWÜRFE
  ======================================================= */
  const Ch6 = () => {
    const circled = d.values[who] || [];
    const top = d.valuesTop[who] || [];
    const bothTop = d.valuesTop.a.length === 5 && d.valuesTop.b.length === 5;
    const shared = bothTop ? d.valuesTop.a.filter((x) => d.valuesTop.b.includes(x)) : [];
    const pool = bothTop ? Array.from(new Set([...d.valuesTop.a, ...d.valuesTop.b])) : [];

    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Wofür würdet ihr euch streiten? Nicht wegen einer Kleinigkeit – sondern so, dass ihr auch unbequem werdet.</>
          <>Was euch dazu einfällt, ist ein Wert. Und viele Paarkonflikte sind keine Meinungsverschiedenheiten, sondern zwei Werte, die gerade gegeneinanderstehen.</>
        </Lead>

        <WhoTabs who={who} setWho={setWho} names={names}
          counts={{ a: d.values.a.length, b: d.values.b.length }} />

        <Card tone="white" style={{ padding: "28px 16px 24px" }}>
          <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 300, lineHeight: 1.6, color: C.body, textAlign: "center", margin: "0 0 22px" }}>
            {names[who]}: Kreis alles ein, was dir wichtig ist. Sei großzügig – fünfzehn bis fünfundzwanzig sind normal.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 5, rowGap: 13 }}>
            {VALUES.map((v, i) => {
              const on = circled.includes(v);
              return (
                <button key={v} type="button" aria-pressed={on}
                  onClick={() => up((p) => {
                    const wasOn = p.values[who].includes(v);
                    return {
                      ...p,
                      values: { ...p.values, [who]: toggleIn(p.values[who], v) },
                      valuesTop: wasOn
                        ? { ...p.valuesTop, [who]: (p.valuesTop[who] || []).filter((x) => x !== v) }
                        : p.valuesTop,
                    };
                  })}
                  style={{
                    position: "relative", background: "none", border: "none", cursor: "pointer",
                    padding: "9px 12px", fontFamily: SERIF, fontSize: 18.5,
                    fontWeight: on ? 600 : 400, color: on ? C.ink : C.body, lineHeight: 1.1,
                  }}>
                  {on && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"
                      style={{
                        position: "absolute", inset: "-4px -2px",
                        width: "calc(100% + 4px)", height: "calc(100% + 8px)",
                        transform: `rotate(${[-2.5, 1.8, -1.2, 2.4][i % 4]}deg)`, pointerEvents: "none",
                      }}>
                      <path d={SCRIBBLES[i % SCRIBBLES.length]} fill="none" stroke={C.terra}
                        strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                  )}
                  {v}
                </button>
              );
            })}
          </div>
        </Card>

        {circled.length > 0 && (
          <Card>
            <H3>Jetzt runter auf fünf</H3>
            <P style={{ fontSize: 14, marginBottom: 16 }}>
              Der unbequeme Teil. Tipp an, was übrig bleiben soll – nicht was gut klingt, sondern das, wofür du im Zweifel etwas anderes aufgeben würdest.
              {top.length < 5 && ` Noch ${5 - top.length} frei.`}
            </P>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {circled.map((v) => {
                const on = top.includes(v);
                return (
                  <button key={v} type="button" aria-pressed={on}
                    disabled={!on && top.length >= 5}
                    onClick={() => up((p) => ({
                      ...p, valuesTop: { ...p.valuesTop, [who]: toggleIn(p.valuesTop[who], v, 5) },
                    }))}
                    style={{
                      padding: "10px 16px", minHeight: 44, cursor: "pointer", borderRadius: 24,
                      border: `1px solid ${on ? C.terra : C.line}`,
                      background: on ? C.terra : C.white,
                      color: on ? C.white : C.body,
                      fontFamily: SANS, fontSize: 14, fontWeight: on ? 500 : 300,
                      opacity: !on && top.length >= 5 ? 0.45 : 1,
                    }}>{v}</button>
                );
              })}
            </div>
          </Card>
        )}

        {top.length === 5 && (
          <Card tone="white">
            <H3>Und jetzt in eine Reihenfolge</H3>
            <P style={{ fontSize: 14, marginBottom: 18 }}>
              Bringt eure fünf in eine Rangfolge – eins ist der Wert, für den ihr im Zweifel alles andere zurückstellen würdet.
              Das ist der unbequemste Schritt in diesem Kapitel und der aufschlussreichste.
            </P>
            {top.map((v, i) => (
              <div key={v} style={{
                display: "flex", gap: 12, alignItems: "center", padding: "10px 0",
                borderBottom: i < 4 ? `1px solid ${C.line}` : "none",
              }}>
                <span aria-hidden="true" style={{
                  fontFamily: SERIF, fontSize: 20, fontWeight: 500, color: C.white,
                  background: C.terra, borderRadius: "50%", width: 30, height: 30,
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ flex: 1, fontFamily: SERIF, fontSize: 23, fontWeight: 500, color: C.ink, lineHeight: 1.2 }}>{v}</span>
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  {[["hoch", -1, i === 0], ["runter", 1, i === top.length - 1]].map(([lbl, dir, off]) => (
                    <button key={lbl} type="button" disabled={off}
                      aria-label={`${v} nach ${lbl === "hoch" ? "oben" : "unten"}`}
                      onClick={() => up((p) => {
                        const arr = [...(p.valuesTop[who] || [])];
                        const j = i + dir;
                        if (j < 0 || j >= arr.length) return p;
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        return { ...p, valuesTop: { ...p.valuesTop, [who]: arr } };
                      })}
                      style={{
                        width: 40, height: 40, borderRadius: 10, cursor: off ? "default" : "pointer",
                        border: `1px solid ${C.line}`, background: C.white,
                        opacity: off ? 0.3 : 1, display: "grid", placeItems: "center", padding: 0,
                      }}>
                      <span aria-hidden="true" style={{
                        display: "block", width: 0, height: 0,
                        borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                        ...(lbl === "hoch"
                          ? { borderBottom: `8px solid ${C.terra}` }
                          : { borderTop: `8px solid ${C.terra}` }),
                      }} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        )}

        {!bothTop && (
          <Pending status={[
            { name: names.a, done: (d.valuesTop.a || []).length === 5 },
            { name: names.b, done: (d.valuesTop.b || []).length === 5 },
          ]}>Sobald beide ihre fünf Werte festgelegt haben, seht ihr hier eure Überschneidungen – und daraus wählt ihr dann drei gemeinsame Kernwerte.</Pending>
        )}

        {bothTop && (
          <>
            <Result title="Wo ihr euch trefft">
              {shared.length > 0 ? (
                <>
                  <P>
                    Ihr habt {shared.length === 1 ? "einen gemeinsamen Wert" : `${shared.length} gemeinsame Werte`}:
                  </P>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                    {shared.map((v) => (
                      <span key={v} style={{
                        fontFamily: SERIF, fontSize: 20, fontWeight: 500, color: C.ink,
                        background: C.sageSoft, borderRadius: 24, padding: "8px 18px",
                      }}>{v}</span>
                    ))}
                  </div>
                </>
              ) : (
                <P>
                  In euren Top fünf überschneidet sich nichts. Das ist kein Alarmzeichen – sehr oft meint ihr dasselbe und nennt es
                  nur anders. Geht die zehn Begriffe zusammen durch und lasst euch gegenseitig erklären, was ihr darunter versteht.
                </P>
              )}

              <P style={{ marginBottom: 12 }}>Und hier sind die Werte, die sich unterscheiden:</P>
              <div style={{ marginBottom: 18 }}>
                {[["a", C.terraSoft], ["b", C.sageSoft]].map(([k, bg]) => {
                  const eigen = (d.valuesTop[k] || []).filter((v) => !shared.includes(v));
                  if (!eigen.length) return null;
                  return (
                    <div key={k} style={{ background: bg, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 7 }}>
                        Nur bei {names[k]}
                      </div>
                      <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 500, color: C.ink, lineHeight: 1.5 }}>
                        {eigen.join(" · ")}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: C.sand, borderRadius: 12, padding: "16px 18px" }}>
                <Kicker color={C.ink}>Euer Auftrag für heute</Kicker>
                <P style={{ marginBottom: 0 }}>
                  Besprecht mindestens einen Wert von jeder Seite, der beim anderen nicht auftaucht. Nicht um jemanden zu überzeugen –
                  lasst euch nur erzählen, woher der kommt. Genau da liegen die meisten Konflikte, die sich nach Sturheit anfühlen und keine ist.
                </P>
              </div>
            </Result>

            <Card>
              <H3>Eure drei Kernwerte</H3>
              <P style={{ fontSize: 14, marginBottom: 16 }}>
                Jetzt gemeinsam: Wählt aus euren zehn Begriffen drei aus, die für eure Beziehung gelten sollen. Nicht für jede:n einzeln – für euch als Paar.
                {d.core.length < 3 && ` Noch ${3 - d.core.length} frei.`}
              </P>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {pool.map((v) => {
                  const on = d.core.includes(v);
                  return (
                    <button key={v} type="button" aria-pressed={on}
                      disabled={!on && d.core.length >= 3}
                      onClick={() => up((p) => ({ ...p, core: toggleIn(p.core, v, 3) }))}
                      style={{
                        padding: "10px 16px", minHeight: 44, cursor: "pointer", borderRadius: 24,
                        border: `1px solid ${on ? C.sage : C.line}`,
                        background: on ? C.sage : C.white,
                        color: on ? C.white : C.body,
                        fontFamily: SANS, fontSize: 14, fontWeight: on ? 500 : 300,
                        opacity: !on && d.core.length >= 3 ? 0.45 : 1,
                      }}>{v}</button>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {d.core.length === 3 && (
          <Card tone="sage" style={{ textAlign: "center", padding: "34px 22px" }}>
            <Kicker color={C.sage}>Euer Satz</Kicker>
            <p style={{ fontFamily: SERIF, fontSize: "clamp(23px, 5.6vw, 30px)", fontWeight: 500, lineHeight: 1.35, color: C.ink, margin: 0 }}>
              Unsere Beziehung soll geprägt sein von {d.core[0]}, {d.core[1]} und {d.core[2]}.
            </p>
          </Card>
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 7 – GELD & ENTSCHEIDUNGEN
  ======================================================= */
  const Ch7 = () => {
    const answered = Object.values(d.money).filter((v) => (typeof v === "string" ? v.trim() : (v || []).length)).length;
    const taskCount = Object.keys(d.moneyTasks || {}).length;
    const mineHeavy = MONEY_TASKS.filter((t) => d.moneyTasks[t] === "a").length;
    const yoursHeavy = MONEY_TASKS.filter((t) => d.moneyTasks[t] === "b").length;
    const shareOpts = [["a", names.a], ["both", "Beide"], ["b", names.b]];
    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Über Geld zu reden fühlt sich unromantisch an. Deshalb schieben es die meisten Paare so lange, bis eine Entscheidung ansteht, die keinen Aufschub duldet.</>
          <>Hier geht es nicht um Zahlen. Es geht darum, wer bei euch worüber entscheidet – und ob sich das für beide richtig anfühlt.</>
        </Lead>

        <Card tone="white">
          <P style={{ marginBottom: 0, fontSize: 14.5 }}>
            Dieses Kapitel füllt ihr zusammen aus. Wenn ihr euch bei einer Frage nicht einig seid, sagt es laut, statt es wegzuklicken – Uneinigkeit auszusprechen ist wertvoller, als sie zu glätten.
          </P>
        </Card>

        <Card>
          {MONEY_Q.map((q) => (
            <QBlock key={q.k} item={q} value={d.money[q.k]} onChange={(v) => setIn("money", q.k, v)} />
          ))}
        </Card>

        <Card tone="white">
          <H3>Wer macht bei euch was?</H3>
          <P style={{ fontSize: 14, marginBottom: 20 }}>
            Auch die unsichtbaren Aufgaben zählen – Überblick behalten und Mitdenken sind Arbeit, auch wenn sie nirgends auftauchen.
          </P>
          {MONEY_TASKS.map((t) => (
            <div key={t} style={{ marginBottom: 18 }}>
              <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 400, color: C.ink, margin: "0 0 9px" }}>{t}</p>
              <div style={{ display: "flex", gap: 6 }}>
                {shareOpts.map(([v, lbl]) => {
                  const on = d.moneyTasks[t] === v;
                  return (
                    <button key={v} type="button" aria-pressed={on}
                      onClick={() => up((p) => { const nx = { ...p.moneyTasks }; if (on) delete nx[t]; else nx[t] = v; return { ...p, moneyTasks: nx }; })}
                      style={{
                        flex: 1, padding: "11px 4px", minHeight: 44, cursor: "pointer", borderRadius: 9,
                        border: `1px solid ${on ? C.terra : C.line}`,
                        background: on ? C.terra : C.white,
                        color: on ? C.white : C.muted,
                        fontFamily: SANS, fontSize: 12.5, fontWeight: on ? 500 : 300, lineHeight: 1.3,
                      }}>{lbl}</button>
                  );
                })}
              </div>
            </div>
          ))}
          {taskCount >= 4 && (
            <div style={{ background: C.sand, borderRadius: 12, padding: "16px 18px", marginTop: 6 }}>
              <Kicker color={C.ink}>Wie es sich verteilt</Kicker>
              <P style={{ marginBottom: 0 }}>
                {Math.abs(mineHeavy - yoursHeavy) <= 1
                  ? "Das liegt bei euch ziemlich gleichmäßig. Wichtiger als die Verteilung ist ohnehin, dass beide wissen, was die andere Seite trägt – und das wisst ihr jetzt."
                  : `${mineHeavy > yoursHeavy ? names.a : names.b} trägt deutlich mehr davon. Das muss nicht falsch sein, solange es beiden bewusst ist und nicht einfach so passiert ist. Fragt einmal nach: Ist das eine bewusste Aufteilung oder nur die, die sich irgendwann eingeschlichen hat?`}
              </P>
            </div>
          )}
        </Card>

        <Impulse text={IMPULSES[7]} />

        <Field label="Wie sorgen wir dafür, dass beide auf Augenhöhe entscheiden?" optional rows={3}
          hint="Besonders dann, wenn eine Seite mehr einbringt als die andere. Ein Satz genügt."
          value={d.moneyNote} onChange={(v) => up((p) => ({ ...p, moneyNote: v }))} />

        {answered < 3 && (
          <Pending>Beantwortet mindestens drei Fragen – dann findet ihr hier ein Muster, das bei vielen Paaren unbemerkt entsteht, und eine Vereinbarung, die es entschärft.</Pending>
        )}

        {answered >= 3 && (
          <Result title="Worauf ihr achten könnt">
            <P>Ein Muster, das bei vielen Paaren auftaucht: Wer mehr einbringt, entscheidet unbemerkt mehr mit. Nicht aus Absicht – es ergibt sich. Und wer weniger einbringt, sagt seltener etwas, weil es sich unpassend anfühlt.</P>
            <P style={{ marginBottom: 0 }}>Falls euch das bekannt vorkommt, ist das keine Schuldfrage. Es lässt sich mit einer einzigen Vereinbarung entschärfen: Ab einer bestimmten Summe entscheidet ihr grundsätzlich zu zweit – unabhängig davon, aus wessen Konto es kommt.</P>
          </Result>
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 8 – NÄHE & ZÄRTLICHKEIT
  ======================================================= */
  const Ch8 = () => {
    const mine = d.close[who] || {};
    const answered = Object.values(mine).filter((v) => (typeof v === "string" ? v.trim() : (v || []).length)).length;
    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Nähe ist mehr als das Offensichtliche. Sie entsteht beim Kochen, im Auto, in dem Moment, in dem jemand merkt, dass etwas nicht stimmt, bevor es ausgesprochen wird.</>
          <>Der erste Teil dieses Kapitels ist privat. Ihr müsst nichts davon zeigen.</>
        </Lead>

        <Card tone="sage">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Lock size={17} color={C.sage} style={{ flexShrink: 0, marginTop: 3 }} aria-hidden="true" />
            <div>
              <P>Nichts muss beantwortet oder geteilt werden, wenn es sich nicht sicher anfühlt. Der gemeinsame Teil weiter unten ist ausdrücklich freiwillig.</P>
              <P style={{ fontSize: 14, marginBottom: 0 }}>
                Ein ehrlicher Hinweis dazu: Eure Antworten liegen zusammen auf diesem Gerät, und über die Namen oben lässt sich zwischen beiden Seiten hin- und herschalten.
                „Privat“ heißt hier also: Ihr müsst nichts vorlesen. Was wirklich niemand lesen soll, schreibt lieber gar nicht erst hin.
              </P>
            </div>
          </div>
        </Card>

        <WhoTabs who={who} setWho={setWho} names={names} />

        <Card>
          <H3>Für {names[who]} allein</H3>
          {CLOSE_PRIVATE.map((q) => (
            <QBlock key={q.k} item={q} value={mine[q.k]}
              onChange={(v) => setWho2("close", who, q.k, v)} />
          ))}
          <Field label="Was bedeutet Intimität für mich – abseits von allem Körperlichen?" optional rows={3}
            hint="Die eine Frage in diesem Kapitel, für die es keine Auswahlliste gibt. Zwei Zeilen reichen."
            value={(d.closeFree || {})[who]}
            onChange={(v) => up((p) => ({ ...p, closeFree: { ...p.closeFree, [who]: v } }))} />
        </Card>

        <Impulse text={IMPULSES[8]} />

        <Card tone="white">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <H3 style={{ marginBottom: 0 }}>Wenn ihr mögt: gemeinsam</H3>
            <Pill tone="solo">freiwillig</Pill>
          </div>
          <P style={{ fontSize: 14, marginBottom: 18 }}>Fünf Fragen zum Vorlesen. Ihr müsst sie nicht der Reihe nach nehmen und keine davon beantworten.</P>
          {CLOSE_TOGETHER.map((q, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
              <span aria-hidden="true" style={{ fontFamily: SERIF, fontSize: 17, color: C.terra, flexShrink: 0 }}>{i + 1}</span>
              <p style={{ fontFamily: SERIF, fontSize: 19, fontStyle: "italic", lineHeight: 1.45, color: C.ink, margin: 0 }}>{q}</p>
            </div>
          ))}
          <Field label="Wollt ihr etwas festhalten?" optional rows={3}
            hint="Nur wenn ihr möchtet. Ein Satz reicht."
            value={d.closeShared} onChange={(v) => up((p) => ({ ...p, closeShared: v }))} />
        </Card>

        {answered < 3 && (
          <Pending>Beantwortet ein paar der privaten Fragen – dann steht hier der eine Gedanke, auf den es bei diesem Thema wirklich ankommt.</Pending>
        )}

        {answered >= 3 && (
          <Result title="Ein Gedanke zum Schluss">
            <P>Was Nähe angeht, gibt es keinen Normalwert. Paare unterscheiden sich hier stärker als in fast allem anderen – und Vergleiche mit anderen führen zu nichts.</P>
            <P style={{ marginBottom: 0 }}>Was zählt, ist nur eins: Könnt ihr darüber reden, ohne dass sich jemand rechtfertigen muss? Wenn ja, ist der Rest lösbar. Wenn nein, ist genau das der eigentliche Punkt.</P>
          </Result>
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 9 – AUSSENWELT & GRENZEN
  ======================================================= */
  const Ch9 = () => {
    const put = (bucket, topic) => up((p) => {
      const openL = p.outside.open.filter((x) => x !== topic);
      const privL = p.outside.private.filter((x) => x !== topic);
      const already = p.outside[bucket].includes(topic);
      if (already) return { ...p, outside: { open: openL, private: privL } };
      return {
        ...p,
        outside: bucket === "open"
          ? { open: [...openL, topic], private: privL }
          : { open: openL, private: [...privL, topic] },
      };
    });
    const sorted = d.outside.open.length + d.outside.private.length;

    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Die Reaktionen von außen treffen selten beide gleich. Oft trägt eine Seite mehr davon, ohne es zu sagen.</>
          <>Der Punkt ist nicht, Fremden etwas zu erklären. Der Punkt ist, dass ihr vorher wisst, was ihr teilt und was nicht.</>
        </Lead>

        <Card>
          <H3>Was gehört zu uns – und was gehört den anderen?</H3>
          <P style={{ fontSize: 14, marginBottom: 20 }}>Ordnet jedes Thema zu. Tippt auf einen der beiden Knöpfe; nochmal tippen hebt die Zuordnung wieder auf.</P>
          {OUTSIDE_TOPICS.map((t) => {
            const isOpen = d.outside.open.includes(t);
            const isPriv = d.outside.private.includes(t);
            return (
              <div key={t} style={{ padding: "14px 0", borderBottom: `1px solid ${C.line}` }}>
                <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 400, lineHeight: 1.5, color: C.ink, margin: "0 0 10px" }}>{t}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" aria-pressed={isOpen} onClick={() => put("open", t)}
                    style={{
                      flex: 1, padding: "10px 8px", minHeight: 44, cursor: "pointer", borderRadius: 10,
                      border: `1px solid ${isOpen ? C.sage : C.line}`,
                      background: isOpen ? C.sage : C.white,
                      color: isOpen ? C.white : C.body,
                      fontFamily: SANS, fontSize: 13, fontWeight: isOpen ? 500 : 300,
                    }}>Darüber sprechen wir offen</button>
                  <button type="button" aria-pressed={isPriv} onClick={() => put("private", t)}
                    style={{
                      flex: 1, padding: "10px 8px", minHeight: 44, cursor: "pointer", borderRadius: 10,
                      border: `1px solid ${isPriv ? C.terra : C.line}`,
                      background: isPriv ? C.terra : C.white,
                      color: isPriv ? C.white : C.body,
                      fontFamily: SANS, fontSize: 13, fontWeight: isPriv ? 500 : 300,
                    }}>Das bleibt privat</button>
                </div>
              </div>
            );
          })}
        </Card>

        <Card tone="white">
          <H3>Sätze für unangenehme Kommentare</H3>
          <P style={{ fontSize: 14, marginBottom: 20 }}>Vier Tonlagen. Sucht euch pro Situation eine aus – und sprecht sie einmal laut aus, sonst fallen sie euch im Moment nicht ein.</P>
          {REPLIES.map((r) => (
            <div key={r.tone} style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: C.terra, marginBottom: 9 }}>{r.tone}</div>
              {r.lines.map((line) => (
                <div key={line} style={{
                  display: "flex", gap: 11, alignItems: "flex-start",
                  background: C.sand, borderRadius: 10, padding: "12px 14px", marginBottom: 7,
                }}>
                  <span aria-hidden="true" style={{ color: C.line, fontFamily: SERIF, fontSize: 21, lineHeight: 1, marginTop: 2 }}>„</span>
                  <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 300, lineHeight: 1.55, color: C.ink, margin: 0 }}>{line}</p>
                </div>
              ))}
            </div>
          ))}
          <Field label="Eigene Sätze, die zu euch passen" optional rows={3}
            hint="Am besten in eurer eigenen Sprache. Fremde Sätze bringt man selten über die Lippen."
            value={d.outsideNote} onChange={(v) => up((p) => ({ ...p, outsideNote: v }))} />
        </Card>

        {sorted < 4 && (
          <Pending>Ordnet mindestens vier Themen zu – dann seht ihr hier, wie eure Grenze nach außen aussieht und worauf ihr dabei achten solltet.</Pending>
        )}

        {sorted >= 4 && (
          <Result title="Eure Linie nach außen">
            <P>
              Offen: {d.outside.open.length} {d.outside.open.length === 1 ? "Thema" : "Themen"}. Privat: {d.outside.private.length}.
              {d.outside.private.length === 0
                ? " Bisher ist nichts als privat markiert. Prüft das noch einmal – Paare ohne geschützten Bereich erklären sich auf Dauer sehr viel."
                : d.outside.open.length === 0
                ? " Ihr schützt fast alles. Das ist völlig legitim. Achtet nur darauf, dass Verschlossenheit nach außen nicht auch zwischen euch entsteht."
                : " Diese Aufteilung ist eure Grenze. Sie funktioniert nur, wenn beide sie kennen und beide sie einhalten – auch dann, wenn jemand nachbohrt."}
            </P>
            <P style={{ marginBottom: 0 }}>
              Ein Hinweis, der oft unterschätzt wird: Klärt auch, was in sozialen Netzwerken sichtbar sein darf. Diese Grenze verschiebt sich schneller als jede andere, und meistens merkt es nur eine Seite.
            </P>
          </Result>
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 10 – BALANCE
  ======================================================= */
  const Ch10 = () => {
    const mine = d.balance[who] || {};
    const answered = Object.keys(mine).length;
    const bothDone = Object.keys(d.balance.a).length === BALANCE_AREAS.length
      && Object.keys(d.balance.b).length === BALANCE_AREAS.length;

    const verdicts = bothDone ? BALANCE_AREAS.map((area) => {
      const va = d.balance.a[area], vb = d.balance.b[area];
      const bothBalanced = va === 2 && vb === 2;
      const diff = Math.abs(va - vb);
      return {
        area,
        kind: bothBalanced ? "gut" : diff >= 2 ? "unterschiedlich" : "gespraech",
      };
    }) : [];

    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Balance heißt nicht, dass alles exakt gleich verteilt ist. In den meisten Paaren übernimmt jede Seite bestimmte Bereiche, und das ist gut so.</>
          <>Die Frage ist eine andere: Fühlen sich beide Stimmen gleich wertvoll an? Wird gefragt, bevor entschieden wird?</>
        </Lead>

        <WhoTabs who={who} setWho={setWho} names={names}
          counts={{ a: `${Object.keys(d.balance.a).length}/9`, b: `${Object.keys(d.balance.b).length}/9` }} />

        <Card>
          <H3>Wer entscheidet bei euch?</H3>
          <P style={{ fontSize: 14, marginBottom: 20 }}>
            {names[who]}: Wie erlebst du die Entscheidungen in diesen Bereichen? Es geht um dein Erleben, nicht um eine objektive Wahrheit – die gibt es hier nicht.
          </P>
          {BALANCE_AREAS.map((area) => (
            <div key={area} style={{ marginBottom: 22 }}>
              <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 400, color: C.ink, margin: "0 0 9px" }}>{area}</p>
              <div style={{ display: "flex", gap: 6 }}>
                {BALANCE_SCALE.map((sc) => {
                  const on = mine[area] === sc.v;
                  return (
                    <button key={sc.v} type="button" aria-pressed={on}
                      onClick={() => setWho2("balance", who, area, sc.v)}
                      style={{
                        flex: 1, padding: "11px 4px", minHeight: 44, cursor: "pointer", borderRadius: 9,
                        border: `1px solid ${on ? C.terra : C.line}`,
                        background: on ? C.terra : C.white,
                        color: on ? C.white : C.muted,
                        fontFamily: SANS, fontSize: 11.5, fontWeight: on ? 500 : 300, lineHeight: 1.3,
                      }}>{sc.label}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>

        <Impulse text={IMPULSES[10]} />

        {!bothDone && (
          <Pending>Wenn beide alle neun Bereiche eingeschätzt haben, sortiert die Auswertung sie hier in drei Gruppen – ohne Punktzahl, nur nach eurer Wahrnehmung.</Pending>
        )}

        {bothDone && (
          <Result title="Wie ihr die Balance erlebt">
            <P>Hier steht keine Punktzahl. Es geht nur darum, wo eure Wahrnehmungen zusammenpassen und wo nicht.</P>
            {["gut", "gespraech", "unterschiedlich"].map((kind) => {
              const items = verdicts.filter((v) => v.kind === kind).map((v) => v.area);
              if (items.length === 0) return null;
              const head = kind === "gut" ? "Hier erlebt ihr bereits viel Balance"
                : kind === "gespraech" ? "Hier lohnt sich ein offenes Gespräch"
                : "Hier scheinen eure Wahrnehmungen unterschiedlich zu sein";
              const note = kind === "gut" ? "Beide erleben diese Bereiche als ausgewogen. Das ist eine gute Grundlage."
                : kind === "gespraech" ? "Ihr liegt nah beieinander, aber nicht deckungsgleich. Ein kurzes Gespräch reicht hier meistens."
                : "Ihr erlebt dieselben Bereiche verschieden. Das ist der interessanteste Befund in diesem Kapitel – und kein Vorwurf an eine der beiden Seiten.";
              const col = kind === "gut" ? C.sage : kind === "gespraech" ? C.muted : C.terra;
              return (
                <div key={kind} style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: col, marginBottom: 9 }}>{head}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 9 }}>
                    {items.map((a) => (
                      <span key={a} style={{
                        fontFamily: SANS, fontSize: 13.5, fontWeight: 400, color: C.ink,
                        background: C.sand, borderRadius: 20, padding: "6px 14px",
                      }}>{a}</span>
                    ))}
                  </div>
                  <P style={{ fontSize: 14, marginBottom: 0 }}>{note}</P>
                </div>
              );
            })}
            <div style={{ background: C.sand, borderRadius: 12, padding: "16px 18px" }}>
              <Kicker color={C.ink}>Leitfrage</Kicker>
              <p style={{ fontFamily: SERIF, fontSize: 21, fontStyle: "italic", lineHeight: 1.45, color: C.ink, margin: 0 }}>
                Fühlen sich beide Stimmen in unserer Beziehung gleich wertvoll an?
              </p>
            </div>
          </Result>
        )}

        {answered > 0 && (
          <Field label="Was möchtet ihr dazu festhalten?" optional rows={3}
            hint="Besonders zu den Bereichen, bei denen ihr unterschiedlich geantwortet habt."
            value={d.balanceNote} onChange={(v) => up((p) => ({ ...p, balanceNote: v }))} />
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 11 – LEBENSPHASEN
  ======================================================= */
  const Ch11 = () => {
    const answered = Object.values(d.phaseStatus || {}).filter((v) => (v || "").trim()).length;
    const openTopics = PHASE_TOPICS
      .filter((t) => d.phaseStatus[t.k] === "Nie darüber gesprochen" || d.phaseStatus[t.k] === "Haben wir mal angerissen")
      .map((t) => t.label);
    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Wenn zwei Menschen an unterschiedlichen Punkten im Leben stehen, laufen manche Zeitachsen nicht parallel. Das gilt bei großem Altersunterschied deutlicher – aber nicht nur dort.</>
          <>Es geht hier nicht um Sorgen. Es geht um die Frage: Was besprechen wir heute, damit wir später bewusster entscheiden können?</>
        </Lead>

        <Card tone="white">
          <P style={{ marginBottom: 0, fontSize: 14.5 }}>
            Geht die Themen kurz durch und ordnet jedes ein. Das dauert zwei Minuten – und zeigt euch danach ziemlich genau, wo eine Unterhaltung fehlt.
          </P>
        </Card>

        <Card>
          {PHASE_TOPICS.map((t) => {
            const st = d.phaseStatus[t.k];
            return (
              <div key={t.k} style={{ marginBottom: 24 }}>
                <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: C.ink, margin: "0 0 4px" }}>{t.label}</p>
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 300, fontStyle: "italic", color: C.muted, margin: "0 0 10px", lineHeight: 1.5 }}>{t.q}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PHASE_STATUS.map((s) => {
                    const on = st === s;
                    return (
                      <button key={s} type="button" aria-pressed={on}
                        onClick={() => setIn("phaseStatus", t.k, on ? "" : s)}
                        style={{
                          padding: "10px 14px", minHeight: 44, cursor: "pointer", borderRadius: 22,
                          border: `1px solid ${on ? C.terra : C.line}`,
                          background: on ? C.terra : C.white,
                          color: on ? C.white : C.body,
                          fontFamily: SANS, fontSize: 13, fontWeight: on ? 500 : 300,
                        }}>{s}</button>
                    );
                  })}
                </div>
                {(st === "Nie darüber gesprochen" || st === "Haben wir mal angerissen") && (
                  <div style={{ marginTop: 14 }}>
                    <Field label="" optional rows={2}
                      placeholder="Was müsstet ihr dazu klären? Ein Stichwort reicht."
                      value={d.phases[t.k]} onChange={(v) => setIn("phases", t.k, v)} />
                  </div>
                )}
              </div>
            );
          })}
        </Card>

        {answered < 2 && (
          <Pending>Ordnet mindestens zwei Themen ein – dann steht hier, welches davon ihr als Erstes in einen echten Termin verwandeln solltet.</Pending>
        )}

        {answered >= 2 && (
          <Result title="Was ihr daraus mitnehmt">
            {openTopics.length > 0 ? (
              <>
                <P>
                  Ungeklärt {openTopics.length === 1 ? "ist" : "sind"} bei euch: <strong style={{ fontWeight: 600, color: C.ink }}>{openTopics.join(", ")}</strong>.
                </P>
                <P>Nehmt davon eins – am besten das, bei dem einer von euch gerade innerlich „na ja“ gedacht hat. Das ist meistens das, vor dem beide ein bisschen ausweichen.</P>
              </>
            ) : (
              <P>Ihr habt alles entweder geklärt oder als nicht relevant markiert. Das ist ungewöhnlich – prüft einmal, ob „geklärt“ wirklich heißt, dass ihr darüber gesprochen habt, oder ob ihr nur beide dasselbe annehmt.</P>
            )}
            <P style={{ marginBottom: 0 }}>Und macht daraus einen Termin statt eines Vorsatzes. „Wir müssten mal“ hat noch kein Paar weitergebracht. Ein Datum im Kalender schon.</P>
          </Result>
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 12 – UNSERE ZUKUNFT
  ======================================================= */
  const Ch12 = () => {
    const hz = tmp.hz || "jahr";
    const setHz = (k) => setTmp((t) => ({ ...t, hz: k }));
    const cur = HORIZONS.find((h) => h.k === hz);
    const filled = HORIZONS.filter((h) => (d.future[h.k] || "").trim()).length;

    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Träume, die niemand ausspricht, bleiben Träume. Träume, die irgendwo stehen, werden mit der Zeit zu Plänen.</>
          <>Vier Zeitpunkte, einer nach dem anderen. Nicht alles auf einmal – das überfordert nur.</>
        </Lead>

        <Card>
          <H3>Welche Bereiche sind euch wichtig?</H3>
          <P style={{ fontSize: 14, marginBottom: 16 }}>Wählt drei bis fünf aus. Das hilft, beim Schreiben nicht ins Allgemeine abzurutschen.</P>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {FUTURE_AREAS.map((a) => {
              const on = d.futureAreas.includes(a);
              return (
                <button key={a} type="button" aria-pressed={on}
                  onClick={() => up((p) => ({ ...p, futureAreas: toggleIn(p.futureAreas, a) }))}
                  style={{
                    padding: "10px 16px", minHeight: 44, cursor: "pointer", borderRadius: 24,
                    border: `1px solid ${on ? C.sage : C.line}`,
                    background: on ? C.sage : C.white,
                    color: on ? C.white : C.body,
                    fontFamily: SANS, fontSize: 13.5, fontWeight: on ? 500 : 300,
                  }}>{a}</button>
              );
            })}
          </div>
        </Card>

        <div style={{ display: "flex", gap: 5, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {HORIZONS.map((h, i) => {
            const on = hz === h.k;
            const has = (d.future[h.k] || "").trim();
            return (
              <button key={h.k} type="button" aria-pressed={on} onClick={() => setHz(h.k)}
                style={{
                  flex: "1 0 auto", padding: "12px 14px", minHeight: 44, cursor: "pointer", borderRadius: 12,
                  border: `1px solid ${on ? C.terra : C.line}`,
                  background: on ? C.terra : C.white,
                  color: on ? C.white : C.body,
                  fontFamily: SANS, fontSize: 12.5, fontWeight: on ? 500 : 300, whiteSpace: "nowrap",
                }}>
                {has && !on && <span aria-hidden="true" style={{ color: C.terra, marginRight: 6 }}>•</span>}
                {h.label}
              </button>
            );
          })}
        </div>

        <Card tone="white" style={{ position: "relative" }}>
          <div aria-hidden="true" style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 18,
          }}>
            {HORIZONS.map((h, i) => (
              <React.Fragment key={h.k}>
                <span style={{
                  width: hz === h.k ? 13 : 9, height: hz === h.k ? 13 : 9, borderRadius: "50%",
                  background: (d.future[h.k] || "").trim() ? C.terra : C.taupe,
                  border: hz === h.k ? `2px solid ${C.terra}` : "none", flexShrink: 0,
                }} />
                {i < HORIZONS.length - 1 && <span style={{ flex: 1, height: 1, background: C.line }} />}
              </React.Fragment>
            ))}
          </div>
          <H3>{cur.label}</H3>
          <P style={{ fontSize: 14, marginBottom: 16 }}>{cur.note}</P>
          <Field label="" rows={6}
            placeholder={d.futureAreas.length > 0
              ? `Denkt an: ${d.futureAreas.join(", ")}`
              : "Wie sieht euer Leben aus? Wo wohnt ihr, was macht ihr, wie geht es euch?"}
            value={d.future[hz]} onChange={(v) => setIn("future", hz, v)} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <Btn small variant="quiet" onClick={() => {
              const i = HORIZONS.findIndex((h) => h.k === hz);
              if (i > 0) setHz(HORIZONS[i - 1].k);
            }}><ChevronLeft size={14} /> Vorher</Btn>
            <Btn small variant="ghost" onClick={() => {
              const i = HORIZONS.findIndex((h) => h.k === hz);
              if (i < HORIZONS.length - 1) setHz(HORIZONS[i + 1].k);
            }}>Später <ChevronRight size={14} /></Btn>
          </div>
        </Card>

        <Card>
          <H3>Euer Visionboard</H3>
          <P style={{ fontSize: 14, marginBottom: 16 }}>
            Kurze Schlagwörter statt Sätze. Tippt einen Vorschlag an oder schreibt euer eigenes – die Karte landet dann bei dem Zeitpunkt, der oben ausgewählt ist ({cur.label.toLowerCase()}).
          </P>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={tmp.vis || ""} placeholder="Zum Beispiel: Ein Haus mit Garten"
              aria-label="Eigenen Wunsch eintragen"
              onChange={(e) => setTmp((t) => ({ ...t, vis: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || !(tmp.vis || "").trim()) return;
                up((p) => ({ ...p, vision: [...p.vision, { t: tmp.vis.trim(), w: hz }] }));
                setTmp((t) => ({ ...t, vis: "" }));
              }}
              style={{
                flex: 1, minWidth: 0, fontFamily: SANS, fontSize: 15.5, fontWeight: 300,
                padding: "13px 15px", borderRadius: 10, border: `1px solid ${C.line}`,
                background: C.white, outline: "none", color: C.ink, minHeight: 44,
              }} />
            <button type="button" aria-label="Wunsch hinzufügen"
              onClick={() => {
                if (!(tmp.vis || "").trim()) return;
                up((p) => ({ ...p, vision: [...p.vision, { t: tmp.vis.trim(), w: hz }] }));
                setTmp((t) => ({ ...t, vis: "" }));
              }}
              style={{
                background: C.terra, border: "none", borderRadius: 10, cursor: "pointer",
                padding: "0 17px", minHeight: 44, color: C.white, display: "grid", placeItems: "center",
              }}><Plus size={17} /></button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {VISION_SUGGEST.filter((x) => !d.vision.some((v) => v.t === x)).map((x) => (
              <button key={x} type="button"
                onClick={() => up((p) => ({ ...p, vision: [...p.vision, { t: x, w: hz }] }))}
                style={{
                  padding: "9px 14px", minHeight: 44, cursor: "pointer", borderRadius: 22,
                  border: `1px solid ${C.line}`, background: C.white, color: C.body,
                  fontFamily: SANS, fontSize: 13, fontWeight: 300,
                  display: "inline-flex", alignItems: "center", gap: 7,
                }}>
                <Plus size={12} color={C.terra} aria-hidden="true" /> {x}
              </button>
            ))}
          </div>
        </Card>

        {d.vision.length > 0 && (
          <div style={{ background: C.taupe, borderRadius: 16, padding: "26px 14px 12px", marginBottom: 20 }}>
            {HORIZONS.map((h) => {
              const items = d.vision.map((v, i) => ({ ...v, i })).filter((v) => v.w === h.k);
              if (!items.length) return null;
              return (
                <div key={h.k} style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
                    <span aria-hidden="true" style={{ flex: 1, height: 1, background: C.line }} />
                    <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 2.4, fontWeight: 600, textTransform: "uppercase", color: C.ink }}>
                      {h.label}
                    </span>
                    <span aria-hidden="true" style={{ flex: 1, height: 1, background: C.line }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                    {items.map((v, n) => (
                      <div key={v.i} style={{ position: "relative", transform: `rotate(${[-2.4, 2, 1.3, -1.6, 2.6, -2.1][n % 6]}deg)` }}>
                        <div style={{ background: C.white, borderRadius: 3, padding: "15px 11px 18px", boxShadow: "0 5px 16px rgba(74,59,46,0.15)" }}>
                          <div style={{
                            background: `linear-gradient(150deg, ${C.sand} 0%, ${C.taupe} 100%)`,
                            borderRadius: 2, minHeight: 84, display: "flex", alignItems: "center",
                            justifyContent: "center", padding: "15px 9px", marginBottom: 11,
                          }}>
                            <span style={{ fontFamily: HAND, fontSize: 24, fontWeight: 600, lineHeight: 1.15, color: C.ink, textAlign: "center" }}>
                              {v.t}
                            </span>
                          </div>
                          <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: 1.4, fontWeight: 500, textTransform: "uppercase", color: C.muted, textAlign: "center" }}>
                            {h.label}
                          </div>
                        </div>
                        <span aria-hidden="true" style={{
                          position: "absolute", top: -8, left: "50%",
                          transform: "translateX(-50%) rotate(-3deg)", width: 50, height: 16,
                          background: "rgba(142,76,54,0.3)", border: "1px solid rgba(142,76,54,0.2)", borderRadius: 1,
                        }} />
                        <button type="button" aria-label={`${v.t} entfernen`}
                          onClick={() => up((p) => ({ ...p, vision: p.vision.filter((_, j) => j !== v.i) }))}
                          style={{
                            position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: "50%",
                            border: `1px solid ${C.line}`, background: C.white, cursor: "pointer",
                            display: "grid", placeItems: "center", padding: 0,
                          }}><X size={12} color={C.muted} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Impulse text={IMPULSES[12]} />

        {filled < 2 && (
          <Pending>Beschreibt mindestens zwei Zeitpunkte – dann prüft die Auswertung hier, ob eure Zeitachse vollständig ist und wo eine Lücke klafft.</Pending>
        )}

        {filled >= 2 && (
          <Result title="Eure Zeitachse">
            <P>Ihr habt {filled} von vier Zeitpunkten beschrieben.</P>
            <P>
              {!(d.future.jahr || "").trim()
                ? "Auffällig: Für das nächste Jahr steht noch nichts. Genau das ist aber der einzige Zeitraum, in dem ihr heute schon etwas tun könnt. Nehmt euch einen Punkt aus einem der späteren Felder und fragt euch, welche kleine Version davon in zwölf Monaten möglich wäre."
                : !(d.future.spaeter || "").trim()
                ? "Was noch fehlt, ist der letzte Zeitpunkt. Über „später im Leben“ sprechen die wenigsten Paare – und gerade bei unterschiedlichen Lebensphasen ist es das Feld, das am meisten Klarheit bringt."
                : "Ihr habt über alle Zeiträume nachgedacht, auch über den letzten. Das machen die wenigsten. Lest die vier Texte einmal hintereinander – daran seht ihr, ob eure Richtungen zusammenpassen."}
            </P>
            <P style={{ marginBottom: 0 }}>Nehmt euch aus dem ersten Feld eine einzige Sache mit ins Manifest. Der Rest darf offen bleiben.</P>
          </Result>
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 13 – ALLTAG & RITUALE
  ======================================================= */
  const Ch13 = () => {
    const season = SEASONS.find((s) => s.k === d.dateSeason) || SEASONS[0];
    const ideas = SEASON_DATES[season.k];
    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Beziehungen verändern sich nicht durch große Vorsätze, sondern durch das, was regelmäßig passiert.</>
          <>Zwei Listen: kleine Rituale für den Alltag und Ideen für die Abende, an denen ihr euch wirklich verabredet.</>
        </Lead>

        <Card>
          <H3>Unsere Rituale</H3>
          <P style={{ fontSize: 14, marginBottom: 18 }}>Wählt höchstens drei aus. Mehr schafft im Alltag niemand, und drei eingehaltene sind mehr wert als acht guten Willens.</P>
          {RITUAL_IDEAS.map((r) => (
            <Choice key={r} label={r} selected={d.rituals.includes(r)}
              onClick={() => up((p) => ({ ...p, rituals: toggleIn(p.rituals, r) }))} />
          ))}
        </Card>

        <Card tone="white">
          <H3>Date-Ideen nach Jahreszeit</H3>
          <div style={{ display: "flex", background: C.taupe, borderRadius: 40, padding: 4, marginBottom: 20 }}>
            {SEASONS.map((s) => (
              <button key={s.k} type="button" aria-pressed={d.dateSeason === s.k}
                onClick={() => up((p) => ({ ...p, dateSeason: s.k }))}
                style={{
                  flex: 1, padding: "11px 4px", minHeight: 44, cursor: "pointer", border: "none", borderRadius: 40,
                  background: d.dateSeason === s.k ? C.terra : "transparent",
                  color: d.dateSeason === s.k ? C.white : C.body,
                  fontFamily: SANS, fontSize: 13, fontWeight: 500,
                }}>{s.label}</button>
            ))}
          </div>
          {ideas.map((idea) => {
            const key = `${season.k}|${idea}`;
            const done = d.dateDone.includes(key);
            return (
              <div key={key} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "13px 0", borderBottom: `1px solid ${C.line}` }}>
                <button type="button" aria-pressed={done} aria-label={`${idea} als erledigt markieren`}
                  onClick={() => up((p) => ({ ...p, dateDone: toggleIn(p.dateDone, key) }))}
                  style={{
                    width: 22, height: 22, minWidth: 22, marginTop: 1, borderRadius: 6, cursor: "pointer",
                    border: `1px solid ${done ? C.terra : C.line}`,
                    background: done ? C.terra : C.white,
                    display: "grid", placeItems: "center", padding: 0,
                  }}>
                  {done && <Check size={12} color={C.white} />}
                </button>
                <p style={{
                  fontFamily: SANS, fontSize: 15, fontWeight: 300, lineHeight: 1.5, margin: 0,
                  color: done ? C.muted : C.body, textDecoration: done ? "line-through" : "none",
                }}>{idea}</p>
              </div>
            );
          })}
        </Card>


        {d.rituals.length > 0 && (
          <Card tone="white" style={{ padding: "26px 16px 24px" }}>
            <H3>Eine Woche zum Abhaken</H3>
            <P style={{ fontSize: 14, marginBottom: 20 }}>
              Hakt ab, was ihr tatsächlich gemacht habt. Nach sieben Tagen seht ihr schneller als in jedem Gespräch, was bei euch wirklich passiert.
            </P>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 316 }}>
                <div style={{ display: "flex", marginBottom: 10 }}>
                  <span style={{ flex: 1 }} />
                  {WEEKDAYS.map((day) => (
                    <span key={day} style={{ width: 32, textAlign: "center", fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.muted }}>{day}</span>
                  ))}
                </div>
                {d.rituals.map((r, ri) => (
                  <div key={r} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ flex: 1, minWidth: 0, fontFamily: SANS, fontSize: 13, fontWeight: 300, lineHeight: 1.35, color: C.body, paddingRight: 10 }}>{r}</span>
                    {WEEKDAYS.map((day, di) => {
                      const mk = `${ri}-${di}`;
                      const on = d.ritualMarks[mk];
                      return (
                        <span key={di} style={{ width: 32, display: "flex", justifyContent: "center" }}>
                          <button type="button" aria-pressed={!!on} aria-label={`${r} am ${day}`}
                            onClick={() => up((pp) => ({ ...pp, ritualMarks: { ...pp.ritualMarks, [mk]: !pp.ritualMarks[mk] } }))}
                            style={{
                              width: 26, height: 26, borderRadius: "50%", cursor: "pointer", padding: 0,
                              border: `1px solid ${on ? C.terra : C.line}`,
                              background: on ? C.terra : C.white, display: "grid", placeItems: "center",
                            }}>
                            {on && <Check size={13} color={C.white} />}
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <Field label="Rückblick auf die Woche" optional rows={3}
              hint="An welchem Tag lief es am besten – und was war da anders? Was ist als Erstes ausgefallen, als es stressig wurde?"
              value={d.weekNote} onChange={(v) => up((pp) => ({ ...pp, weekNote: v }))} />
          </Card>
        )}

        <Card>
          <H3>Wie fühlt sich euer Alltag gerade an?</H3>
          <P style={{ fontSize: 14, marginBottom: 20 }}>
            Verteilt hundert Prozent auf die drei Zustände. Es geht nicht um Genauigkeit, sondern um das Bauchgefühl.
          </P>
          {MOOD_BARS.map((m, i) => (
            <div key={m.k} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 400, color: C.ink }}>{m.label}</span>
                <span style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 500, color: C.terra }}>{d.mood[m.k]} %</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 300, color: C.muted, marginBottom: 9 }}>{m.note}</div>
              <div aria-hidden="true" style={{ height: 15, background: C.taupe, borderRadius: 10, overflow: "hidden", marginBottom: 7 }}>
                <div style={{ height: "100%", width: `${d.mood[m.k]}%`, borderRadius: 10, transition: "width .25s", background: [C.terra, "#B08A6E", C.sage][i] }} />
              </div>
              <input type="range" min="0" max="100" step="5" value={d.mood[m.k]}
                aria-label={`${m.label} in Prozent`}
                onChange={(e) => setIn("mood", m.k, Number(e.target.value))}
                style={{ width: "100%", accentColor: C.terra, height: 30 }} />
            </div>
          ))}
          {(() => {
            const sum = MOOD_BARS.reduce((acc, m) => acc + d.mood[m.k], 0);
            return (
              <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 300, textAlign: "right", color: sum === 100 ? C.muted : C.terra, margin: 0 }}>
                {sum === 100 ? "Summe stimmt." : `Zusammen ${sum} % – zieht es auf hundert.`}
              </p>
            );
          })()}
        </Card>

        <Impulse text={IMPULSES[13]} />

        {(d.rituals.length > 0 || d.dateDone.length > 0) && (
          <Result title="Euer Alltag">
            <P>
              {d.rituals.length > 0 && `${d.rituals.length} ${d.rituals.length === 1 ? "Ritual" : "Rituale"} ausgewählt. `}
              {d.dateDone.length > 0 && `${d.dateDone.length} ${d.dateDone.length === 1 ? "Idee" : "Ideen"} bereits abgehakt.`}
            </P>
            <P>
              {d.rituals.length > 3
                ? "Das sind mehr als drei. Erfahrungsgemäß überlebt davon höchstens die Hälfte den ersten stressigen Monat. Streicht bewusst, statt es später schleifen zu lassen."
                : d.rituals.length > 0
                ? "Eine gute Zahl. Legt jetzt noch fest, wer im Zweifel daran erinnert – Rituale ohne Zuständigkeit schlafen leise ein."
                : "Noch kein Ritual ausgewählt. Nehmt eins, das weniger als fünf Minuten kostet. Genau die halten am längsten."}
            </P>
            <P style={{ marginBottom: 0 }}>Und tragt eine der Date-Ideen diese Woche in den Kalender ein. Eine Liste, aus der nie etwas wird, ist nur eine weitere Liste.</P>
          </Result>
        )}

        {(() => {
          const dom = MOOD_BARS.reduce((acc, m) => (d.mood[m.k] > d.mood[acc.k] ? m : acc), MOOD_BARS[0]);
          const txt = {
            nah: "Der größte Teil eurer Zeit fühlt sich verbunden an. Das ist eine schöne Ausgangslage – und der beste Moment, um die unbequemen Themen anzugehen. Aus Sicherheit heraus zu reden ist leichter als aus einer Krise heraus.",
            mittel: "Der größte Teil liegt im Dazwischen. So leben die meisten Paare über weite Strecken: Es ist nichts falsch, aber auch nichts besonders. Genau hier wirken kleine Rituale stärker als große Gespräche.",
            fern: "Der größte Teil fühlt sich gerade auf Distanz an. Das ist ein ernstzunehmendes Signal, aber kein Urteil über euch. Lasst große Pläne weg und sucht euch eine einzige tägliche Berührung mit dem Alltag der anderen Person – eine Frage, ein Anruf, zehn Minuten am Abend.",
          }[dom.k];
          return (
            <Result title="Was ihr daraus mitnehmt">
              <P>Am stärksten ist gerade <strong style={{ fontWeight: 600, color: C.ink }}>{dom.label.toLowerCase()}</strong>. {txt}</P>
              <P style={{ marginBottom: 0 }}>
                {d.mood.fern >= 30
                  ? "Und ein Hinweis: Bei diesem Anteil an Distanz würde ich beim ersten Ritual bewusst etwas wählen, das täglich stattfindet – nicht etwas Großes am Wochenende."
                  : "Kommt in ein paar Wochen zurück und schaut, ob sich die Verteilung verschoben hat. Das ist aussagekräftiger als der heutige Stand."}
              </P>
            </Result>
          );
        })()}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 14 – MANIFEST
  ======================================================= */
  const manifestText = (() => {
    const L = [];
    L.push("UNSER BEZIEHUNGSMANIFEST");
    L.push(`${names.a} und ${names.b}`);
    L.push("");
    if (d.core.length === 3) {
      L.push("UNSERE DREI WERTE");
      L.push(`Unsere Beziehung soll geprägt sein von ${d.core[0]}, ${d.core[1]} und ${d.core[2]}.`);
      L.push("");
    }
    const admireA = (d.seen.a || {}).bewundere, admireB = (d.seen.b || {}).bewundere;
    if ((admireA || "").trim() || (admireB || "").trim()) {
      L.push("WAS WIR ANEINANDER SCHÄTZEN");
      if ((admireA || "").trim()) L.push(`${names.a}: ${admireA.trim()}`);
      if ((admireB || "").trim()) L.push(`${names.b}: ${admireB.trim()}`);
      L.push("");
    }
    const pauseBits = [...(d.pause.erkennen || []), d.pause.dauer, d.pause.zusage, d.pause.zurueck].filter((x) => (x || "").trim());
    if (pauseBits.length) {
      L.push("WIE WIR KONFLIKTE FÜHREN");
      pauseBits.forEach((b) => L.push(`— ${b.trim()}`));
      L.push("");
    }
    if (d.outside.private.length) {
      L.push("WAS WIR NACH AUSSEN SCHÜTZEN");
      L.push(d.outside.private.join(" · "));
      L.push("");
    }
    if ((d.future.jahr || "").trim()) {
      L.push("WAS WIR GEMEINSAM AUFBAUEN");
      L.push(d.future.jahr.trim());
      L.push("");
    }
    if (d.rituals.length) {
      L.push("UNSERE RITUALE");
      d.rituals.forEach((r) => L.push(`— ${r}`));
      L.push("");
    }
    if ((d.promise || "").trim()) {
      L.push("UNSER VERSPRECHEN");
      L.push(d.promise.trim());
      L.push("");
    }
    L.push(new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }));
    return L.join("\n");
  })();

  const PosterCard = () => {
    const ready = WHEEL_AREAS.some((x) => d.wheel.a[x.k]) || WHEEL_AREAS.some((x) => d.wheel.b[x.k]);
    return (
      <Card tone="white">
        <Kicker>Zum Aufhängen</Kicker>
        <H3>Euer Bild</H3>
        <P style={{ fontSize: 14, marginBottom: ready ? 18 : 0 }}>
          Alles, was ihr eingetragen habt, auf einer Seite: euer Rad, die Zeit, die euch beiden guttut, eure Zeitleiste.
          Als Bild zum Speichern – für den Kühlschrank, den Sperrbildschirm oder um es jemandem zu schicken.
        </P>
        {!ready ? (
          <P style={{ fontSize: 14, marginBottom: 0, fontStyle: "italic", color: C.muted }}>
            Sobald ihr in Kapitel 2 die acht Regler eingestellt habt, entsteht hier eure Seite.
          </P>
        ) : (
          <>
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              <canvas ref={posterRef} width={PW} height={PH}
                aria-label="Euer Bild"
                style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            {!tmp.posterImg ? (
              <>
                <Btn small onClick={sharePoster}>Bild sichern</Btn>
                <p style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 300, lineHeight: 1.55, color: C.muted, marginTop: 12, marginBottom: 0 }}>
                  Falls sich kein Menü öffnet, erscheint das Bild direkt hier – dann lange darauf tippen und „Bild sichern“ wählen.
                </p>
              </>
            ) : (
              <div>
                <div style={{ background: C.sand, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
                  <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: C.ink, margin: "0 0 6px" }}>
                    Fast geschafft
                  </p>
                  <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6, color: C.body, margin: 0 }}>
                    Tippt unten <strong style={{ fontWeight: 500, color: C.ink }}>lange auf das Bild</strong> und wählt
                    „Bild sichern“ beziehungsweise „Zu Fotos hinzufügen“. Am Rechner klappt ein Rechtsklick und
                    „Bild speichern unter“.
                  </p>
                </div>
                <img src={tmp.posterImg} alt="Euer Bild zum Speichern"
                  style={{
                    width: "100%", height: "auto", display: "block", borderRadius: 12,
                    border: `1px solid ${C.line}`, marginBottom: 14,
                  }} />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href={tmp.posterImg} download={tmp.posterName || "wir-zwei.png"}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
                      fontFamily: SANS, fontSize: 14, fontWeight: 500, color: C.terra,
                      border: `1px solid ${C.line}`, borderRadius: 24, padding: "11px 18px", minHeight: 44,
                      boxSizing: "border-box",
                    }}>Stattdessen herunterladen</a>
                  <Btn small variant="quiet" onClick={() => setTmp((t) => ({ ...t, posterImg: null }))}>
                    Fertig
                  </Btn>
                </div>
              </div>
            )}

            {tmp.posterFail && (
              <p style={{ fontFamily: SANS, fontSize: 13, color: C.muted, marginTop: 12, marginBottom: 0 }}>
                Das hat nicht geklappt. Macht stattdessen einfach einen Screenshot der Vorschau oben –
                das Ergebnis ist dasselbe.
              </p>
            )}
          </>
        )}
      </Card>
    );
  };

  const Ch14 = () => {
    const blocks = [
      { h: "Unsere drei Werte", body: d.core.length === 3 ? `Unsere Beziehung soll geprägt sein von ${d.core[0]}, ${d.core[1]} und ${d.core[2]}.` : null, from: "Kapitel 6", to: 6 },
      { h: "Was wir aneinander schätzen", body: [(d.seen.a || {}).bewundere, (d.seen.b || {}).bewundere].filter((x) => (x || "").trim()).join("\n"), from: "Kapitel 3", to: 3 },
      { h: "Wie wir Konflikte führen", body: [...(d.pause.erkennen || []), d.pause.dauer, d.pause.zusage, d.pause.zurueck].filter((x) => (x || "").trim()).join("\n"), from: "Kapitel 5", to: 5 },
      { h: "Was wir nach außen schützen", body: d.outside.private.length ? d.outside.private.join(" · ") : null, from: "Kapitel 9", to: 9 },
      { h: "Was wir gemeinsam aufbauen", body: (d.future.jahr || "").trim() || null, from: "Kapitel 12", to: 12 },
      { h: "Unsere Rituale", body: d.rituals.length ? d.rituals.join("\n") : null, from: "Kapitel 13", to: 13 },
    ];
    const ready = blocks.filter((b) => b.body).length;

    const doCopy = async () => {
      try {
        await navigator.clipboard.writeText(manifestText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch (e) {
        setTmp((t) => ({ ...t, copyFail: true }));
      }
    };

    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Dieses Kapitel schreibt sich fast von selbst. Alles, was hier steht, habt ihr in den Kapiteln davor schon beantwortet.</>
          <>Was fehlt, ist nur noch ein Satz – und der ist der schwerste.</>
        </Lead>

        <div id="manifest" style={{
          background: C.white, borderRadius: 16, padding: "34px 24px 30px", marginBottom: 20,
          border: `1px solid ${C.line}`,
        }}>
          <div style={{ textAlign: "center", marginBottom: 26, paddingBottom: 22, borderBottom: `1px solid ${C.line}` }}>
            <div aria-hidden="true" style={{ color: C.line, fontSize: 14, letterSpacing: 8, marginBottom: 12 }}>✦ ✦ ✦</div>
            <p style={{ fontFamily: SANS, fontSize: 11.5, letterSpacing: 3, fontWeight: 600, textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>
              Unser Beziehungsmanifest
            </p>
            <p style={{ fontFamily: HAND, fontSize: 34, fontWeight: 600, color: C.ink, margin: 0, lineHeight: 1.15 }}>
              {names.a} &amp; {names.b}
            </p>
          </div>

          {blocks.map((b) => (
            <div key={b.h} style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: C.terra, marginBottom: 8 }}>
                {b.h}
              </div>
              {b.body ? (
                b.body.split("\n").map((line, i) => (
                  <p key={i} style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.5, color: C.ink, margin: "0 0 6px" }}>{line}</p>
                ))
              ) : (
                <button type="button" onClick={() => go(b.to)} className="no-print"
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left",
                    fontFamily: SANS, fontSize: 14, fontWeight: 300, fontStyle: "italic",
                    color: C.muted, textDecoration: "underline", minHeight: 44,
                  }}>
                  Noch offen – in {b.from} ergänzen
                </button>
              )}
            </div>
          ))}

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: C.terra, marginBottom: 8 }}>
              Unser Versprechen
            </div>
            {(d.promise || "").trim() ? (
              <p style={{ fontFamily: SERIF, fontSize: 21, fontStyle: "italic", lineHeight: 1.5, color: C.ink, margin: 0 }}>
                {d.promise}
              </p>
            ) : (
              <p className="no-print" style={{ fontFamily: SANS, fontSize: 14, fontStyle: "italic", color: C.muted, margin: 0 }}>
                Steht noch aus – gleich unten.
              </p>
            )}
          </div>
        </div>

        <Card>
          <Field label="Ein Versprechen, das wir uns geben"
            hint="Ein Satz. Nicht groß, sondern einhaltbar. Ein Versprechen, das ihr nur an guten Tagen halten könnt, ist keins."
            placeholder="Zum Beispiel: Wir gehen nicht schlafen, ohne einander gesagt zu haben, woran wir gerade sind."
            rows={3} value={d.promise} onChange={(v) => up((p) => ({ ...p, promise: v }))} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn small onClick={doCopy}>
              {copied ? <><Check size={14} /> Kopiert</> : <><Copy size={14} /> Text kopieren</>}
            </Btn>
            <Btn small variant="ghost" onClick={() => window.print()}>
              <Printer size={14} /> Drucken oder als PDF
            </Btn>
          </div>
          {tmp.copyFail && (
            <p style={{ fontFamily: SANS, fontSize: 13, color: C.muted, marginTop: 12, marginBottom: 0 }}>
              Das Kopieren hat dein Browser blockiert. Nutz stattdessen „Drucken oder als PDF“.
            </p>
          )}
        </Card>

        {PosterCard()}

        {ready < 3 && (
          <Pending>Euer Manifest füllt sich automatisch, sobald ihr die verlinkten Kapitel bearbeitet habt. Sobald drei Abschnitte stehen, findet ihr hier den letzten Hinweis dazu.</Pending>
        )}

        {ready >= 3 && (
          <Result title="Was ihr jetzt damit macht">
            <P>{ready} von sechs Abschnitten sind gefüllt. Die offenen Punkte könnt ihr jederzeit nachtragen – sie erscheinen hier automatisch.</P>
            <P style={{ marginBottom: 0 }}>Druckt es aus und hängt es irgendwo hin, wo ihr es seht. Nicht als Dekoration, sondern als Erinnerung: An dem Tag, an dem ihr das geschrieben habt, wart ihr euch über all das einig.</P>
          </Result>
        )}
      </Steps>
    );
  };


  /* =======================================================
     KAPITEL 15 – UNSERE LISTE
  ======================================================= */
  const listText = (() => {
    const L = [];
    L.push("UNSERE LISTE");
    L.push(`${names.a} und ${names.b}`);
    L.push("");
    if (d.core.length === 3) {
      L.push("UNSERE DREI WERTE");
      L.push(d.core.join(" · "));
      L.push("");
    }
    const lab = (k) => (AFFECTION.find((x) => x.k === k) || {}).label;
    if (d.affection.a.length || d.affection.b.length) {
      L.push("WODURCH WIR UNS GELIEBT FÜHLEN");
      if (d.affection.a.length) L.push(`${names.a}: ${d.affection.a.map(lab).join(", ")}`);
      if (d.affection.b.length) L.push(`${names.b}: ${d.affection.b.map(lab).join(", ")}`);
      L.push("");
    }
    if (d.rituals.length) {
      L.push("UNSERE RITUALE");
      d.rituals.forEach((r) => L.push(`- ${r}`));
      L.push("");
    }
    const open = [];
    SEASONS.forEach((se) => SEASON_DATES[se.k].forEach((idea) => {
      if (!d.dateDone.includes(`${se.k}|${idea}`)) open.push(`${se.label}: ${idea}`);
    }));
    const done = d.dateDone.map((k) => {
      const [sk, idea] = k.split("|");
      const se = SEASONS.find((x) => x.k === sk);
      return `${se ? se.label : ""}: ${idea}`;
    });
    if (done.length) {
      L.push("DATE-IDEEN, DIE WIR SCHON GEMACHT HABEN");
      done.forEach((x) => L.push(`- ${x}`));
      L.push("");
    }
    if (d.vision.length) {
      L.push("UNSER VISIONBOARD");
      HORIZONS.forEach((h) => {
        const items = d.vision.filter((v) => v.w === h.k);
        if (items.length) L.push(`${h.label}: ${items.map((v) => v.t).join(" · ")}`);
      });
      L.push("");
    }
    const pause = [...(d.pause.erkennen || []), d.pause.dauer, d.pause.zusage, d.pause.zurueck].filter((x) => (x || "").trim());
    if (pause.length) {
      L.push("UNSERE PAUSE-REGEL");
      pause.forEach((x) => L.push(`- ${x.trim()}`));
      L.push("");
    }
    const qtBoth = (d.qtime.a || []).filter((x) => (d.qtime.b || []).includes(x))
      .map((k) => (QUALITY_TIME.find((y) => y.k === k) || {}).label);
    if (qtBoth.length) {
      L.push("ZEIT, DIE UNS BEIDEN GUTTUT");
      qtBoth.forEach((x) => L.push(`- ${x}`));
      L.push("");
    }
    if ((d.repair || "").trim()) {
      L.push("UNSER SATZ FÜR DANACH");
      L.push(d.repair.trim());
      L.push("");
    }
    if (d.outside.private.length) {
      L.push("DAS BLEIBT PRIVAT");
      L.push(d.outside.private.join(" · "));
      L.push("");
    }
    L.push(new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }));
    return L.join("\n");
  })();

  const Ch15 = () => {
    const lab = (k) => (AFFECTION.find((x) => x.k === k) || {}).label;
    const doneDates = d.dateDone.map((k) => {
      const [sk, idea] = k.split("|");
      const se = SEASONS.find((x) => x.k === sk);
      return { season: se ? se.label : "", idea };
    });
    const openDates = [];
    SEASONS.forEach((se) => SEASON_DATES[se.k].forEach((idea) => {
      if (!d.dateDone.includes(`${se.k}|${idea}`)) openDates.push({ season: se.label, idea });
    }));

    const groups = [
      { h: "Unsere drei Werte", items: d.core, empty: "Noch offen – in Kapitel 6", to: 6 },
      {
        h: "Wodurch wir uns geliebt fühlen",
        items: [
          ...(d.affection.a.length ? [`${names.a}: ${d.affection.a.map(lab).join(", ")}`] : []),
          ...(d.affection.b.length ? [`${names.b}: ${d.affection.b.map(lab).join(", ")}`] : []),
        ],
        empty: "Noch offen – in Kapitel 3", to: 3,
      },
      { h: "Unsere Rituale", items: d.rituals, empty: "Noch offen – in Kapitel 13", to: 13 },
      {
        h: "Das haben wir schon gemacht",
        items: doneDates.map((x) => `${x.idea} (${x.season})`),
        empty: "Noch nichts abgehakt – in Kapitel 13", to: 13,
      },
      {
        h: "Unser Visionboard",
        items: HORIZONS.flatMap((h) => {
          const it = d.vision.filter((v) => v.w === h.k);
          return it.length ? [`${h.label}: ${it.map((v) => v.t).join(" · ")}`] : [];
        }),
        empty: "Noch offen – in Kapitel 12", to: 12,
      },
      {
        h: "Unsere Pause-Regel",
        items: [...(d.pause.erkennen || []), d.pause.dauer, d.pause.zusage, d.pause.zurueck].filter((x) => (x || "").trim()),
        empty: "Noch offen – in Kapitel 5", to: 5,
      },
      {
        h: "Zeit, die uns beiden guttut",
        items: (d.qtime.a || []).filter((x) => (d.qtime.b || []).includes(x))
          .map((k) => (QUALITY_TIME.find((y) => y.k === k) || {}).label),
        empty: "Noch offen – in Kapitel 3", to: 3,
      },
      {
        h: "Unser Satz für danach",
        items: (d.repair || "").trim() ? [d.repair.trim()] : [],
        empty: "Noch offen – in Kapitel 5", to: 5,
      },
      { h: "Das bleibt privat", items: d.outside.private, empty: "Noch offen – in Kapitel 9", to: 9 },
    ];
    const filledGroups = groups.filter((g) => g.items.length).length;

    return (
      <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
        <Lead>
          <>Das Manifest ist das Feierliche. Das hier ist das Praktische.</>
          <>Alles, was ihr euch vorgenommen habt, an einer Stelle – zum Kopieren in eure Notizen, zum Ausdrucken für den Kühlschrank, zum Wiederlesen in einem halben Jahr.</>
        </Lead>

        <Card tone="white">
          {groups.map((g, gi) => (
            <div key={g.h} style={{ marginBottom: gi === groups.length - 1 ? 0 : 24 }}>
              <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: C.terra, marginBottom: 10 }}>
                {g.h}
              </div>
              {g.items.length ? (
                g.items.map((it, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, marginBottom: 7 }}>
                    <span aria-hidden="true" style={{ color: C.line, flexShrink: 0 }}>—</span>
                    <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 300, lineHeight: 1.6, color: C.body }}>{it}</span>
                  </div>
                ))
              ) : (
                <button type="button" onClick={() => go(g.to)} className="no-print"
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left",
                    fontFamily: SANS, fontSize: 14, fontWeight: 300, fontStyle: "italic",
                    color: C.muted, textDecoration: "underline", minHeight: 44,
                  }}>{g.empty} ergänzen</button>
              )}
            </div>
          ))}
        </Card>

        {openDates.length > 0 && (
          <Card>
            <H3>Was noch offen ist</H3>
            <P style={{ fontSize: 14, marginBottom: 16 }}>
              Diese Date-Ideen habt ihr noch nicht abgehakt. Sucht euch drei aus und tragt sie in den Kalender ein – nicht irgendwann, sondern mit Datum.
            </P>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {openDates.slice(0, 8).map((x, i) => (
                <span key={i} style={{
                  fontFamily: SANS, fontSize: 13, fontWeight: 300, color: C.body,
                  background: C.white, border: `1px solid ${C.line}`, borderRadius: 22, padding: "8px 14px",
                }}>{x.idea}</span>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn small onClick={async () => {
              try {
                await navigator.clipboard.writeText(listText);
                setCopied(true); setTimeout(() => setCopied(false), 1800);
              } catch (e) { setTmp((t) => ({ ...t, copyFail2: true })); }
            }}>
              {copied ? <><Check size={14} /> Kopiert</> : <><Copy size={14} /> Liste kopieren</>}
            </Btn>
            <Btn small variant="ghost" onClick={() => window.print()}>
              <Printer size={14} /> Drucken oder als PDF
            </Btn>
          </div>
          {tmp.copyFail2 && (
            <p style={{ fontFamily: SANS, fontSize: 13, color: C.muted, marginTop: 12, marginBottom: 0 }}>
              Das Kopieren hat euer Browser blockiert. Nutzt stattdessen „Drucken oder als PDF“.
            </p>
          )}
        </Card>

        {filledGroups >= 3 ? (
          <Result title="Was diese Liste wert ist">
            <P>{filledGroups} von {groups.length} Abschnitten sind gefüllt. Das ist mehr, als die meisten Paare je schriftlich festhalten.</P>
            <P>
              Kopiert sie euch beide in die Notizen auf dem Handy. Nicht als Pflicht, sondern als Nachschlagewerk:
              Wenn ihr in drei Monaten nicht wisst, was ihr am Wochenende machen sollt, steht es hier.
              Und wenn es kracht, steht eure Pause-Regel hier – schwarz auf weiß, aus einem Moment, in dem ihr beide ruhig wart.
            </P>
            <P style={{ marginBottom: 0 }}>
              Setzt euch außerdem eine Erinnerung in sechs Monaten. Dann kommt ihr her, lest diese Liste und seht ziemlich genau,
              was ihr davon wirklich gelebt habt.
            </P>
          </Result>
        ) : (
          <Pending>
            Diese Liste füllt sich von selbst, während ihr die anderen Kapitel bearbeitet.
            Sobald drei Abschnitte stehen, findet ihr hier eine Einordnung dazu.
          </Pending>
        )}
      </Steps>
    );
  };

  /* =======================================================
     KAPITEL 16 – BRIEF AN DICH
  ======================================================= */
  const Ch16 = () => (
    <Steps step={step} setStep={setStep} setStepCount={setStepCount} setStepIsIntro={setStepIsIntro}>
      <Lead>
        <>Am Anfang entscheidet man sich einmal füreinander. Danach entscheidet man sich jeden Tag wieder – nur sagt es niemand mehr laut.</>
        <>Dieses letzte Kapitel ist genau dafür da.</>
      </Lead>

      <WhoTabs who={who} setWho={setWho} names={names} />

      <Card tone="white">
        <H3>{names[who]} schreibt an {other(who)}</H3>
        <P style={{ fontSize: 14, marginBottom: 14 }}>
          Warum ich mich heute wieder für dich entscheide. Kein perfekter Text – lieber ein ehrlicher. Schreibt so, wie ihr redet.
        </P>
        <P style={{ fontSize: 14, marginBottom: 10 }}>
          Falls der Anfang schwerfällt: Nimm einen dieser Sätze, schreib ihn ab und mach einfach weiter.
        </P>
        <div style={{ marginBottom: 18 }}>
          {[
            "Was ich dir viel zu selten sage, ist …",
            "Wofür ich dir nie richtig gedankt habe: …",
            "Wenn ich an das letzte Jahr mit dir denke, dann …",
            "Woran ich gemerkt habe, dass du es ernst meinst: …",
          ].map((s) => (
            <div key={s} style={{
              fontFamily: SERIF, fontSize: 17, fontStyle: "italic", lineHeight: 1.5, color: C.body,
              background: C.sand, borderRadius: 10, padding: "10px 14px", marginBottom: 6,
            }}>{s}</div>
          ))}
        </div>
        <textarea rows={12} value={d.letters[who] || ""}
          aria-label={`Brief von ${names[who]} an ${other(who)}`}
          placeholder={`Liebe:r ${other(who)}, …`}
          onChange={(e) => setIn("letters", who, e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box", resize: "vertical",
            fontFamily: SERIF, fontSize: 19, fontWeight: 400, lineHeight: 1.7, color: C.ink,
            background: C.sand, border: `1px solid ${C.line}`, borderRadius: 12,
            padding: "20px 20px", outline: "none",
          }} />
      </Card>

      <Card>
        <Field label="Wann wollt ihr diese Briefe wieder lesen?" optional rows={1}
          hint="Ein Datum reicht. Tragt es euch gleich in den Kalender ein – sonst passiert es nicht."
          placeholder="Zum Beispiel: an unserem Jahrestag"
          value={d.letterDate} onChange={(v) => up((p) => ({ ...p, letterDate: v }))} />
      </Card>

      {!((d.letters.a || "").trim() && (d.letters.b || "").trim()) && (
        <Pending>
          Wenn beide Briefe geschrieben sind, steht hier, wie ihr sie euch am besten gegenseitig gebt –
          und warum es sich lohnt, ein Datum festzulegen, an dem ihr sie noch einmal lest.
        </Pending>
      )}

      {(d.letters.a || "").trim() && (d.letters.b || "").trim() && (
        <Result title="Beide Briefe sind geschrieben">
          <P>Lest sie euch nicht selbst durch. Lest sie euch gegenseitig vor – laut, und ohne zwischendurch zu kommentieren.</P>
          <P style={{ marginBottom: 0 }}>
            {(d.letterDate || "").trim()
              ? `Und dann kommt wieder, wenn es so weit ist: ${d.letterDate.trim()}.`
              : "Und setzt euch ein Datum, an dem ihr sie erneut lest. In einem Jahr klingen diese Zeilen völlig anders."}
          </P>
        </Result>
      )}
    </Steps>
  );

  /* =======================================================
     ABSCHLUSS
  ======================================================= */
  const Ende = () => (
    <div style={{ textAlign: "center", paddingTop: 20 }}>
      <div aria-hidden="true" style={{ color: C.line, fontSize: 17, letterSpacing: 10, marginBottom: 24 }}>✦ ✦ ✦</div>
      <H2>Das war die Reise</H2>
      <p style={{
        fontFamily: SERIF, fontSize: "clamp(20px, 4.8vw, 25px)", fontStyle: "italic",
        lineHeight: 1.55, color: C.ink, maxWidth: 480, margin: "26px auto 30px",
      }}>
        Nicht die Umstände entscheiden über die Qualität einer Beziehung. Entscheidend ist, wie zwei Menschen einander sehen, respektieren und gemeinsam wachsen.
      </p>
      <p style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 300, lineHeight: 1.7, color: C.body, maxWidth: 470, margin: "0 auto 34px" }}>
        Alles bleibt gespeichert. Kommt in ein paar Monaten zurück, lest euer Manifest und schaut, was inzwischen anders ist. Genau dafür ist dieses Journal gemacht.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
        <Btn onClick={() => go(13)}>Zum Manifest</Btn>
        <Btn variant="ghost" onClick={() => go("toc")}>Zur Übersicht</Btn>
      </div>

      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 24, marginBottom: 26 }}>
        <button type="button" onClick={async () => {
          if (!window.confirm("Wirklich alle Antworten löschen? Das lässt sich nicht rückgängig machen.")) return;
          if (!window.confirm("Letzte Sicherheitsfrage: Alle sechzehn Kapitel werden geleert. Fortfahren?")) return;
          try { await store.del(STORAGE_KEY); } catch (e) { /* war nichts da */ }
          window.location.reload();
        }} style={{
          background: "none", border: "none", cursor: "pointer", minHeight: 44,
          fontFamily: SANS, fontSize: 13, color: C.muted,
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          <RotateCcw size={13} aria-hidden="true" /> Alle Antworten zurücksetzen
        </button>
      </div>
      {FinePrint()}
    </div>
  );

  /* =======================================================
     HÜLLE
  ======================================================= */
  const SCREENS = { 1: Ch1, 2: Ch2, 3: Ch3, 4: Ch4, 5: Ch5, 6: Ch6, 7: Ch7, 8: Ch8,
    9: Ch9, 10: Ch10, 11: Ch11, 12: Ch12, 13: Ch13, 14: Ch14, 15: Ch15, 16: Ch16 };
  const meta = typeof screen === "number" ? CH.find((c) => c.id === screen) : null;
  const Body = screen === "welcome" ? Welcome : screen === "toc" ? Toc : screen === "ende" ? Ende : SCREENS[screen];

  return (
    <div style={{ minHeight: "100vh", background: C.paper, paddingBottom: 120 }}>
      {/* Kapitelnavigation */}
      {typeof screen === "number" && (
        <header className="no-print" style={{
          position: "sticky", top: 0, zIndex: 20, background: C.paper,
          borderBottom: `1px solid ${C.line}`, padding: "10px 16px 12px",
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <button type="button" onClick={() => go("toc")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
                  border: `1px solid ${C.line}`, background: C.white, borderRadius: 20,
                  padding: "7px 13px", minHeight: 36, flexShrink: 0,
                  fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: C.body,
                }}>
                <ChevronLeft size={13} color={C.terra} /> Übersicht
              </button>
              <span style={{
                fontFamily: SANS, fontSize: 12.5, fontWeight: 400, color: C.muted,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
              }}>{meta ? meta.title : ""}</span>
              {meta && meta.mode === "erst allein" && !stepIsIntro && (
                <div role="group" aria-label="Person wechseln" style={{
                  display: "flex", flexShrink: 0, border: `1px solid ${C.line}`,
                  borderRadius: 20, overflow: "hidden", background: C.white,
                }}>
                  {["a", "b"].map((k) => (
                    <button key={k} type="button" onClick={() => setWho(k)}
                      aria-pressed={who === k}
                      style={{
                        padding: "7px 13px", minHeight: 36, cursor: "pointer", border: "none",
                        background: who === k ? C.terra : "transparent",
                        color: who === k ? C.white : C.muted,
                        fontFamily: SANS, fontSize: 12.5, fontWeight: 500,
                        maxWidth: 92, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{names[k]}</button>
                  ))}
                </div>
              )}
            </div>
            <nav ref={railRef} aria-label="Kapitel" style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6 }}>
              {CH.map((c) => (
                <button key={c.id} type="button" onClick={() => go(c.id)} data-ch={c.id}
                  aria-label={`Kapitel ${c.id}: ${c.title}`}
                  aria-current={screen === c.id ? "step" : undefined}
                  style={{
                    flexShrink: 0, minWidth: 30, height: 30, borderRadius: 8, cursor: "pointer",
                    border: `1px solid ${screen === c.id ? C.terra : "transparent"}`,
                    background: screen === c.id ? C.terra : chapterFilled(c.id) ? C.taupe : "transparent",
                    color: screen === c.id ? C.white : C.muted,
                    fontFamily: SANS, fontSize: 12, fontWeight: 500, padding: 0,
                  }}>{c.id}</button>
              ))}
            </nav>
            <div style={{ height: 3, background: C.taupe, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: C.terra, transition: "width .35s" }} />
            </div>
          </div>
        </header>
      )}

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 0" }}>
        {meta && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: 2.6, fontWeight: 600, textTransform: "uppercase", color: C.terra }}>
                Kapitel {meta.id}
              </span>
              <Pill tone={meta.mode === "gemeinsam" ? "duo" : "solo"}>{meta.mode}</Pill>
              {meta.ageGap && <Pill tone="gap">Altersunterschied</Pill>}
            </div>
            <H2>{meta.title}</H2>
          </div>
        )}
        {Body()}
      </main>

      {/* Hinweis am Kapitelende */}
      {typeof screen === "number" && step === stepCount - 1 && screen < CH.length && chapterFilled(screen) && (
        <p className="no-print" style={{
          maxWidth: 640, margin: "0 auto", padding: "0 20px",
          fontFamily: SERIF, fontSize: 18, fontStyle: "italic", lineHeight: 1.6,
          color: C.muted, textAlign: "center",
        }}>
          Ein guter Moment, um für heute Schluss zu machen. Redet noch kurz darüber – morgen geht es weiter.
        </p>
      )}

      {/* Navigation – bleibt unten am Bildschirmrand stehen */}
      {screen !== "welcome" && (
        <nav className="no-print" aria-label="Seitennavigation" style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
          background: C.paper, borderTop: `1px solid ${C.line}`,
          padding: "12px 18px calc(12px + env(safe-area-inset-bottom, 0px))",
        }}>
          <div style={{
            maxWidth: 640, margin: "0 auto", display: "flex",
            alignItems: "center", justifyContent: "space-between", gap: 10,
          }}>
            <Btn small variant="quiet" onClick={prev}
              style={{ flexShrink: 0, paddingLeft: 14, paddingRight: 16 }}>
              <ChevronLeft size={15} /> Zurück
            </Btn>
            {screen !== "ende" ? (
              <Btn small onClick={next} style={{ flex: 1, maxWidth: 260 }}>
                {screen === "toc"
                  ? "Kapitel 1"
                  : typeof screen === "number" && step < stepCount - 1
                    ? "Weiter"
                    : screen === CH.length ? "Abschluss" : "Nächstes Kapitel"} <ChevronRight size={15} />
              </Btn>
            ) : <span />}
          </div>
        </nav>
      )}

      {/* Meilenstein */}
      {milestone && (
        <div role="dialog" aria-modal="true" aria-labelledby="ms-t" className="no-print"
          style={{
            position: "fixed", inset: 0, zIndex: 60, background: "rgba(74,59,46,0.42)",
            display: "grid", placeItems: "center", padding: 22,
          }}
          onClick={() => setMilestone(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.paper, borderRadius: 18, padding: "34px 26px 28px",
            maxWidth: 400, width: "100%", textAlign: "center",
          }}>
            <div aria-hidden="true" style={{ color: C.terra, fontSize: 15, letterSpacing: 8, marginBottom: 14 }}>✦</div>
            <h3 id="ms-t" style={{ fontFamily: SERIF, fontSize: 29, fontWeight: 500, color: C.ink, margin: "0 0 14px" }}>
              {milestone.title}
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: C.body, margin: "0 0 24px" }}>
              {milestone.text}
            </p>
            <Btn full onClick={() => setMilestone(null)}>Weiter</Btn>
          </div>
        </div>
      )}

      {/* Speicherhinweis */}
      <div aria-live="polite" className="no-print" style={{
        position: "fixed", bottom: 20, left: "50%",
        transform: `translateX(-50%) translateY(${saved ? "0" : "18px"})`,
        opacity: saved ? 1 : 0, transition: "all .3s", pointerEvents: "none", zIndex: 50,
        background: C.ink, color: C.white, fontFamily: SANS, fontSize: 13, fontWeight: 400,
        padding: "10px 20px", borderRadius: 30, display: "flex", alignItems: "center", gap: 8,
      }}>
        <Check size={14} aria-hidden="true" /> Gespeichert
      </div>
    </div>
  );
}

/* App starten */
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
