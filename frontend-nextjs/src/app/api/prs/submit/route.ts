import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData - forward as-is
      const formData = await request.formData();
      
      const response = await fetch(`${backendUrl}/api/prs/submit`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
      
    } else {
      // Handle JSON data
      const body = await request.json();
      
      const response = await fetch(`${backendUrl}/api/prs/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
    
  } catch (error) {
    console.error('PR submit proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}