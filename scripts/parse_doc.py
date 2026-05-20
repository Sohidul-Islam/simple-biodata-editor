import sys
import json
import logging
from docling.document_converter import DocumentConverter

# Disable unnecessary warning logs from third-party libraries
logging.getLogger("onnxruntime").setLevel(logging.ERROR)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path provided"}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    try:
        converter = DocumentConverter()
        result = converter.convert(file_path)
        markdown_text = result.document.export_to_markdown()
        
        output = {
            "success": True,
            "markdown": markdown_text
        }
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
