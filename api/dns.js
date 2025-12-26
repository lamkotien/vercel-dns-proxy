export default async function handler(req) {
  const upstream = "https://t1h4yt0a9c.cloudflare-gateway.com/dns-query"; // Thay link của bạn
  const ecsSubnet = "14.161.0.0"; // IP VNPT HCM

  try {
    const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
    const dnsParam = searchParams.get('dns');

    if (req.method === 'GET' && !dnsParam) {
      return new Response("Vercel DNS Proxy is active!", { status: 200 });
    }

    const fetchUrl = dnsParam ? `${upstream}?dns=${dnsParam}` : upstream;
    
    const response = await fetch(fetchUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/dns-message',
        'X-Forwarded-For': ecsSubnet,
        ...(req.method === 'POST' && { 'Content-Type': 'application/dns-message' })
      },
      body: req.method === 'POST' ? await req.arrayBuffer() : null
    });

    return new Response(await response.arrayBuffer(), {
      headers: { 'Content-Type': 'application/dns-message' }
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
