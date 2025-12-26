import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  try {
    // In standalone mode, public files are at the root level
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'logo.png');

    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      console.error('[logo.png] File not found at:', logoPath);
      return new NextResponse('Logo not found', { status: 404 });
    }

    // Read the file
    const logoBuffer = fs.readFileSync(logoPath);

    // Return the image with proper headers
    return new NextResponse(logoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[logo.png] Error serving logo:', error);
    return new NextResponse('Error serving logo', { status: 500 });
  }
}
