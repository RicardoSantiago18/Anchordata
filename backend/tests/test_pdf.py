from unittest.mock import patch
from src.services.pdf_service import PDFService

def test_pdf_generation():
    with patch(
        "src.services.pdf_service.PDFService.generate_pdf_from_markdown",
        return_value="fake.pdf"
    ) as mock_pdf:
        result = PDFService.generate_pdf_from_markdown(markdown_content="# Teste")
        assert result == "fake.pdf"
        mock_pdf.assert_called_once()
