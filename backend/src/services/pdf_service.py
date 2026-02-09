import os
import uuid
from markdown import markdown
from weasyprint import HTML

class PDFService:

    OUTPUT_DIR = "data/reports"

    @staticmethod
    def generate_pdf_from_markdown(
        *,
        markdown_content: str,
        filename: str = None
        ) -> str:
        """
        Gera um Pdf a partir de um Markdown preenchido pela IA.

        Retorna:
        - Caminho do arquivo PDF gerado
        """

        if not markdown_content:
            raise ValueError("Conteúdo Markdown é obrigatório para gerar PDF.")
        
        os.makedirs(PDFService.OUTPUT_DIR, exist_ok=True)

        pdf_filename = filename or f"maintenance_report_{uuid.uuid4()}.pdf"
        pdf_path = os.path.join(PDFService.OUTPUT_DIR, pdf_filename)

        # Markdown -> HTML
        html_content = markdown(
            markdown_content,
            extensions=["extra", "tables", "fenced_code"]
        )

        # HTML -> PDF
        HTML(string=html_content).write_pdf(pdf_path)

        return pdf_path
