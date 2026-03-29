/**
 * CF-Clash-Aggregator Cloudflare Worker
 * This worker acts as a proxy aggregator. It fetches raw proxy URLs
 * and merges them using a reliable free subconverter API.
 */

const SUBCONVERTER_API = "https://sub.xeton.dev/sub"; 

// A smaller random subset is provided per request to avoid "414 URI Too Long" or "400 Bad Request"
// from the subconverter's load balancer.
const DEFAULT_SOURCES = [
  "https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/clash.yml",
  "https://raw.githubusercontent.com/mfuu/v2ray/master/clash.yaml",
  "https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list.yml",
  "https://raw.githubusercontent.com/lagzian/SS-Collector/main/mix_clash.yaml",
  "https://raw.githubusercontent.com/Anaer/Sub/main/clash.yaml"
];

function getRandomSubset(arr, n) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("CF-Clash-Aggregator Worker is Running!\n\nPlease configure your Clash/v2ray client with:\n" + url.origin + "/subscribe", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (url.pathname === "/subscribe" || url.pathname === "/proxies.yaml") {
      const cacheUrl = new URL(url);
      const cacheKey = new Request(cacheUrl.toString(), request);
      const cache = caches.default;
      
      let response = await cache.match(cacheKey);

      if (!response) {
        // 智能客户端检测：通过 User-Agent 或 URL 参数决定下发格式
        let target = "clash";
        const queryTarget = url.searchParams.get("target");
        const ua = (request.headers.get("User-Agent") || "").toLowerCase();
        
        if (queryTarget) {
          target = queryTarget;
        } else if (ua.includes("v2ray") || ua.includes("v2rayn")) {
          target = "v2ray";
        } else if (ua.includes("surge")) {
          target = "surge&ver=4";
        } else if (ua.includes("surfboard")) {
          target = "surfboard";
        }

        // 动态配置保底的 fallback，防止主转换器挂掉导致全平台断网
        let fallbackUrl = "https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/clash.yml";
        if (target === "v2ray") {
           fallbackUrl = "https://raw.githubusercontent.com/yebekhe/TelegramV2rayCollector/main/sub/base64/mix";
        }

        try {
          // Select 3 random sources to avoid URL Too Long errors on backend
          const sources = getRandomSubset(DEFAULT_SOURCES, 3).join("|");
          const queryUrl = `${SUBCONVERTER_API}?target=${target}&url=${encodeURIComponent(sources)}&insert=false`;

          console.log("Fetching from Subconverter:", queryUrl);
          
          let proxyResponse = await fetch(queryUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
            }
          });

          if (!proxyResponse.ok) {
            // Attempt fallback to raw file if subconverter totally fails
            proxyResponse = await fetch(fallbackUrl);
          }

          const responseText = await proxyResponse.text();

          // Subconverter sometimes returns a text like "No nodes were found"
          if (responseText.includes("No nodes were found")) {
            throw new Error("Subconverter failed to parse nodes from the sources.");
          }

          // 如果是 v2ray 配置通常是 Base64 字符串，不需要 text/yaml 头
          const contentType = target === "clash" ? "text/yaml; charset=utf-8" : "text/plain; charset=utf-8";

          response = new Response(responseText, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "s-maxage=1800", // Cache for 30 minutes
            },
          });

          ctx.waitUntil(cache.put(cacheKey, response.clone()));
          
        } catch (err) {
          // Final fallback
          console.error(err);
          const fallbackResponse = await fetch(fallbackUrl);
          const contentType = target === "clash" ? "text/yaml; charset=utf-8" : "text/plain; charset=utf-8";

          response = new Response(await fallbackResponse.text(), {
            status: 200,
            headers: {
               "Content-Type": contentType,
               "Cache-Control": "s-maxage=1800",
            }
          });
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
      }

      return response;
    }

    return new Response("Not Found", { status: 404 });
  },
};
