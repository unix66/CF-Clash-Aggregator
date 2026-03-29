# 🚀CF-Clash-Aggregator (Cloudflare Worker 版)

🐱免费Clash代理聚合器！无需服务器，**一键部署到 Cloudflare**，在边缘节点自动从网上并发爬取十几个提供商的免费代理，内置 Subconverter 协议转换过滤，实时输出最新可用节点，开箱即用！

## 一键部署

您可以点击下方按钮，直接在浏览器中将此项目一键部署到您的 Cloudflare 账户中（完全免费）：

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/facl/CF-Clash-Aggregator)

### 本地终端发版流程（如果使用代码仓库拉取）

1. 全局安装 Cloudflare 的 Wrangler 工具：
   ```bash
   npm install -g wrangler
   ```
2. 登录您的 Cloudflare 账户：
   ```bash
   wrangler login
   ```
3. 在项目根目录（有 `wrangler.toml` 的地方）运行部署：
   ```bash
   wrangler deploy
   ```

---

# 您的专属订阅地址

无论是一键部署还是本地发布，成功后 Cloudflare 都会分配给您一个专属域名，例如：
`https://cf-clash-aggregator.<YOUR_SUBDOMAIN>.workers.dev`

**请打开您的 Clash 客户端，将以下路径添加为您的节点订阅地址即可：**

```text
https://cf-clash-aggregator.<YOUR_SUBDOMAIN>.workers.dev/subscribe
```

*（注：Worker 采用边缘缓存机制，为了避免请求频繁被封锁，每次聚合结果会在节点缓存 30 分钟。）*

---

# 使用方法（安卓）

1. 下载安装 [Clash Meta for Android](https://github.com/MetaCubeX/ClashMetaForAndroid/releases)
   > 如果外网下载慢，可以点[这里](https://ghfile.geekertao.top/https://github.com/MetaCubeX/ClashMetaForAndroid/releases/download/v2.11.7/cmfa-2.11.7-meta-universal-release.apk)从国内镜像下载。
2. 在应用配置里，新建 / 添加远程订阅，填入您在上面生成的那个带 `/subscribe` 后缀的链接就行了。

---

# 鸣谢

感谢原作者收集的以下所有代理爬虫和源地址。本次升级将原静态托管架构重构为了强大的 Serverless 无服务器架构，项目更名为 CF-Clash-Aggregator，为您提供实时聚合能力：

```
https://cdn.jsdelivr.net/gh/vxiaov/free_proxies@main/clash/clash.provider.yaml
https://freenode.openrunner.net/uploads/20240807-clash.yaml
https://raw.githubusercontent.com/Misaka-blog/chromego_merge/main/sub/merged_proxies_new.yaml
https://raw.githubusercontent.com/MrMohebi/xray-proxy-grabber-telegram/master/collected-proxies/clash-meta/all.yaml
https://raw.githubusercontent.com/NiceVPN123/NiceVPN/main/Clash.yaml
https://raw.githubusercontent.com/aiboboxx/clashfree/main/clash.yml
https://raw.githubusercontent.com/anaer/Sub/main/clash.yaml
https://raw.githubusercontent.com/chengaopan/AutoMergePublicNodes/master/list.yml
https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/clash.yml
https://raw.githubusercontent.com/ermaozi01/free_clash_vpn/main/subscribe/clash.yml
https://raw.githubusercontent.com/lagzian/SS-Collector/main/mix_clash.yaml
https://raw.githubusercontent.com/mahdibland/ShadowsocksAggregator/master/Eternity.yml
https://raw.githubusercontent.com/mfuu/v2ray/master/clash.yaml
https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list.yml
https://raw.githubusercontent.com/ronghuaxueleng/get_v2/main/pub/combine.yaml
https://raw.githubusercontent.com/ts-sf/fly/main/clash
https://raw.githubusercontent.com/yaney01/Yaney01/main/temporary
https://raw.githubusercontent.com/yebekhe/TelegramV2rayCollector/main/sub/base64/mix
https://raw.githubusercontent.com/zhangkaiitugithub/passcro/main/speednodes.yaml
https://tt.vg/freeclash
```
