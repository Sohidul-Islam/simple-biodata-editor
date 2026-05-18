import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Runs the Python parse_doc.py script which uses IBM Docling to convert PDF, DOCX, TXT, MD, Images into Markdown.
 */
export async function parseDocumentWithDocling(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'parse_doc.py');
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Python script not found: ${scriptPath}`));
    }

    // Run using python3 with user-site packages in PYTHONPATH
    const command = `python3 "${scriptPath}" "${filePath}"`;
    console.log(`[Docling] Invoking Docling conversion for: ${filePath}`);

    // Set maxBuffer to 10MB to accommodate large parsed markdown structures
    exec(
      command,
      {
        maxBuffer: 10 * 1024 * 1024,
        env: {
          ...process.env,
          PYTHONPATH: [
            '/home/sishufol/.local/lib/python3.12/site-packages',
            process.env.PYTHONPATH || ''
          ].filter(Boolean).join(':')
        }
      },
      (error, stdout, stderr) => {
      if (error) {
        console.error(`[Docling] Shell execution error:`, error);
        console.error(`[Docling] Stderr:`, stderr);
        return reject(new Error(`Docling conversion execution failed: ${stderr || error.message}`));
      }

      try {
        const result = JSON.parse(stdout.trim());
        if (result.success) {
          console.log(`[Docling] Successfully converted file to markdown (${result.markdown.length} characters)`);
          resolve(result.markdown);
        } else {
          console.error(`[Docling] Parser reported error:`, result.error);
          reject(new Error(result.error || 'Failed to parse document with Docling'));
        }
      } catch (parseError) {
        console.error(`[Docling] Failed to parse stdout JSON. Raw output was:`, stdout);
        reject(new Error(`Docling output was not valid JSON. Raw output: ${stdout.slice(0, 500)}`));
      }
    });
  });
}
