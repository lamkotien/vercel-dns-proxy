export default async function handler(req) {
  const upstream = "https://t1h4yt0a9c.cloudflare-gateway.com/dns-query"; // LINK CỦA BẠN
  const ecsSubnet = "14.161.0.0"; 

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const fullUrl = new URL(req.url, `${protocol}://${req.headers.host}`);
    const dnsParam = fullUrl.searchParams.get('dns');

    // CẢI TIẾN: Trả về mã 200 kèm Content-Type đúng để ADG không báo lỗi khi Test
    if (req.method === 'GET' && !dnsParam) {
      return new Response("Vercel DNS Proxy is active!", { 
        status: 200,
        headers: { 'Content-Type': 'application/dns-message' } 
      });
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

export const config = { runtime: 'edge' };
