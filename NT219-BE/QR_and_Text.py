import os
import qrcode
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

def generate_qr_code(data, output_path):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='#E6E7E8')
    img.save(output_path)

def insert_qr_to_pdf(pdf_path, qr_path, output_path):
    c = canvas.Canvas("temp.pdf", pagesize=letter)
    c.drawImage(qr_path, 50, 30, width=250, height=250)
    c.save()

    pdf_reader = PdfReader(pdf_path)
    qr_reader = PdfReader("temp.pdf")
    pdf_writer = PdfWriter()

    page = pdf_reader.pages[0]
    qr_page = qr_reader.pages[0]
    page.merge_page(qr_page)
    pdf_writer.add_page(page)

    with open(output_path, "wb") as output_pdf:
        pdf_writer.write(output_pdf)
        
    os.remove("temp.pdf")

def create_watermark(user, gdc, font_path, output_path):
    c = canvas.Canvas(output_path, pagesize=(1000, 750))
    pdfmetrics.registerFont(TTFont('CustomFont', font_path))
    c.setFont('CustomFont', 30)

    positions = [(200, 406), (760, 464), (200, 464), (200, 347), (200, 289)]

    texts = [f'{user["cccd"]}', f'{user["gender"]}', f'{user["name"]}', f'{gdc["start_place"]}', f'{gdc["destination_place"]}']

    for position, text in zip(positions, texts):
        x, y = position
        c.drawString(x, y, text)

    c.save()
    
def add_watermark(input_pdf, watermark_pdf, output_pdf):
    with open(input_pdf, 'rb') as input_file, open(watermark_pdf, 'rb') as watermark_file:
        input_pdf_reader = PdfReader(input_file)
        watermark_pdf_reader = PdfReader(watermark_file)
        watermark_page = watermark_pdf_reader.pages[0]

        output_pdf_writer = PdfWriter()

        page = input_pdf_reader.pages[0]
        page.merge_page(watermark_page)
        output_pdf_writer.add_page(page)

        with open(output_pdf, 'wb') as output_file:
            output_pdf_writer.write(output_file)