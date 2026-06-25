import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lineToken, to, messages } = body;

    console.log('Received broadcast payload:', {
      hasLineToken: !!lineToken,
      to,
      hasMessages: !!messages,
      messagesLength: messages?.length
    });

    const missingFields = [];
    if (!lineToken) missingFields.push('lineToken');
    if (!to) missingFields.push('to');
    if (!messages) missingFields.push('messages');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `กรุณาระบุข้อมูลให้ครบถ้วน. ข้อมูลที่ขาดหายไป: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lineToken.trim()}`
      },
      body: JSON.stringify({
        to,
        messages
      })
    });

    if (!lineResponse.ok) {
      const errBody = await lineResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          message: errBody.message || `LINE API Error (HTTP ${lineResponse.status})`,
          details: errBody.details || []
        },
        { status: lineResponse.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in LINE broadcast API route:', error);
    return NextResponse.json(
      { message: error.message || 'เกิดข้อผิดพลาดในการประมวลผลบนเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
