export default async function handler(req) {
  // QUAN TRỌNG: Thay link dưới đây bằng link DoH của bạn từ Cloudflare Dashboard
  const upstream = "https://t1h4yt0a9c.cloudflare-gateway.com/dns-query"; 
  
  // IP VNPT Sài Gòn để tối ưu node mạng
  const ecsSubnet = "14.161.0.0"; 

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const dnsParam = searchParams.get('dns');

    if (req.method === 'GET' && dnsParam) {
      const response = await fetch(`${upstream}?dns=${dnsParam}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/dns-message',
          'X-Forwarded-For': ecsSubnet
        }
      });
      return new Response(await response.arrayBuffer(), {
        headers: { 'Content-Type': 'application/dns-message' }
      });
    }

    if (req.method === 'POST') {
      const body = await req.arrayBuffer();
      const response = await fetch(upstream, {
        method: 'POST',
        headers: {
          'Accept': 'application/dns-message',
          'Content-Type': 'application/dns-message',
          'X-Forwarded-For': ecsSubnet
        },
        body: body
      });
      return new Response(await response.arrayBuffer(), {
        headers: { 'Content-Type': 'application/dns-message' }
      });
    }

    return new Response("Vercel DNS Proxy is running. Please use DoH clients.", { status: 200 });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
