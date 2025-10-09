import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isSuperAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 403 }
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.db`;
    const backupPath = path.join(process.cwd(), 'backups', backupFileName);
    
    // Ensure backups directory exists
    const backupsDir = path.dirname(backupPath);
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Get database path from environment or use default
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 'prisma/dev.db';
    const sourceDbPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);

    // Copy database file
    if (fs.existsSync(sourceDbPath)) {
      fs.copyFileSync(sourceDbPath, backupPath);
    } else {
      return NextResponse.json(
        { error: 'Database file not found' },
        { status: 404 }
      );
    }

    // Get database statistics
    const stats = await getDatabaseStats();

    // Clean up old backups (keep only last 10)
    await cleanupOldBackups(backupsDir, 10);

    return NextResponse.json({
      message: 'Database backup created successfully',
      fileName: backupFileName,
      path: backupPath,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create database backup' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 403 }
      );
    }

    const backupsDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupsDir)) {
      return NextResponse.json({ backups: [] });
    }

    const backupFiles = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(backupsDir, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const databaseStats = await getDatabaseStats();

    return NextResponse.json({
      backups: backupFiles,
      stats: databaseStats,
    });
  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const backupPath = path.join(process.cwd(), 'backups', fileName);
    
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json(
        { error: 'Backup file not found' },
        { status: 404 }
      );
    }

    // Validate file name to prevent directory traversal
    if (!fileName.startsWith('backup-') || !fileName.endsWith('.db')) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      );
    }

    fs.unlinkSync(backupPath);

    return NextResponse.json({
      message: 'Backup deleted successfully',
      fileName,
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}

async function getDatabaseStats() {
  try {
    const userCount = await db.user.count();
    const invoiceCount = await db.invoice.count();
    
    const settledInvoices = await db.invoice.count({
      where: { status: 'SETTLED' }
    });
    
    const totalAmount = await db.invoice.aggregate({
      _sum: { totalAmount: true }
    });

    return {
      users: userCount,
      invoices: invoiceCount,
      settledInvoices,
      totalAmount: totalAmount._sum.totalAmount || 0,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      users: 0,
      invoices: 0,
      settledInvoices: 0,
      totalAmount: 0,
    };
  }
}

async function cleanupOldBackups(backupsDir: string, keepCount: number) {
  try {
    const backupFiles = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.db'))
      .map(file => ({
        fileName: file,
        path: path.join(backupsDir, file),
        mtime: fs.statSync(path.join(backupsDir, file)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (backupFiles.length > keepCount) {
      const filesToDelete = backupFiles.slice(keepCount);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`Deleted old backup: ${file.fileName}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
}