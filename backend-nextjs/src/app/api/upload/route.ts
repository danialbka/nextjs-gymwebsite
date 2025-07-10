import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse } from '@/lib/utils';

// This endpoint is deprecated - we now use video URLs instead of file uploads
export async function POST(request: NextRequest) {
  return NextResponse.json(
    createApiResponse(
      undefined, 
      'File uploads are no longer supported. Please use video URLs (Instagram, YouTube, TikTok, etc.) instead.'
    ),
    { status: 410 }
  );
} 