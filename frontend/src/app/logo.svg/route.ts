import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  try {
    // In standalone mode, public files are at the root level
    const logoPath = path.join(process.cwd(), 'public', 'logo.svg');

    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      console.error('[logo.svg] File not found at:', logoPath);
      return new NextResponse('Logo not found', { status: 404 });
    }

    // Read the file
    const logoBuffer = fs.readFileSync(logoPath);

    // Return the SVG with proper headers
    return new NextResponse(logoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[logo.svg] Error serving logo:', error);
    return new NextResponse('Error serving logo', { status: 500 });
  }
}
