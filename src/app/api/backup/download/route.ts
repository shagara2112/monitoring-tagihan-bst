import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isSuperAdmin } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    // Validate file name to prevent directory traversal
    if (!fileName.startsWith('backup-') || !fileName.endsWith('.db')) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      );
    }

    const backupPath = path.join(process.cwd(), 'backups', fileName);
    
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json(
        { error: 'Backup file not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = fs.readFileSync(backupPath);
    const stats = fs.statSync(backupPath);

    // Create response with file download headers
    const response = new NextResponse(fileBuffer);
    
    // Set appropriate headers for file download
    response.headers.set('Content-Type', 'application/x-sqlite3');
    response.headers.set('Content-Length', stats.size.toString());
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error downloading backup:', error);
    return NextResponse.json(
      { error: 'Failed to download backup file' },
      { status: 500 }
    );
  }
}