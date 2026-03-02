import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para manejar el proxy de las solicitudes API
 * Redirige todas las solicitudes que comienzan con /api/* al backend real
 * Esto soluciona problemas de CORS en desarrollo y producción
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Solo procesar rutas que comienzan con /api/
  if (pathname.startsWith('/api/')) {
    try {
      // Obtener la URL del backend desde variables de entorno
      const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
      
      // Construir la URL del backend
      // Mantener el path completo ya que el backend también usa /api como prefijo
      const targetUrl = `${backendUrl}${pathname}${search}`;

      console.log(`[Middleware] Proxying: ${pathname} -> ${targetUrl}`);

      // Crear headers para el backend
      const headers = new Headers();
      
      // Copiar headers relevantes de la solicitud original
      request.headers.forEach((value, key) => {
        // Excluir headers que no deben ser reenviados
        if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
          headers.set(key, value);
        }
      });

      // Agregar headers adicionales si es necesario
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      headers.set('X-Forwarded-For', forwarded || realIp || 'unknown');
      headers.set('X-Forwarded-Host', request.headers.get('host') || 'unknown');
      headers.set('X-Forwarded-Proto', request.nextUrl.protocol.replace(':', ''));

      // Preparar opciones de fetch
      const fetchOptions: RequestInit = {
        method: request.method,
        headers: headers,
      };

      // Si la solicitud tiene body (POST, PUT, PATCH), incluirlo
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
          // Intentar leer el body
          const body = await request.arrayBuffer();
          if (body.byteLength > 0) {
            fetchOptions.body = body;
          }
        } catch (error) {
          console.error('[Middleware] Error reading request body:', error);
        }
      }

      console.log(`[Middleware] Fetch options:`, {
        targetUrl,
        method: fetchOptions.method,
        headers: Object.fromEntries(headers.entries()),
        hasBody: !!fetchOptions.body,
      });

      // Hacer la solicitud al backend
      const backendResponse = await fetch(targetUrl, fetchOptions);

      console.log(`[Middleware] Backend response: ${backendResponse.status} ${backendResponse.statusText}`);

      // Crear la respuesta con los datos del backend
      const responseHeaders = new Headers();
      
      // Copiar headers de la respuesta del backend
      backendResponse.headers.forEach((value, key) => {
        responseHeaders.set(key, value);
      });

      // Agregar headers CORS explícitos para asegurar compatibilidad
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      responseHeaders.set('Access-Control-Max-Age', '86400');

      // Obtener el body de la respuesta
      const responseBody = await backendResponse.arrayBuffer();

      // Retornar la respuesta
      return new NextResponse(responseBody, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: responseHeaders,
      });

    } catch (error) {
      console.error('[Middleware] Error proxying request:', error);
      
      return NextResponse.json(
        { 
          error: 'Error al conectar con el backend',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { 
          status: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        }
      );
    }
  }

  // Para rutas que no son /api/*, continuar normalmente
  return NextResponse.next();
}

/**
 * Configuración del middleware
 * Especifica qué rutas deben ser procesadas por el middleware
 */
export const config = {
  matcher: [
    '/api/:path*', // Solo rutas que comienzan con /api/
  ],
};
