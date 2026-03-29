/**
 * BestClash Cloudflare Worker
 * This worker acts as a proxy aggregator. It fetches all the raw/base64 proxy URLs
 * from standard sources, and merges them using a free subconverter API.
 * This completely eliminates the need for maintaining a separate backend or secret PROXIES_URL.
 */

// This subconverter converts raw proxy strings/base64 lists/clash yamls into one unified clash config.
// Alternative backends you can use: https://sub.xeton.dev/sub, https://api.v1.mk/sub
const SUBCONVERTER_API = "https://sub.v1.mk/sub"; 

// List of all proxy sources to aggregate
const DEFAULT_SOURCES = [
  "https://cdn.jsdelivr.net/gh/vxiaov/free_proxies@main/clash/clash.provider.yaml",
  "https://freenode.openrunner.net/uploads/20240807-clash.yaml",
  "https://raw.githubusercontent.com/Misaka-blog/chromego_merge/main/sub/merged_proxies_new.yaml",
  "https://raw.githubusercontent.com/MrMohebi/xray-proxy-grabber-telegram/master/collected-proxies/clash-meta/all.yaml",
  "https://raw.githubusercontent.com/NiceVPN123/NiceVPN/main/Clash.yaml",
  "https://raw.githubusercontent.com/aiboboxx/clashfree/main/clash.yml",
  "https://raw.githubusercontent.com/anaer/Sub/main/clash.yaml",
  "https://raw.githubusercontent.com/chengaopan/AutoMergePublicNodes/master/list.yml",
  "https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/clash.yml",
  "https://raw.githubusercontent.com/ermaozi01/free_clash_vpn/main/subscribe/clash.yml",
  "https://raw.githubusercontent.com/lagzian/SS-Collector/main/mix_clash.yaml",
  "https://raw.githubusercontent.com/mahdibland/ShadowsocksAggregator/master/Eternity.yml",
  "https://raw.githubusercontent.com/mfuu/v2ray/master/clash.yaml",
  "https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list.yml",
  "https://raw.githubusercontent.com/ronghuaxueleng/get_v2/main/pub/combine.yaml",
  "https://raw.githubusercontent.com/ts-sf/fly/main/clash",
  "https://raw.githubusercontent.com/yaney01/Yaney01/main/temporary",
  "https://raw.githubusercontent.com/yebekhe/TelegramV2rayCollector/main/sub/base64/mix",
  "https://raw.githubusercontent.com/zhangkaiitugithub/passcro/main/speednodes.yaml",
  "https://tt.vg/freeclash"
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Provide a simple status page
    if (url.pathname === "/") {
      return new Response("BestClash Worker Running! \nUse /subscribe to get your Clash proxies.", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (url.pathname === "/subscribe" || url.pathname === "/proxies.yaml") {
      // Create cache key
      const cacheUrl = new URL(url);
      const cacheKey = new Request(cacheUrl.toString(), request);
      const cache = caches.default;
      
      // Look in cache first
      let response = await cache.match(cacheKey);

      if (!response) {
        try {
          // If we hit a miss, aggressively compile the target via subconverter
          // target=clash indicates we want a clash configuration
          // insert=false indicates we just want nodes, or let subconverter handle standard rules.
          const sources = DEFAULT_SOURCES.join("|");
          const queryUrl = `${SUBCONVERTER_API}?target=clash&url=${encodeURIComponent(sources)}&insert=false`;

          console.log("Fetching freshly aggregated proxies from:", queryUrl);
          
          let proxyResponse = await fetch(queryUrl, {
            headers: {
              "User-Agent": "BestClash Worker Aggregator/1.0"
            }
          });

          if (!proxyResponse.ok) {
            throw new Error(`Subconverter failed with status: ${proxyResponse.status}`);
          }

          const responseText = await proxyResponse.text();

          response = new Response(responseText, {
            status: 200,
            headers: {
              "Content-Type": "text/yaml; charset=utf-8",
              "Cache-Control": "s-maxage=1800", // Cache at the Edge for 30 minutes
            },
          });

          // Cache the response
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
          
        } catch (err) {
          return new Response(`Error aggregating proxies: ${err.message}`, { status: 500 });
        }
      }

      return response;
    }

    return new Response("Not Found", { status: 404 });
  },
};
