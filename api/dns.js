export default async function handler(req) {
  // THAY LINK DOH CỦA BẠN VÀO ĐÂY
  const upstream = "https://t1h4yt0a9c.cloudflare-gateway.com/dns-query"; 
  const ecsSubnet = "14.161.0.0"; // IP VNPT HCM

  try {
    // Sửa lỗi Invalid URL bằng cách cung cấp base URL
    const url = new URL(req.url, `https://${req.headers.host}`);
    const dnsParam = url.searchParams.get('dns');

    // Nếu vào trực tiếp bằng trình duyệt (không có dns param)
    if (req.method === 'GET' && !dnsParam) {
      return new Response("Vercel DNS Proxy is active!", { status: 200 });
    }

    // Tạo URL gửi tới Cloudflare
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
