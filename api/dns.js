export default async function handler(req) {
  // Đảm bảo link Cloudflare của bạn KHÔNG có dấu "/" ở cuối
  // Ví dụ: https://xxx.cloudflare-gateway.com/dns-query
  const upstream = "https://t1h4yt0a9c.cloudflare-gateway.com/dns-query"; 
  const ecsSubnet = "14.161.0.0"; 

  try {
    const { searchParams } = new URL(req.url);
    const dnsParam = searchParams.get('dns');

    // Chống treo: Nếu truy cập trực tiếp bằng trình duyệt mà không có tham số dns
    if (!dnsParam && req.method === 'GET') {
      return new Response("Vercel DNS Proxy is active!", { status: 200 });
    }

    const response = await fetch(`${upstream}${dnsParam ? `?dns=${dnsParam}` : ''}`, {
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
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
