
export async function onRequest(context) {
  const { request, env } = context;
  
  // For now, return a placeholder response
  // In production, this would integrate with your backend
  return new Response(JSON.stringify({
    error: 'API endpoint not yet configured for static deployment',
    route: 'taxi-meter/location',
    method: request.method
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
}
