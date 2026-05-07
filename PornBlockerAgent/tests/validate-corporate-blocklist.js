const { getCorporateNetworkDomains } = require('../system/corporate-network-blocklist');
const domains = new Set(getCorporateNetworkDomains());

const tests = [
  // Ad networks that fund/advertise porn
  { domain: 'trafficjunky.com',   expected: true,  label: 'TrafficJunky (Aylo ad network)' },
  { domain: 'trafficjunky.net',   expected: true,  label: 'TrafficJunky CDN' },
  { domain: 'trafficfactory.biz', expected: true,  label: 'Traffic Factory (WGCZ ad network)' },
  { domain: 'exoclick.com',       expected: true,  label: 'ExoClick (ad network)' },
  { domain: 'magsrv.com',         expected: true,  label: 'ExoClick serving domain' },
  { domain: 'juicyads.com',       expected: true,  label: 'JuicyAds (ad network)' },
  { domain: 'trafficstars.com',   expected: true,  label: 'TrafficStars (ad network)' },
  { domain: 'eroadvertising.com', expected: true,  label: 'EroAdvertising' },
  { domain: 'crakrevenue.com',    expected: true,  label: 'CrakRevenue (affiliate)' },
  { domain: 'adxpansion.com',     expected: true,  label: 'AdXpansion (ad network)' },
  { domain: 'plugrush.com',       expected: true,  label: 'PlugRush (traffic exchange)' },
  // Conglomerates
  { domain: 'pornhub.com',        expected: true,  label: 'Pornhub (Aylo)' },
  { domain: 'mindgeek.com',       expected: true,  label: 'MindGeek/Aylo corporate' },
  { domain: 'xvideos.com',        expected: true,  label: 'XVideos (WGCZ)' },
  { domain: 'xnxx.com',           expected: true,  label: 'XNXX (WGCZ)' },
  { domain: 'xhamster.com',       expected: true,  label: 'xHamster (NKL)' },
  { domain: 'chaturbate.com',     expected: true,  label: 'Chaturbate (cam)' },
  { domain: 'livejasmin.com',     expected: true,  label: 'LiveJasmin (cam)' },
  { domain: 'awempire.com',       expected: true,  label: 'AWEmpire (LiveJasmin affiliate)' },
  { domain: 'ccbill.com',         expected: true,  label: 'CCBill (adult billing)' },
  // Safe sites - must NOT be in the list
  { domain: 'google.com',         expected: false, label: 'Google (safe)' },
  { domain: 'bing.com',           expected: false, label: 'Bing (safe)' },
  { domain: 'bible.com',          expected: false, label: 'Bible.com (safe)' },
  { domain: 'youtube.com',        expected: false, label: 'YouTube (safe)' },
];

let pass = 0; let fail = 0;
for (const t of tests) {
  const blocked = domains.has(t.domain);
  const ok = blocked === t.expected;
  const status = ok ? 'PASS' : 'FAIL';
  console.log(status + ' | ' + t.label + ' (' + t.domain + ') => blocked:' + blocked);
  ok ? pass++ : fail++;
}
console.log('');
console.log('Results: ' + pass + '/' + tests.length + ' PASS  ' + fail + ' FAIL');
console.log('Total corporate network domains in blocklist: ' + domains.size);
