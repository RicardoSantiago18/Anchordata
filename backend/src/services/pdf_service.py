import os
import uuid
import logging
from markdown import markdown
from weasyprint import HTML, CSS

logger = logging.getLogger(__name__)

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
        
        logger.info(f"[PDFService] Iniciando geração. Tamanho do markdown: {len(markdown_content)} caracteres")
        
        os.makedirs(PDFService.OUTPUT_DIR, exist_ok=True)

        pdf_filename = filename or f"maintenance_report_{uuid.uuid4()}.pdf"
        pdf_path = os.path.join(PDFService.OUTPUT_DIR, pdf_filename)

        try:
            # Markdown -> HTML
            html_content = markdown(
                markdown_content,
                extensions=["extra", "tables", "fenced_code"]
            )
            
            logger.info(f"[PDFService] HTML gerado. Tamanho: {len(html_content)} caracteres")
            
            if not html_content or len(html_content) < 10:
                raise ValueError(f"HTML gerado está vazio ou muito pequeno (tamanho: {len(html_content)})")

            # HTML -> PDF com WeasyPrint
            try:
                HTML(string=html_content).write_pdf(pdf_path)
                logger.info(f"[PDFService] PDF criado em: {pdf_path}")
                
                # Verificar se arquivo foi criado e tem conteúdo
                if not os.path.exists(pdf_path):
                    raise ValueError(f"Arquivo PDF não foi criado em {pdf_path}")
                
                file_size = os.path.getsize(pdf_path)
                logger.info(f"[PDFService] Tamanho do PDF: {file_size} bytes")
                
                if file_size < 100:
                    logger.warning(f"[PDFService] AVISO: PDF criado mas muito pequeno ({file_size} bytes)")
                
                return pdf_path
            except Exception as weasy_error:
                logger.error(f"[PDFService] Erro ao gerar PDF com WeasyPrint: {weasy_error}")
                raise ValueError(f"Falha ao gerar PDF: {str(weasy_error)}")
        
        except Exception as e:
            logger.error(f"[PDFService] Erro na geração do PDF: {e}")
            raise
