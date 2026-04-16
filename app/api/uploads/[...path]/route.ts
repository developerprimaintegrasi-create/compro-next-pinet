import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const filePath = path.join(process.cwd(), 'uploads', ...segments);

    // Validate path to prevent directory traversal attacks
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Try to serve from local uploads folder first
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const fileBuffer = fs.readFileSync(filePath);

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
      });
    }

    // Fallback: Try to fetch from backend if local file not found
    // This provides graceful degradation if uploads are managed by backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const fileSegments = segments.join('/');
    const backendResponse = await fetch(`${backendUrl}/uploads/${fileSegments}`, {
      headers: {
        'Accept': '*/*',
      },
    });

    if (backendResponse.ok) {
      const buffer = await backendResponse.arrayBuffer();
      const contentType = backendResponse.headers.get('content-type') || 'application/octet-stream';
      
      return new Response(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'File not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { success: false, message: 'Error serving file' },
      { status: 500 }
    );
  }
}
