/**
 * Corporate Porn Network Blocklist
 * 
 * This file enumerates every known domain controlled by, affiliated with, or
 * used as advertising/traffic infrastructure for the major pornographic content
 * conglomerates. Blocking these shuts down:
 *   1. The content sites themselves
 *   2. The ad networks that fund them
 *   3. The affiliate/traffic brokers that promote them
 *   4. The CDN/tracking pixels they use to follow users
 *   5. The cross-site promotion networks that link them together
 *
 * Sources: Wikipedia, corporate filings, investigative journalism,
 * community blocklist projects, and network analysis.
 *
 * Last reviewed: 2025-05
 */

const CORPORATE_NETWORK_DOMAINS = [

    // =========================================================================
    // AYLO / MINDGEEK CONGLOMERATE
    // The world's largest adult content company. Owns the tube sites, studios,
    // billing infrastructure, and TrafficJunky (the largest adult ad network).
    // =========================================================================

    // -- Tube / Free Platforms --
    'pornhub.com',
    'pornhub.org',
    'pornhubpremium.com',
    'ph.xxx',
    'youporn.com',
    'redtube.com',
    'redtube.com.br',
    'tube8.com',
    'tube8.es',
    'tube8.fr',
    'xtube.com',
    'thumbzilla.com',
    'gaytube.com',
    'peeperz.com',
    'porniq.com',
    'pornmd.com',

    // -- Production Studios --
    'brazzers.com',
    'brazzersmobileapp.com',
    'realitykings.com',
    'mofos.com',
    'twistys.com',
    'babes.com',
    'men.com',
    'seancody.com',
    'digitalplayground.com',
    'transangels.com',
    'whynotbi.com',
    'mydirtyhobby.com',
    'fakehub.com',
    'wankzvr.com',

    // -- Aylo Corporate Domains --
    'aylo.com',
    'mindgeek.com',
    'mgfreesites.com',
    'mgpremiumfreesites.com',
    'mgcash.com',
    'pornhubcash.com',
    'mgbilling.com',
    'aylobilling.com',

    // -- TrafficJunky (Aylo's ad network - the #1 adult ad broker) --
    // Responsible for serving billions of ad impressions on adult sites
    'trafficjunky.com',
    'trafficjunky.net',
    'ads.trafficjunky.net',
    'static.trafficjunky.net',
    'tj.vc',
    'tjsrv.com',

    // -- Nutaku (Aylo's adult gaming platform) --
    'nutaku.net',
    'nutaku.com',

    // =========================================================================
    // WGCZ HOLDING (WebGroup Czech Republic)
    // Czech conglomerate controlling xvideos, xnxx, bangbros, penthouse,
    // private media, and Traffic Factory (their ad brokerage network).
    // =========================================================================

    // -- Core Platforms --
    'xvideos.com',
    'xvideos.es',
    'xvideos2.com',
    'xvideos3.com',
    'xv-cdn.com',         // xvideos CDN
    'xv-st.com',          // xvideos static
    'xnxx.com',
    'xnxx-cdn.com',
    'xnxx2.com',

    // -- BangBros Network --
    'bangbros.com',
    'bangbros18.com',
    'bangbus.com',
    'assparade.com',
    'milflessonspov.com',
    '8thstreetlatinas.com',
    'milfhunter.com',
    'collegefuckfest.com',
    'backroomcastingcouch.com',
    'mrdoublenaughty.com',
    'naughtyamerica.com',   // affiliated via content agreements
    'bravoteens.com',
    'allanalpass.com',
    'pornprosnetwork.com',

    // -- Penthouse (WGCZ) --
    'penthouse.com',
    'penthousegold.com',
    'penthouseworld.com',

    // -- Private Media Group (WGCZ) --
    'private.com',
    'privateblack.com',
    'privatesexmovies.com',

    // -- DDF Network --
    'ddfnetwork.com',
    'ddfbusty.com',
    'girlfriendsfilms.com', // acquired

    // -- Legal Porno (WGCZ stake) --
    'legalporno.com',

    // -- Erogames (WGCZ) --
    'erogames.com',
    'erogames.world',

    // -- Traffic Factory (WGCZ's ad network - primary broker for xvideos/xnxx) --
    'trafficfactory.biz',
    'trafficfactory.com',
    'trafic-factory.com',
    'traffic-factory.biz',
    'ads.trafficfactory.biz',
    'trafficfac.com',

    // =========================================================================
    // NKL TECHNOLOGIES / HAMMY MEDIA — xHamster Network
    // =========================================================================

    'xhamster.com',
    'xhamster.desi',
    'xhamster1.com',
    'xhamster2.com',
    'xhamster3.com',
    'xhamster4.com',
    'xhamster5.com',
    'xhamster6.com',
    'xhamster7.com',
    'xhamster8.com',
    'xhamster9.com',
    'xhamster10.com',
    'xhamster11.com',
    'xhamster12.com',
    'xhamster13.com',
    'xhamster14.com',
    'xhamster15.com',
    'xhamster16.com',
    'ham-cdn.com',         // xhamster CDN
    'fux.com',            // xHamster sister site
    'empflix.com',
    'tnaflix.com',         // NKL-affiliated tube
    'gotporn.com',

    // =========================================================================
    // ADULTFORCE / EPOCH / NATS — Billing & Affiliate Infrastructure
    // Payment processing and affiliate management used industry-wide
    // =========================================================================

    'adultforce.com',
    'epoch.com',           // dominant adult payment processor
    'ccbill.com',          // 2nd largest adult payment processor
    'ccbill.net',
    'webbilling.com',
    'segpay.com',          // adult payment processor
    'verotel.com',         // EU adult payment processor
    'paymente.com',
    'nats.com',            // network affiliate tracking system
    'natscash.com',
    'paxum.com',           // adult performer payment network

    // =========================================================================
    // ADULT AD NETWORKS
    // These are the primary advertising networks that:
    //  - Take money from mainstream advertisers
    //  - Serve those ads on porn sites (and porn ads everywhere else)
    //  - Drive traffic between adult properties
    // Blocking these removes the funding mechanism and cross-promotion.
    // =========================================================================

    // -- ExoClick (major adult ad network, Barcelona) --
    'exoclick.com',
    'exoclick.net',
    'static.exoclick.com',
    'admin.exoclick.com',
    'ads.exoclick.com',
    'magsrv.com',           // ExoClick ad serving domain
    'pemsrv.com',           // ExoClick ad serving domain
    'camsrv.com',
    'a.adsrv.eacdn.com',
    'eacdn.com',            // ExoClick CDN

    // -- JuicyAds (adult ad network) --
    'juicyads.com',
    'juicyads.net',
    'ads.juicyads.com',
    'static.juicyads.com',
    'track.juicyads.com',
    'syndication.juicyads.com',

    // -- TrafficStars (adult ad network) --
    'trafficstars.com',
    'static.trafficstars.com',
    'track.trafficstars.com',
    'api.trafficstars.com',
    'a.trafficstars.com',

    // -- EroAdvertising (adult ad network) --
    'eroadvertising.com',
    'ero-advertising.com',
    'eroadv.com',
    'ads.eroadvertising.com',
    'cdn.eroadvertising.com',

    // -- AdXpansion (adult ad network) --
    'adxpansion.com',
    'ads.adxpansion.com',
    'serv.adxpansion.com',
    'cdn.adxpansion.com',

    // -- PlugRush (adult ad / traffic exchange) --
    'plugrush.com',
    'ads.plugrush.com',
    'cdn.plugrush.com',
    'rt.plugrush.com',

    // -- EroMedia / Reporo (adult ad network) --
    'reporo.com',
    'reporo.net',
    'eromedia.com',
    'eroadnetwork.com',

    // -- EngagedTraffic / Rebel Ai --
    'engagedtraffic.com',

    // -- PopMyAds (adult pop-under network) --
    'popmyads.com',
    'popads.net',       // used heavily for adult traffic
    'popads.me',
    'pop.deliver.ifmatcher.com',

    // -- TrafficHunt --
    'traffichunt.com',

    // -- HilltopAds (adult mixed network) --
    'hilltopads.com',
    'hilltopads.net',

    // -- ClickAdilla (adult ad network) --
    'clickadilla.com',
    'clickadilla.net',

    // =========================================================================
    // AFFILIATE / TRAFFIC BROKER NETWORKS
    // These networks pay webmasters commissions to drive users to porn sites.
    // They run banners, link farms, and redirect pages across the open web.
    // =========================================================================

    // -- CrakRevenue (largest adult affiliate network) --
    'crakrevenue.com',
    'crakrevenue.net',
    'crak.com',
    'crakmedia.com',
    'track.crakrevenue.com',

    // -- AWEmpire / LiveJasmin affiliate --
    'awempire.com',
    'awaps.net',
    'awe.sm',
    'webcams.awempire.com',

    // -- Paxum affiliate tracking --
    'paxum.net',

    // -- AdultEmpireAffiliates / GameLink --
    'adultempire.com',
    'adultempireaffiliates.com',
    'gamelink.com',

    // -- Rabbit's Reviews / FameDollars --
    'famedollars.com',
    'rabbitscash.com',

    // -- SexPanther Affiliate --
    'sexpanther.com',

    // -- Fubar Cash --
    'fubarcash.com',

    // -- EroAds / Ero-Advertising affiliate --
    'eroads.com',

    // -- AdultFriendFinder Affiliate Network (Friendfinder Networks) --
    'adultfriendfinder.com',
    'ffn.com',
    'friendfindernetworks.com',
    'friendfindernetworks.com',
    'adultfriendfinder.net',
    'ffnstatic.com',            // AFF CDN/static assets
    'amigos.com',
    'asiafriendfinder.com',
    'bigchurch.com',
    'friendfinder.com',
    'seniorfriendfinder.com',
    'alt.com',                  // FriendFinder BDSM property
    'outpersonals.com',

    // =========================================================================
    // MAJOR INDEPENDENT TUBE SITES
    // Large independent platforms not under the above conglomerates
    // =========================================================================

    'spankbang.com',
    'spankbang.cc',
    'eporner.com',
    'beeg.com',
    'beeg.xxx',
    'drtuber.com',
    'pornoxo.com',
    'hardsextube.com',
    'hdzog.com',
    'tnaflix.com',
    'porntrex.com',
    'proporn.com',
    'anyporn.com',
    'txxx.com',
    'hclips.com',
    'hdzog.com',
    'vjav.com',
    'javmost.com',
    'javhd.com',
    'javfree.me',
    'javbus.com',
    'javlib.com',
    'porndig.com',
    'tubegalore.com',
    'fapdu.com',
    'pornone.com',
    'xmoviesforyou.com',
    'fullpornnetwork.com',
    'ashemaletube.com',
    'shemalestube.com',
    'trannytube.tv',
    'fuq.com',
    'iceporn.com',
    'yespornplease.com',
    'yes-porn-please.com',
    'pornzog.com',
    'sexu.com',
    'wetplace.com',
    'youjizz.com',
    'jizzhut.com',
    'jizzbo.com',
    'slutload.com',
    'slutty.xxx',
    'adultdvdempire.com',
    'aebn.com',             // Adult Entertainment Broadcast Network
    'aebn.net',
    'naughtyamerica.com',
    'naughtyamericavr.com',
    'naughtyamerica.tv',

    // =========================================================================
    // LIVE CAM NETWORKS
    // Cam sites that also operate as advertising platforms routing to porn
    // =========================================================================

    'livejasmin.com',
    'livejasmin.net',
    'jasmin.com',
    'streamate.com',
    'streamatemodels.com',
    'streamate.net',
    'chaturbate.com',
    'chaturbate.net',
    'bongacams.com',
    'bongamodels.com',
    'bonga.com',
    'myfreecams.com',
    'mfc100.com',           // MFC CDN
    'camsoda.com',
    'stripchat.com',
    'stripchat.net',
    'cam4.com',
    'cam4.net',
    'camonster.com',
    'camster.com',
    'imlive.com',
    'flirt4free.com',
    'flirt4free.net',
    'dirtyroulette.com',
    'xcams.com',
    'xlovecam.com',
    'cams.com',
    'bigcams.com',
    'camcontacts.com',
    'flingster.com',

    // =========================================================================
    // REDDIT ADULT COMMUNITIES - MEDIA CDN DOMAINS
    // (Reddit itself is allowed, but these CDNs serve adult image/video content
    //  specifically from adult subreddits)
    // =========================================================================

    'i.redd.it',
    'v.redd.it',
    'preview.redd.it',
    'redditmedia.com',
    'redditstatic.com',   // Only block if desired - contains all static assets

    // =========================================================================
    // DATING SITES THAT CROSS-PROMOTE / ADVERTISE PORN
    // These sites run ad networks that funnel users to pornographic content
    // =========================================================================

    'fling.com',
    'sexsearch.com',
    'fuckbook.com',
    'fuckswipe.com',
    'hookup.com',
    'instabang.com',
    'icupid.com',
    'passiondesire.com',
    'passion.com',
    'socialsex.com',
    'together2night.com',
    'besthookupwebsites.com',
    'nostringsattached.com',
    'benaughty.com',
    'iamnaughty.com',
    'sexmessenger.com',

    // =========================================================================
    // CROSS-PROMOTION & TRAFFIC EXCHANGE INFRASTRUCTURE
    // Redirect domains, URL shorteners, and traffic rotation systems
    // exclusively or primarily used in the adult industry
    // =========================================================================

    'ptraff.com',
    'adultdeeplink.com',
    'trafficrouter.com',
    'traffichaus.com',
    'trafficmaxx.com',
    'xxxbunker.com',
    'xxxjapantv.com',
    'ixl.msn.com',          // adult ad server for banner rotation
    'ero-video.net',
    'adult-traffic.net',
    'adulttraffic.com',
    'sextraffic.com',
    'hornymatch.com',        // spam/traffic redirect
    'sexad.net',
    'adultads.com',
    'xxxtoolbar.com',
    'xxxcounter.com',
    'imagebam.com',          // image host used heavily for adult content promotion
    'imgchili.net',
    'imgbox.com',
    'imgsrc.ru',
    'turboimagehost.com',
    'postimg.cc',
    'imgadult.com',

    // =========================================================================
    // ESCORT / SOLICITATION NETWORKS
    // Not directly porn but cross-promote content and funnel to adult material
    // =========================================================================

    'eros.com',
    'privatedelights.ch',
    'slixa.com',
    'listcrawler.com',
    'skipthegames.com',
    'leolist.cc',
    'tryst.link',

    // =========================================================================
    // CONTENT DISTRIBUTION & AGGREGATION SITES
    // Sites that aggregate, mirror, or link to porn to earn referral revenue
    // =========================================================================

    'pornhd.com',
    'pornhd3x.com',
    'hdpornos.net',
    'pornstartube.net',
    'pornstarworld.xxx',
    'rabbitsreviews.com',
    'aebn.net',
    'peekvids.com',
    'sexvid.xxx',
    'xxx.com',
    'adult.com',
    'sex.com',
    'pornbb.org',           // porn link/discussion aggregator
    'adultboard.cc',
    'empornium.me',
    'piratebay-porn.com',

];

/**
 * Returns the full list of corporate network domains to block.
 * Deduplicated and lowercased.
 * @returns {string[]}
 */
function getCorporateNetworkDomains() {
    return [...new Set(CORPORATE_NETWORK_DOMAINS.map(d => d.toLowerCase().trim()))];
}

module.exports = { getCorporateNetworkDomains };
