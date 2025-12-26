export default async function handler(req) {
  const upstream = "https://t1h4yt0a9c.cloudflare-gateway.com/dns-query"; // THAY LINK CỦA BẠN
  const ecsSubnet = "14.161.0.0"; // IP VNPT HCM (hoặc IP của bạn)

  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const method = req.method;

  let fetchUrl = `${upstream}${url.search}`;

  const headers = {
    'Accept': 'application/dns-message',
    'X-Forwarded-For': ecsSubnet
  };

  let options = { method, headers };

  if (method === 'POST') {
    options.body = await req.arrayBuffer();
    headers['Content-Type'] = 'application/dns-message';
  }

  const response = await fetch(fetchUrl, options);
  return new Response(await response.arrayBuffer(), {
    headers: { 'Content-Type': 'application/dns-message' }
  });
}
