import { NextRequest, NextResponse } from 'next/server';
import { getBiodata } from '@/app/actions';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing biodata ID' }, { status: 400 });
    }

    // Fetch biodata to get the name for the file
    const biodata = await getBiodata(id);
    if (!biodata) {
      return NextResponse.json({ success: false, error: 'Biodata not found' }, { status: 404 });
    }

    console.log(`[Export API] Starting Puppeteer PDF export for: ${biodata.name}`);

    // Determine the base origin (e.g. http://localhost:3000 or http://127.0.0.1:3001)
    const origin = req.nextUrl.origin;
    const targetUrl = `${origin}/share/${id}`;
    console.log(`[Export API] Launching Puppeteer. Navigating to: ${targetUrl}`);

    // Launch Puppeteer headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    
    // Set viewport to approximate A4 dimensions
    await page.setViewport({
      width: 794, // 794px is approximately A4 width at 96 DPI
      height: 1123, // 1123px is approximately A4 height at 96 DPI
      deviceScaleFactor: 2, // Retinal scaling for ultra-sharp text and borders
    });

    // Navigate to page and wait until network is completely idle
    await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Inject CSS overrides to completely isolate the paper document canvas
    await page.addStyleTag({
      content: `
        .no-print {
          display: none !important;
        }
        body {
          background-color: white !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        #print-target {
          box-shadow: none !important;
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          transform: none !important;
        }
        .paper {
          box-shadow: none !important;
          border: none !important;
          padding: 30px !important; /* Perfect print padding */
          margin: 0 !important;
          min-height: auto !important;
          height: auto !important;
        }
      `,
    });

    // Wait another 500ms for layout to settle
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capture PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px',
      },
    });

    await browser.close();
    console.log(`[Export API] PDF generation complete for: ${biodata.name}`);

    // Return the PDF buffer directly as an attachment response
    const filename = `${biodata.name.replace(/\s+/g, '_')}_biodata.pdf`;
    
    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('[Export API] Failed to export PDF:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error during PDF generation' 
    }, { status: 500 });
  }
}
