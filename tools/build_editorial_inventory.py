from __future__ import annotations

from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(r"C:\Users\B.T.M\Desktop\EKAM Capital\SIMPARA DISTRIBUTION")
OUT = ROOT / "Livrables" / "INVENTAIRE_EDITORIAL_MULTIPRODUIT_MALI.docx"

GREEN = "18583A"
DEEP = "102D20"
LIME = "DDEB62"
PALE = "F1F6E8"
SOFT = "F6F7F3"
MID = "5D6B63"
INK = "141815"
WHITE = "FFFFFF"
AMBER = "FFF1C2"
RED_PALE = "FBE5E2"
BLUE_PALE = "E8F1F8"
LINE = "CFD8D1"


def set_cell_shading(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=85, start=95, bottom=85, end=95) -> None:
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_table_header(row, repeat: bool = True) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = tr_pr.find(qn("w:tblHeader"))
    if tbl_header is None:
        tbl_header = OxmlElement("w:tblHeader")
        tr_pr.append(tbl_header)
    tbl_header.set(qn("w:val"), "true" if repeat else "false")


def set_row_cant_split(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    cant_split = OxmlElement("w:cantSplit")
    tr_pr.append(cant_split)


def set_cell_width(cell, width_inches: float) -> None:
    width = Inches(width_inches)
    cell.width = width
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_w = tc_pr.find(qn("w:tcW"))
    if tc_w is None:
        tc_w = OxmlElement("w:tcW")
        tc_pr.append(tc_w)
    tc_w.set(qn("w:w"), str(int(width.twips)))
    tc_w.set(qn("w:type"), "dxa")


def set_table_borders(table, color=LINE, size="5") -> None:
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = borders.find(qn(f"w:{edge}"))
        if tag is None:
            tag = OxmlElement(f"w:{edge}")
            borders.append(tag)
        tag.set(qn("w:val"), "single")
        tag.set(qn("w:sz"), size)
        tag.set(qn("w:space"), "0")
        tag.set(qn("w:color"), color)


def add_page_field(paragraph) -> None:
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instr, separate, end])


def add_paragraph(doc, text="", *, style=None, bold=False, color=None, size=None, align=None, keep=False):
    p = doc.add_paragraph(style=style)
    if text:
        r = p.add_run(text)
        r.bold = bold
        if color:
            r.font.color.rgb = RGBColor.from_string(color)
        if size:
            r.font.size = Pt(size)
    if align is not None:
        p.alignment = align
    if keep:
        p.paragraph_format.keep_with_next = True
    return p


def add_label(doc, text: str):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text.upper())
    r.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor.from_string(GREEN)
    r.font.letter_spacing = Pt(0.8)
    return p


def add_heading(doc, text: str, level=1, page_break=False):
    p = doc.add_paragraph(text, style=f"Heading {level}")
    if page_break:
        p.paragraph_format.page_break_before = True
    p.paragraph_format.keep_with_next = True
    return p


def add_bullet(doc, text: str, level=0):
    style = "List Bullet 2" if level else "List Bullet"
    p = doc.add_paragraph(text, style=style)
    p.paragraph_format.space_after = Pt(3)
    return p


def add_number(doc, text: str):
    p = doc.add_paragraph(text, style="List Number")
    p.paragraph_format.space_after = Pt(3)
    return p


def add_callout(doc, title: str, body: str, fill=PALE):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_row_cant_split(table.rows[0])
    set_table_borders(table, color=fill, size="0")
    cell = table.cell(0, 0)
    set_cell_width(cell, 6.5)
    set_cell_shading(cell, fill)
    set_cell_margins(cell, top=150, start=180, bottom=150, end=180)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(title.upper())
    r.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor.from_string(GREEN)
    p2 = cell.add_paragraph(body)
    p2.paragraph_format.space_after = Pt(0)
    p2.paragraph_format.line_spacing = 1.15
    return table


def add_revision_box(doc, title="Texte validé / décision"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_row_cant_split(table.rows[0])
    set_table_borders(table, color=LINE, size="6")
    cell = table.cell(0, 0)
    set_cell_width(cell, 6.5)
    set_cell_shading(cell, "FBFCFA")
    set_cell_margins(cell, top=100, start=150, bottom=100, end=150)
    p = cell.paragraphs[0]
    r = p.add_run(title.upper())
    r.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor.from_string(MID)
    for _ in range(1):
        q = cell.add_paragraph(" ")
        q.paragraph_format.space_after = Pt(0)
    return table


def add_inventory_table(doc, rows, widths=(1.35, 3.65, 1.5), headers=("Élément", "Texte actuel", "Destination / remarque")):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.style = "Table Grid"
    set_table_borders(table)
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    set_row_cant_split(hdr)
    for idx, (cell, header, width) in enumerate(zip(hdr.cells, headers, widths)):
        set_cell_width(cell, width)
        set_cell_shading(cell, GREEN)
        set_cell_margins(cell, top=90, start=95, bottom=90, end=95)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(header)
        r.bold = True
        r.font.size = Pt(8.3)
        r.font.color.rgb = RGBColor.from_string(WHITE)
    for row_index, row_data in enumerate(rows):
        row = table.add_row()
        set_row_cant_split(row)
        fill = WHITE if row_index % 2 == 0 else SOFT
        for cell, value, width in zip(row.cells, row_data, widths):
            set_cell_width(cell, width)
            set_cell_shading(cell, fill)
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.08
            r = p.add_run(str(value))
            r.font.size = Pt(8.4)
            r.font.color.rgb = RGBColor.from_string(INK)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_two_col_table(doc, rows, label_width=1.65, text_width=4.85):
    table = doc.add_table(rows=0, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    for row_index, (label, value) in enumerate(rows):
        row = table.add_row()
        set_row_cant_split(row)
        label_cell, value_cell = row.cells
        set_cell_width(label_cell, label_width)
        set_cell_width(value_cell, text_width)
        set_cell_margins(label_cell, top=48, start=85, bottom=48, end=85)
        set_cell_margins(value_cell, top=48, start=85, bottom=48, end=85)
        set_cell_shading(label_cell, PALE)
        set_cell_shading(value_cell, WHITE if row_index % 2 == 0 else "FBFCFA")
        lp = label_cell.paragraphs[0]
        lp.paragraph_format.space_after = Pt(0)
        lr = lp.add_run(label)
        lr.bold = True
        lr.font.size = Pt(8.1)
        lr.font.color.rgb = RGBColor.from_string(GREEN)
        vp = value_cell.paragraphs[0]
        vp.paragraph_format.space_after = Pt(0)
        vp.paragraph_format.line_spacing = 1.08
        vr = vp.add_run(value)
        vr.font.size = Pt(8.2)
        vr.font.color.rgb = RGBColor.from_string(INK)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_section_banner(doc, index: str, title: str, subtitle: str):
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table, color=WHITE, size="0")
    left, right = table.rows[0].cells
    set_cell_width(left, 0.72)
    set_cell_width(right, 5.78)
    set_cell_shading(left, LIME)
    set_cell_shading(right, DEEP)
    set_cell_margins(left, top=160, start=100, bottom=160, end=100)
    set_cell_margins(right, top=145, start=200, bottom=145, end=190)
    p = left.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(index)
    r.bold = True
    r.font.size = Pt(18)
    r.font.color.rgb = RGBColor.from_string(DEEP)
    p2 = right.paragraphs[0]
    p2.paragraph_format.space_after = Pt(2)
    r2 = p2.add_run(title)
    r2.bold = True
    r2.font.size = Pt(14)
    r2.font.color.rgb = RGBColor.from_string(WHITE)
    p3 = right.add_paragraph(subtitle)
    p3.paragraph_format.space_after = Pt(0)
    r3 = p3.runs[0]
    r3.font.size = Pt(8.5)
    r3.font.color.rgb = RGBColor.from_string("DDE7DF")
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


PRODUCTS = [
    {
        "slug": "tropicoul-ananas", "status": "Publié", "brand": "Tropicoul", "name": "Ananas",
        "tags": "Solaire · Jaune · Végétale", "headline": "PLEIN SOLEIL.",
        "description": "Un univers jaune et vert construit autour de la lumière, du relief et d’une présence végétale franche.",
        "benefitTitle": "SIGNATURE SOLAIRE",
        "benefit": "Rayons, feuillages et volumes tropicaux composent une scène où la canette reste le point d’ancrage.",
        "heroLead": "Un monde jaune et vert où la lumière, les feuillages et les volumes tropicaux composent le décor.",
        "signatureEyebrow": "Signature solaire", "signatureTitle": "Plein soleil.",
        "signatureCopy": "Rayons, reliefs et accents végétaux installent une scène lumineuse. La canette reste le point d’ancrage de toute la composition.",
        "productTitle": "La canette au premier plan.",
        "productCopy": "Une lecture nette du pack, entourée d’une matière visuelle solaire et végétale.",
        "macroTitle": "Relief tropical.",
        "macroCopy": "Découpes, couronne et ombres dessinent la signature graphique de cet univers.",
        "lifestyleTitle": "Un décor ouvert et lumineux.",
        "lifestyleCopy": "Une respiration éditoriale pensée pour prolonger l’univers visuel de la saveur.",
    },
    {
        "slug": "tropicoul-mangue", "status": "Publié", "brand": "Tropicoul", "name": "Mangue",
        "tags": "Dorée · Chaleureuse · Graphique", "headline": "LA CHALEUR EN COURBES.",
        "description": "Une composition dorée faite de courbes amples, de lumière chaude et de contrastes maîtrisés.",
        "benefitTitle": "SIGNATURE DORÉE",
        "benefit": "L’or, l’abricot et les ombres profondes construisent un univers enveloppant et précisément composé.",
        "heroLead": "Une composition dorée faite de courbes amples, de lumière chaude et de contrastes maîtrisés.",
        "signatureEyebrow": "Signature dorée", "signatureTitle": "La chaleur en courbes.",
        "signatureCopy": "L’or, l’abricot et les ombres profondes construisent un univers enveloppant sans jamais troubler la lecture du pack.",
        "productTitle": "Une présence nette.",
        "productCopy": "Le produit se détache dans une scène ample, calme et précisément composée.",
        "macroTitle": "Matière et lumière.",
        "macroCopy": "Volumes francs et détails fruités donnent du relief à la direction artistique.",
        "lifestyleTitle": "Une lumière chaleureuse.",
        "lifestyleCopy": "La scène prolonge le territoire doré dans un registre plus éditorial.",
    },
    {
        "slug": "tropicoul-orange", "status": "Publié", "brand": "Tropicoul", "name": "Orange",
        "tags": "Circulaire · Lumineuse · Vive", "headline": "TOUT TOURNE ROND.",
        "description": "Cercles, lumière franche et contrastes cobalt donnent à cet univers son rythme visuel.",
        "benefitTitle": "SIGNATURE CIRCULAIRE",
        "benefit": "La tranche, les anneaux et les trajectoires courtes organisent une scène vive et lisible.",
        "heroLead": "Cercles, lumière franche et contrastes cobalt donnent à cet univers son rythme visuel.",
        "signatureEyebrow": "Signature circulaire", "signatureTitle": "Tout tourne rond.",
        "signatureCopy": "La tranche, les anneaux et les trajectoires courtes organisent une scène vive, lisible et immédiatement reconnaissable.",
        "productTitle": "Le pack, sans détour.",
        "productCopy": "La canette reste verticale et dégagée au cœur d’une composition circulaire.",
        "macroTitle": "Cercles et détails.",
        "macroCopy": "Une étude graphique de la tranche, du relief et des accents colorés.",
        "lifestyleTitle": "Une scène lumineuse.",
        "lifestyleCopy": "Le langage orange et cobalt se poursuit dans une image plus ouverte.",
    },
    {
        "slug": "tropicoul-goyave", "status": "Publié", "brand": "Tropicoul", "name": "Goyave",
        "tags": "Rose · Botanique · Nacrée", "headline": "ROSE ET VERT, EN PROFONDEUR.",
        "description": "Rose chair, vert botanique et lumière nacrée composent un univers généreux et contemporain.",
        "benefitTitle": "SIGNATURE BOTANIQUE",
        "benefit": "La masse végétale encadre une lumière douce tandis que le produit conserve une présence calme et précise.",
        "heroLead": "Rose chair, vert botanique et lumière nacrée composent un univers généreux et contemporain.",
        "signatureEyebrow": "Signature botanique", "signatureTitle": "Rose et vert, en profondeur.",
        "signatureCopy": "La masse végétale encadre une lumière douce tandis que le produit conserve une présence calme et précise.",
        "productTitle": "Une lecture claire du pack.",
        "productCopy": "La canette prend place dans une composition botanique structurée, avec un espace de lecture préservé.",
        "macroTitle": "Chair, graines, feuillage.",
        "macroCopy": "Un recadrage éditorial met en avant les matières qui définissent l’univers visuel Goyave.",
        "lifestyleTitle": "Un moment ouvert.",
        "lifestyleCopy": "Une scène contemporaine prolonge la lumière douce et le registre botanique.",
    },
    {
        "slug": "tropicoul-cocktail", "status": "Prototype · page noindex · visible sur l’accueil", "brand": "Tropicoul", "name": "Cocktail",
        "tags": "Bleue · Tropicale · Graphique", "headline": "LE BLEU DONNE LE CADRE.",
        "description": "Un champ bleu profond, des accents lumineux et un mouvement graphique tenu.",
        "benefitTitle": "SIGNATURE BLEUE",
        "benefit": "Le décor s’organise autour d’une dominante océan et de quelques éclats abstraits.",
        "heroLead": "Un champ bleu profond, des accents lumineux et un mouvement graphique tenu.",
        "signatureEyebrow": "Signature bleue", "signatureTitle": "Le bleu donne le cadre.",
        "signatureCopy": "Le décor s’organise autour d’une dominante océan et de quelques éclats abstraits, sans surcharger la scène.",
        "productTitle": "La canette au centre.",
        "productCopy": "Le pack reste entièrement visible dans une composition bleue volontairement sélective.",
        "macroTitle": "Rythme et lumière.",
        "macroCopy": "Rubans et atmosphère composent une matière visuelle abstraite, distincte du pack.",
        "lifestyleTitle": "Un territoire à poursuivre.",
        "lifestyleCopy": "La direction bleue se prolonge ici sans introduire de vocabulaire fruité non arbitré.",
    },
    {
        "slug": "tropicoul-tamarin", "status": "Publié", "brand": "Tropicoul", "name": "Tamarin",
        "tags": "Profonde · Végétale · Ambrée", "headline": "LA PROFONDEUR VÉGÉTALE.",
        "description": "Vert profond, terre et lumière ambrée installent un univers posé, tactile et contemporain.",
        "benefitTitle": "SIGNATURE AMBRÉE",
        "benefit": "Le vide, les branches fines et une lumière rare composent une scène au rythme volontairement calme.",
        "heroLead": "Vert profond, terre et lumière ambrée installent un univers posé, tactile et contemporain.",
        "signatureEyebrow": "Signature ambrée", "signatureTitle": "La profondeur végétale.",
        "signatureCopy": "Le vide, les branches fines et une lumière rare composent la scène avec un rythme volontairement calme.",
        "productTitle": "Le pack dans la lumière.",
        "productCopy": "La canette se détache sur un fond profond, sans effet ni décor devant son identité.",
        "macroTitle": "Matière, ombre, relief.",
        "macroCopy": "Une étude visuelle des gousses, des fibres et des contrastes ambrés.",
        "lifestyleTitle": "Une scène contemporaine.",
        "lifestyleCopy": "L’univers se poursuit dans une lumière chaude et une composition mature.",
    },
    {
        "slug": "triplex-original", "status": "Publié", "brand": "Triplex", "name": "Original",
        "tags": "Noire · Urbaine · Électrique", "headline": "LA TENSION SOUS CONTRÔLE.",
        "description": "Noir carbone, acier et rouge électrique composent une tension visuelle précise.",
        "benefitTitle": "SIGNATURE NOCTURNE",
        "benefit": "Le noir garde la majorité de la scène, tandis que le rouge guide le regard par touches courtes.",
        "heroLead": "Noir carbone, acier et rouge électrique composent une tension visuelle précise.",
        "signatureEyebrow": "Signature nocturne", "signatureTitle": "La tension sous contrôle.",
        "signatureCopy": "Le noir garde la majorité de la scène. Le rouge intervient par touches courtes pour guider le regard vers le produit.",
        "productTitle": "Triplex, au premier plan.",
        "productCopy": "Une présence verticale, des reflets acier et une composition sans surcharge.",
        "macroTitle": "Carbone et lumière.",
        "macroCopy": "Texture sombre, lignes nettes et accents rouges construisent le territoire visuel.",
        "lifestyleTitle": "Une scène urbaine.",
        "lifestyleCopy": "Le langage noir, acier et rouge se poursuit dans un registre photographique distinct.",
    },
    {
        "slug": "vimto-sparkling", "status": "Publié", "brand": "Vimto", "name": "Sparkling",
        "tags": "Rétro · Rouge · Pétillant", "headline": "RÉTRO PÉTILLANT, ROUGE FRANC.",
        "description": "Rouge franc, blanc glacé et trait jaune citron composent une présence graphique fidèle au pack.",
        "benefitTitle": "SIGNATURE RÉTRO",
        "benefit": "Le contraste, les panneaux clairs et les bulles installent un univers net autour de la canette.",
        "heroLead": "Une présence rétro pétillante, portée par un rouge franc, un blanc glacé et un trait jaune citron.",
        "signatureEyebrow": "Signature rétro", "signatureTitle": "Rouge franc, lignes nettes.",
        "signatureCopy": "Les contrastes du pack structurent la scène : rouge profond, panneaux clairs, accent citron et reflets d’aluminium.",
        "productTitle": "La canette au premier plan.",
        "productCopy": "Le pack rétro rouge reste entier et lisible, entouré de mouvements graphiques sobres.",
        "macroTitle": "Le graphisme au plus près.",
        "macroCopy": "Un cadrage rapproché révèle les aplats rouges, le panneau blanc et le trait jaune du packaging.",
        "lifestyleTitle": "Un moment à partager.",
        "lifestyleCopy": "Une scène ouverte prolonge l’identité rouge et pétillante dans un registre éditorial sobre.",
    },
]


def setup_document() -> Document:
    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.82)
    section.bottom_margin = Inches(0.72)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.35)
    section.footer_distance = Inches(0.35)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Aptos"
    normal.font.size = Pt(10)
    normal.font.color.rgb = RGBColor.from_string(INK)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.22

    for style_name in ("List Bullet", "List Bullet 2", "List Number"):
        style = styles[style_name]
        style.font.name = "Aptos"
        style.font.size = Pt(9.7)
        style.paragraph_format.line_spacing = 1.15

    h1 = styles["Heading 1"]
    h1.font.name = "Aptos Display"
    h1.font.size = Pt(20)
    h1.font.bold = True
    h1.font.color.rgb = RGBColor.from_string(DEEP)
    h1.paragraph_format.space_before = Pt(8)
    h1.paragraph_format.space_after = Pt(9)
    h1.paragraph_format.keep_with_next = True

    h2 = styles["Heading 2"]
    h2.font.name = "Aptos Display"
    h2.font.size = Pt(14.5)
    h2.font.bold = True
    h2.font.color.rgb = RGBColor.from_string(GREEN)
    h2.paragraph_format.space_before = Pt(12)
    h2.paragraph_format.space_after = Pt(7)
    h2.paragraph_format.keep_with_next = True

    h3 = styles["Heading 3"]
    h3.font.name = "Aptos"
    h3.font.size = Pt(11)
    h3.font.bold = True
    h3.font.color.rgb = RGBColor.from_string(DEEP)
    h3.paragraph_format.space_before = Pt(8)
    h3.paragraph_format.space_after = Pt(5)
    h3.paragraph_format.keep_with_next = True

    header = section.header
    hp = header.paragraphs[0]
    hp.paragraph_format.space_after = Pt(0)
    hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = hp.add_run("MULTIPRODUIT MALI")
    r.bold = True
    r.font.size = Pt(8)
    r.font.color.rgb = RGBColor.from_string(GREEN)
    r2 = hp.add_run("     INVENTAIRE ÉDITORIAL · DÉMONSTRATION CLIENT")
    r2.font.size = Pt(8)
    r2.font.color.rgb = RGBColor.from_string(MID)

    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    fp.paragraph_format.space_after = Pt(0)
    fr = fp.add_run("Document de travail · 30 août 2026     ")
    fr.font.size = Pt(8)
    fr.font.color.rgb = RGBColor.from_string(MID)
    add_page_field(fp)

    core = doc.core_properties
    core.title = "Inventaire éditorial du site Multiproduit Mali"
    core.subject = "Révision des textes, boutons et destinations avant démonstration client"
    core.author = "Multiproduit Mali / EKAM Capital"
    core.keywords = "Multiproduit Mali, site, textes, boutons, validation, démonstration"
    return doc


def add_cover(doc):
    add_paragraph(doc, "DOSSIER DE RÉVISION ÉDITORIALE", bold=True, color=GREEN, size=9, keep=True)
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(24)
    p.paragraph_format.space_after = Pt(10)
    r = p.add_run("Inventaire éditorial\ndu site")
    r.bold = True
    r.font.name = "Aptos Display"
    r.font.size = Pt(31)
    r.font.color.rgb = RGBColor.from_string(DEEP)
    p2 = doc.add_paragraph()
    p2.paragraph_format.space_after = Pt(18)
    r2 = p2.add_run("MULTIPRODUIT MALI")
    r2.bold = True
    r2.font.size = Pt(18)
    r2.font.color.rgb = RGBColor.from_string(GREEN)

    add_callout(
        doc,
        "Objectif",
        "Rassembler les textes actuellement présents dans le site, localiser chaque contenu, cartographier les boutons et leurs destinations, puis fournir un support de validation prêt pour la préparation d’une démonstration client.",
        fill=PALE,
    )
    doc.add_paragraph()
    add_two_col_table(doc, [
        ("Périmètre", "Accueil, navigation, 8 fiches produit, SEO, accessibilité et états d’erreur"),
        ("Produits publiés", "Tropicoul Ananas, Mangue, Orange, Goyave et Tamarin · Triplex Original · Vimto Sparkling"),
        ("Prototype", "Tropicoul Cocktail — visible dans la sélection d’accueil, mais exclu de la gamme publiée et marqué noindex"),
        ("Source auditée", "Code local du site et routes servies sur http://localhost:3000"),
        ("Date", "30 août 2026"),
        ("Statut", "Document de travail à faire valider avant présentation au client"),
    ])
    doc.add_paragraph()
    add_paragraph(doc, "Mode d’emploi", style="Heading 3")
    add_bullet(doc, "Conserver la colonne « Texte actuel » comme référence de départ.")
    add_bullet(doc, "Reporter chaque décision dans les encadrés « Texte validé / décision ».")
    add_bullet(doc, "Traiter en priorité les points signalés comme provisoires ou à confirmer.")
    add_bullet(doc, "Utiliser le prompt ChatGPT en fin de document pour produire une version révisée, structurée et traçable.")


def add_context(doc):
    doc.add_page_break()
    add_section_banner(doc, "01", "Contexte de marque et garde-fous", "Le cadre à donner à toute révision éditoriale")
    add_heading(doc, "Contexte actuellement exprimé par le site", level=2)
    add_bullet(doc, "Nom affiché : « Multiproduit Mali » et, dans plusieurs zones, « Multiproduit Mali SARL ».")
    add_bullet(doc, "Activité formulée : développement et distribution des marques Tropicoul, Triplex et Vimto.")
    add_bullet(doc, "Ancrage : boissons maliennes et ambition d’ouverture vers de nouveaux marchés.")
    add_bullet(doc, "Publics visés : consommateurs, distributeurs, partenaires commerciaux et interlocuteurs internationaux.")
    add_bullet(doc, "Format produit affiché : canette 330 ml.")
    add_callout(
        doc,
        "Précaution éditoriale",
        "Le site ne doit pas affirmer que Multiproduit Mali fabrique, embouteille, possède une licence, exporte déjà dans un territoire ou apporte un bénéfice nutritionnel tant que ces informations n’ont pas été confirmées par le client.",
        fill=AMBER,
    )
    add_heading(doc, "Ton recommandé pour la démonstration", level=2)
    add_bullet(doc, "Clair et concret : phrases courtes, bénéfice immédiatement compréhensible.")
    add_bullet(doc, "Malien et contemporain : faire sentir l’origine sans folklore ni surpromesse.")
    add_bullet(doc, "Énergique mais crédible : privilégier la personnalité des marques aux superlatifs génériques.")
    add_bullet(doc, "Commercial : montrer la qualité du portefeuille et l’intérêt d’un partenariat régional ou international.")
    add_bullet(doc, "Prudent : aucune allégation santé, performance, composition, origine d’ingrédients ou part de marché sans preuve.")

    add_heading(doc, "Informations à obtenir du client", level=2)
    add_inventory_table(doc, [
        ("Identité légale", "Dénomination exacte : Multiproduit Mali, Multiproduit Mali SARL ou Mali Multi Produit ?", "À confirmer"),
        ("Coordonnées", "Adresse officielle, téléphone, e-mail public et horaires éventuels.", "À fournir"),
        ("Territoire", "Zones réellement desservies et pays visés pour les partenariats.", "À confirmer"),
        ("Marques", "Statut de Multiproduit Mali pour Tropicoul, Triplex et Vimto : propriétaire, licencié, distributeur ou autre.", "Validation juridique"),
        ("Produits", "Recettes, catégories exactes, composition, certifications et caractéristiques autorisées.", "Validation produit"),
        ("Canaux", "WhatsApp, réseaux sociaux, formulaire, e-mail et interlocuteur commercial à afficher.", "À fournir"),
        ("Actualités", "Trois sujets réels, dates, images, pages détaillées et appels à l’action.", "À fournir"),
        ("Langues", "Français uniquement ou véritable version anglaise ?", "À décider"),
    ])


def add_vigilance(doc):
    add_heading(doc, "Points de vigilance avant la démonstration", level=1, page_break=True)
    add_callout(doc, "Lecture rapide", "Ces points n’empêchent pas la consultation du site, mais ils peuvent créer une impression de fonctionnalité inachevée pendant une démonstration au client.", fill=RED_PALE)
    rows = [
        ("Nom de l’entreprise", "Le site alterne « Multiproduit Mali » et « Multiproduit Mali SARL ».", "Confirmer la forme officielle et harmoniser."),
        ("E-mail", "contact@multiproduitmali.ml", "Confirmer que l’adresse existe et reçoit les demandes."),
        ("Bouton FR", "Le bouton « FR » renvoie actuellement vers la zone Contact.", "Créer un vrai sélecteur ou retirer le bouton."),
        ("Recherche", "L’icône de recherche renvoie vers la section Actualités.", "Créer la recherche ou retirer l’icône."),
        ("Actualités", "« Toutes les actualités » et les trois flèches renvoient au Contact.", "Créer des pages d’actualité ou adopter un libellé honnête."),
        ("Nos marques", "« Découvrir les produits » renvoie vers sa propre section #marques.", "Rediriger vers le premier produit ou supprimer le doublon."),
        ("Cocktail", "Cocktail est visible dans le carrousel d’accueil mais reste prototype, noindex et absent de la gamme publiée.", "Publier officiellement ou masquer avant la démo."),
        ("Contact", "Le seul canal public est un lien e-mail.", "Ajouter, si validés, téléphone, WhatsApp, adresse et formulaire."),
        ("Mentions", "Aucune destination juridique n’est actuellement proposée dans le pied de page.", "Prévoir mentions légales et confidentialité si le site est diffusé."),
        ("Anglais", "Une copie anglaise existe dans le composant Héro, mais aucun sélecteur fonctionnel ne l’expose.", "Décider : activer ou retirer du périmètre de démo."),
    ]
    add_inventory_table(doc, rows)
    add_revision_box(doc, "Décisions prioritaires avant démonstration")


def add_home(doc):
    add_heading(doc, "Page d’accueil — inventaire complet", level=1, page_break=True)
    add_paragraph(doc, "Route : /  ·  Ancre de retour : #accueil", color=MID, size=9)

    add_heading(doc, "En-tête et navigation", level=2)
    add_inventory_table(doc, [
        ("Logo / accueil", "Multiproduit Mali, accueil", "#accueil · libellé accessible"),
        ("Navigation", "Notre entreprise", "#entreprise"),
        ("Navigation", "Nos marques", "#marques"),
        ("Navigation", "Actualités", "#actualites"),
        ("Navigation", "Contact", "#contact"),
        ("Action", "FR", "#contact · provisoire"),
        ("Action", "Rechercher sur le site", "#actualites · icône, libellé accessible, provisoire"),
        ("Menu mobile", "Ouvrir la navigation", "Commande d’ouverture · libellé accessible"),
        ("Menu mobile", "Navigation mobile", "Libellé accessible du menu"),
        ("Accessibilité", "Aller au contenu principal", "Lien d’évitement vers #main-content"),
    ])

    add_heading(doc, "Héro — message principal", level=2)
    add_inventory_table(doc, [
        ("Sourcil", "Multiproduit Mali SARL", "Texte visible"),
        ("Titre H1", "Des boissons maliennes prêtes pour de nouveaux marchés.", "Texte visible"),
        ("Introduction", "Multiproduit Mali développe et distribue les marques Tropicoul, Triplex et Vimto. Nous recherchons des partenaires capables de les représenter et de les développer dans leur pays.", "Texte visible"),
        ("CTA principal", "Devenir partenaire", "#contact"),
        ("CTA secondaire", "Découvrir nos produits", "#marques"),
        ("Commande", "Pause / Lecture", "Arrête ou relance l’animation"),
        ("Accessibilité", "Mettre en pause l’animation des produits / Reprendre l’animation des produits", "Libellé dynamique du bouton"),
    ])
    add_callout(doc, "Version anglaise présente dans le code, non activée", "Multiproduit Mali SARL · Malian beverages ready for new markets. · Multiproduit Mali develops and distributes Tropicoul, Triplex and Vimto. We are looking for partners to represent and grow our brands in their markets. · Become a partner · Explore our products", fill=BLUE_PALE)
    add_revision_box(doc)

    add_heading(doc, "Notre entreprise", level=2)
    add_inventory_table(doc, [
        ("Sourcil", "NOTRE ENTREPRISE", "#entreprise"),
        ("Titre H2", "Une énergie locale, distribuée avec exigence.", "Texte visible"),
        ("Paragraphe", "Multiproduit Mali rend les boissons Tropicoul, Triplex et Vimto accessibles là où les rencontres, les efforts et les célébrations se vivent vraiment.", "Texte visible"),
        ("Bouton", "En savoir plus", "#marques"),
        ("Image", "Univers Triplex", "Texte alternatif"),
    ])

    add_heading(doc, "Nos marques et sélection produits", level=2)
    add_inventory_table(doc, [
        ("Sourcil", "NOS MARQUES", "#marques"),
        ("Titre H2", "Une réponse pour chaque moment.", "Texte visible"),
        ("Lien", "Découvrir les produits", "#marques · renvoi à la section courante"),
        ("Titre sélection", "LA SÉLECTION MULTIPRODUIT MALI", "Texte visible"),
        ("Instruction", "FAITES DÉFILER POUR EXPLORER", "Texte visible"),
        ("Accessibilité", "Sélection de produits Multiproduit Mali", "Libellé de section"),
    ])
    add_inventory_table(doc, [
        ("Produit", "Tropicoul Ananas", "/produits/tropicoul-ananas"),
        ("Produit", "Tropicoul Mangue", "/produits/tropicoul-mangue"),
        ("Produit", "Tropicoul Orange", "/produits/tropicoul-orange"),
        ("Produit", "Tropicoul Goyave", "/produits/tropicoul-goyave"),
        ("Produit", "Tropicoul Cocktail", "/produits/tropicoul-cocktail · prototype"),
        ("Produit", "Tropicoul Tamarin", "/produits/tropicoul-tamarin"),
        ("Produit", "Triplex Original", "/produits/triplex-original"),
        ("Produit", "Vimto Sparkling", "/produits/vimto-sparkling"),
        ("Accessibilité", "Découvrir [marque] [saveur]", "Libellé dynamique de chaque fiche"),
    ])
    add_revision_box(doc)

    add_heading(doc, "Actualités — À la une", level=2)
    add_inventory_table(doc, [
        ("Sourcil", "À LA UNE", "#actualites"),
        ("Titre H2", "Les histoires qui animent Multiproduit Mali.", "Texte visible"),
        ("Lien", "Toutes les actualités", "#contact · provisoire"),
        ("Catégorie", "Distribution", "Carte 1"),
        ("Titre", "Multiproduit Mali se rapproche des lieux de vie qui font vibrer la ville.", "Carte 1 · flèche vers #contact"),
        ("Catégorie", "Marques", "Carte 2"),
        ("Titre", "Tropicoul : des recettes fruitées à partager à tout moment.", "Carte 2 · flèche vers #contact"),
        ("Catégorie", "Communauté", "Carte 3"),
        ("Titre", "Triplex accompagne les défis qui font avancer toute une génération.", "Carte 3 · flèche vers #contact"),
        ("Accessibilité", "Lire : [titre de l’actualité]", "Libellé dynamique de chaque flèche"),
    ])
    add_revision_box(doc)

    add_heading(doc, "Raison d’être", level=2)
    add_inventory_table(doc, [
        ("Mot décoratif", "ENSEMBLE", "Texte visible"),
        ("Sourcil", "NOTRE RAISON D'ÊTRE", "Texte visible"),
        ("Titre H2", "Faire circuler la fraîcheur, l'optimisme et les possibilités.", "Texte visible"),
        ("Lien", "Ce qui nous anime", "#contact"),
        ("Image", "Moment de partage Tropicoul", "Texte alternatif"),
    ])

    add_heading(doc, "Contact", level=2)
    add_inventory_table(doc, [
        ("Sourcil", "TRAVAILLONS ENSEMBLE", "#contact"),
        ("Titre H2", "Votre prochain partenariat commence ici.", "Texte visible"),
        ("Bouton", "Nous contacter", "mailto:contact@multiproduitmali.ml"),
    ])
    add_revision_box(doc)

    add_heading(doc, "Pied de page", level=2)
    add_inventory_table(doc, [
        ("Marque", "M / MULTIPRODUIT MALI", "Identification visuelle"),
        ("Rubrique", "EXPLORER", "Titre de colonne"),
        ("Lien", "Notre entreprise", "#entreprise"),
        ("Lien", "Nos marques", "#marques"),
        ("Lien", "Actualités", "#actualites"),
        ("Rubrique", "RESTONS EN CONTACT", "Titre de colonne"),
        ("E-mail", "contact@multiproduitmali.ml", "mailto:contact@multiproduitmali.ml"),
        ("Lien", "Retour en haut ↑", "#accueil"),
        ("Copyright", "© 2026 Multiproduit Mali. Tous droits réservés.", "Texte visible"),
    ])
    add_revision_box(doc)


def add_product_shell(doc):
    add_heading(doc, "Fiches produit — structure commune", level=1, page_break=True)
    add_paragraph(doc, "Ces textes et actions se répètent sur chaque fiche publiée et sur la fiche prototype Cocktail.", color=MID, size=9)
    add_heading(doc, "En-tête, héro et repères", level=2)
    add_inventory_table(doc, [
        ("Logo", "Multiproduit Mali, accueil", "/ · libellé accessible"),
        ("Navigation", "Toutes les saveurs", "/#marques"),
        ("Navigation", "Contact", "/#contact"),
        ("Lien retour", "Retour", "/#marques"),
        ("Héro — sourcil", "[Marque] / [Saveur]", "Texte dynamique"),
        ("Héro — titre H1", "[Marque] [Saveur]", "Texte dynamique"),
        ("CTA", "Découvrir la saveur", "#signature"),
        ("CTA", "Toutes les saveurs", "/#marques"),
        ("Repère", "Marque", "Valeur : marque du produit"),
        ("Repère", "Saveur", "Tropicoul · valeur : nom du produit"),
        ("Repère", "Variante", "Triplex et Vimto · valeur : nom du produit"),
        ("Repère", "Format", "Canette 330 ml"),
        ("Accessibilité", "Repères produit", "Libellé de section"),
    ])

    add_heading(doc, "Sections éditoriales communes", level=2)
    add_inventory_table(doc, [
        ("Macro — sourcil", "Matière visuelle", "Texte visible"),
        ("Gamme — sourcil", "La gamme", "Texte visible"),
        ("Gamme — titre H2", "Explorer les autres saveurs", "Texte visible"),
        ("Accessibilité", "Fiches produit publiées", "Libellé de navigation"),
        ("CTA final — sourcil", "Multiproduit Mali", "Texte visible"),
        ("CTA final — titre H2", "Poursuivre la découverte.", "Texte visible"),
        ("CTA final", "Toutes les saveurs", "/#marques"),
        ("CTA final", "Nous contacter", "/#contact"),
        ("Pied de page", "Multiproduit Mali SARL", "Texte visible"),
        ("Pied de page", "Retour à l’accueil", "/"),
    ])

    add_heading(doc, "Produits proposés dans « Explorer les autres saveurs »", level=2)
    add_inventory_table(doc, [
        ("Fiche publiée", "Tropicoul Ananas", "/produits/tropicoul-ananas"),
        ("Fiche publiée", "Tropicoul Mangue", "/produits/tropicoul-mangue"),
        ("Fiche publiée", "Tropicoul Orange", "/produits/tropicoul-orange"),
        ("Fiche publiée", "Tropicoul Goyave", "/produits/tropicoul-goyave"),
        ("Fiche publiée", "Tropicoul Tamarin", "/produits/tropicoul-tamarin"),
        ("Fiche publiée", "Triplex Original", "/produits/triplex-original"),
        ("Fiche publiée", "Vimto Sparkling", "/produits/vimto-sparkling"),
        ("Exclusion", "Tropicoul Cocktail", "Absent de cette gamme car prototype"),
    ])

    add_heading(doc, "État indisponible / erreur", level=2)
    add_inventory_table(doc, [
        ("Titre SEO", "Produit indisponible | Multiproduit Mali", "Métadonnée"),
        ("Lien", "Retour aux produits", "/#marques"),
        ("Titre H1", "Ce produit n’est pas disponible.", "Texte visible"),
    ])


def product_alt_rows(p):
    brand = p["brand"]
    name = p["name"]
    if p["slug"] == "vimto-sparkling":
        return [("Textes alternatifs", "Héro : Canette compacte rouge Vimto Sparkling 330 ml au packaging blanc et jaune dans un décor pétillant rouge.\nPackshot : Canette compacte rouge Vimto Sparkling 330 ml, vue de face, avec panneau blanc bordé de jaune et sertissages argentés.\nMacro : Très gros plan du lettrage Vimto rouge et jaune sur le panneau blanc de la canette.\nLifestyle : Quatre adultes autour d’un repas en extérieur, avec une canette Vimto Sparkling au premier plan.")]
    lifestyle = "Visuel abstrait décoratif : texte alternatif vide." if p["slug"] == "tropicoul-cocktail" else f"Univers visuel {brand} {name}."
    return [("Textes alternatifs", f"Héro : Canette {brand} {name} 330 ml.\nPackshot : Canette {brand} {name}, vue de face.\nMacro : texte alternatif vide, image traitée comme décorative.\nLifestyle : {lifestyle}")]


def add_products(doc):
    for idx, p in enumerate(PRODUCTS, start=1):
        add_heading(doc, f"{p['brand']} {p['name']}", level=1, page_break=True)
        add_paragraph(doc, f"Route : /produits/{p['slug']}  ·  Statut : {p['status']}", color=MID, size=9)
        if p["slug"] == "tropicoul-cocktail":
            add_callout(doc, "Décision requise", "Cette fiche est accessible par son URL et depuis la sélection d’accueil, mais elle est exclue de la gamme publiée et signalée noindex. À publier officiellement ou à masquer avant la démonstration.", fill=RED_PALE)

        add_heading(doc, "Textes visibles de la fiche", level=2)
        visible = [
            ("SEO", f"Titre : {p['brand']} {p['name']} | Multiproduit Mali\nDescription : {p['heroLead']}"),
            ("Héro — identité", f"Sourcil : {p['brand']} / {p['name']}\nTitre : {p['brand']} {p['name']}"),
            ("Héro — introduction", p["heroLead"]),
            ("Signature — identité", f"Sourcil : {p['signatureEyebrow']}\nTitre : {p['signatureTitle']}"),
            ("Signature — texte", p["signatureCopy"]),
            ("Produit", f"Titre : {p['productTitle']}\nTexte : {p['productCopy']}"),
            ("Matière visuelle", f"Sourcil : Matière visuelle\nTitre : {p['macroTitle']}\nTexte : {p['macroCopy']}"),
            ("Lifestyle", f"Sourcil : {p['brand']}\nTitre : {p['lifestyleTitle']}\nTexte : {p['lifestyleCopy']}"),
        ]
        add_two_col_table(doc, visible)

        add_heading(doc, "Textes enregistrés dans la fiche produit", level=2)
        add_paragraph(doc, "Champs présents dans le code, non tous affichés dans la mise en page actuelle.", color=MID, size=8.5)
        add_two_col_table(doc, [
            ("Tags", p["tags"]),
            ("Accroche interne", p["headline"]),
            ("Description interne", p["description"]),
            ("Titre bénéfice", p["benefitTitle"]),
            ("Texte bénéfice", p["benefit"]),
        ])

        add_heading(doc, "Textes alternatifs / accessibilité", level=2)
        add_two_col_table(doc, product_alt_rows(p))
        add_paragraph(doc, "Statut éditorial : À VALIDER", bold=True, color=MID, size=8.5)


def add_links(doc):
    add_heading(doc, "Matrice des boutons et destinations", level=1, page_break=True)
    add_callout(doc, "Critère de préparation", "Chaque libellé doit annoncer honnêtement l’action effectuée. Les destinations provisoires sont signalées afin d’éviter un effet de lien cassé ou trompeur pendant la démonstration.", fill=PALE)
    rows = [
        ("Accueil · logo", "Multiproduit Mali, accueil", "#accueil · fonctionnel"),
        ("Accueil · menu", "Notre entreprise", "#entreprise · fonctionnel"),
        ("Accueil · menu", "Nos marques", "#marques · fonctionnel"),
        ("Accueil · menu", "Actualités", "#actualites · fonctionnel"),
        ("Accueil · menu", "Contact", "#contact · fonctionnel"),
        ("Accueil · action", "FR", "#contact · provisoire / incohérent"),
        ("Accueil · action", "Recherche", "#actualites · provisoire / pas de recherche"),
        ("Héro", "Devenir partenaire", "#contact · fonctionnel"),
        ("Héro", "Découvrir nos produits", "#marques · fonctionnel"),
        ("Entreprise", "En savoir plus", "#marques · fonctionnel, mais destination générique"),
        ("Marques", "Découvrir les produits", "#marques · renvoi à soi-même"),
        ("Sélection", "Découvrir [marque] [saveur]", "/produits/[slug] · fonctionnel"),
        ("Actualités", "Toutes les actualités", "#contact · provisoire"),
        ("Actualités", "Lire : [titre]", "#contact · provisoire"),
        ("Raison d’être", "Ce qui nous anime", "#contact · fonctionnel, destination générique"),
        ("Contact", "Nous contacter", "mailto:contact@multiproduitmali.ml · à confirmer"),
        ("Pied de page", "Retour en haut ↑", "#accueil · fonctionnel"),
        ("Fiche produit · logo", "Multiproduit Mali, accueil", "/ · fonctionnel"),
        ("Fiche produit", "Retour", "/#marques · fonctionnel"),
        ("Fiche produit", "Découvrir la saveur", "#signature · fonctionnel"),
        ("Fiche produit", "Toutes les saveurs", "/#marques · fonctionnel"),
        ("Fiche produit", "Nous contacter", "/#contact · fonctionnel"),
        ("Erreur produit", "Retour aux produits", "/#marques · fonctionnel"),
    ]
    add_inventory_table(doc, rows, widths=(1.55, 2.25, 2.7), headers=("Emplacement", "Bouton / lien", "Destination et état"))
    add_revision_box(doc, "Nouveaux libellés et destinations validés")


def add_seo_accessibility(doc):
    add_heading(doc, "SEO, accessibilité et microtextes", level=1, page_break=True)
    add_heading(doc, "Métadonnées générales", level=2)
    add_two_col_table(doc, [
        ("Titre du site", "Multiproduit Mali | Tropicoul, Triplex et Vimto"),
        ("Meta description", "Multiproduit Mali développe et distribue les marques Tropicoul, Triplex et Vimto au Mali et auprès de partenaires internationaux."),
        ("Texte alternatif social", "Multiproduit Mali"),
        ("Fiche produit", "[Marque] [Saveur] | Multiproduit Mali"),
        ("Description produit", "Reprise automatique du texte d’introduction de la fiche"),
        ("Prototype Cocktail", "Page marquée noindex"),
        ("Page indisponible", "Produit indisponible | Multiproduit Mali"),
    ])

    add_heading(doc, "Libellés accessibles et textes non visuels", level=2)
    add_inventory_table(doc, [
        ("Lien d’évitement", "Aller au contenu principal", "Accueil"),
        ("Navigation", "Navigation principale", "En-tête accueil"),
        ("Menu mobile", "Ouvrir la navigation", "Commande mobile"),
        ("Menu mobile", "Navigation mobile", "Conteneur de navigation"),
        ("Logo", "Multiproduit Mali, accueil", "Accueil et fiches produit"),
        ("Recherche", "Rechercher sur le site", "Action provisoire"),
        ("Animation", "Mettre en pause l’animation des produits", "État lecture"),
        ("Animation", "Reprendre l’animation des produits", "État pause"),
        ("Produits", "Sélection de produits Multiproduit Mali", "Section accueil"),
        ("Produit", "Découvrir [marque] [saveur]", "Lien de fiche"),
        ("Actualité", "Lire : [titre]", "Flèche de carte"),
        ("Fiche", "Navigation produit", "En-tête produit"),
        ("Fiche", "Repères produit", "Section de faits"),
        ("Fiche", "Fiches produit publiées", "Navigation de gamme"),
    ])
    add_callout(doc, "À valider", "Les textes alternatifs génériques décrivent surtout la canette ou l’univers. Avant publication, vérifier que chaque image informative possède une description spécifique et que les images purement décoratives conservent un texte alternatif vide.", fill=AMBER)
def add_recommendation_framework(doc):
    add_heading(doc, "Cadre de révision proposé", level=1, page_break=True)
    add_paragraph(doc, "Le document inventorie l’existant. La validation finale peut suivre ce processus court afin de rendre le site prêt pour la démonstration.")
    steps = [
        "Confirmer l’identité légale et les coordonnées publiques.",
        "Décider du statut de Tropicoul Cocktail : publié ou masqué.",
        "Valider la promesse institutionnelle de la page d’accueil.",
        "Valider les textes de chaque marque et chaque saveur sans ajouter d’allégation non prouvée.",
        "Remplacer les liens provisoires par des destinations cohérentes.",
        "Fournir trois actualités réelles ou masquer la rubrique pour la démonstration.",
        "Valider les métadonnées SEO, les textes alternatifs et les coordonnées de contact.",
        "Relire le site sur ordinateur et mobile avant la session client.",
    ]
    for step in steps:
        add_number(doc, step)

    add_heading(doc, "Règles de validation texte", level=2)
    add_bullet(doc, "Un titre de section doit exprimer une idée unique et compréhensible hors contexte.")
    add_bullet(doc, "Un bouton doit commencer par un verbe clair et mener exactement à l’action annoncée.")
    add_bullet(doc, "Une fiche produit doit différencier l’univers de la saveur sans inventer de caractéristique produit.")
    add_bullet(doc, "Les termes « malien », « développé », « distribué », « partenaire » et « international » doivent correspondre à la réalité commerciale validée.")
    add_bullet(doc, "Les formulations trop proches entre le Héro, la signature et les champs internes doivent être simplifiées pour éviter la répétition.")
    add_bullet(doc, "Le texte final doit rester lisible en situation de démonstration : titres courts, paragraphes de deux phrases maximum, CTA de deux à quatre mots.")
    add_revision_box(doc, "Commentaires généraux du client")


def add_prompt(doc):
    add_heading(doc, "Prompt prêt à utiliser dans ChatGPT", level=1, page_break=True)
    add_callout(doc, "Utilisation", "Joindre ce fichier à ChatGPT, puis copier-coller le prompt ci-dessous. Remplacer les champs [À FOURNIR] lorsque les informations officielles sont disponibles.", fill=PALE)

    prompt_lines = [
        "Tu es directeur éditorial senior spécialisé dans les marques de grande consommation et les boissons en Afrique de l’Ouest.",
        "",
        "CONTEXTE",
        "Je prépare la démonstration client du site de Multiproduit Mali. Le nom légal exact doit encore être confirmé : « Multiproduit Mali », « Multiproduit Mali SARL » ou « Mali Multi Produit ». L’entreprise est présentée dans le site comme développant et distribuant Tropicoul, Triplex et Vimto. Ne transforme pas cette formulation en affirmation de fabrication, de propriété de marque, de licence ou d’exportation si le document ne le confirme pas.",
        "",
        "Portefeuille affiché :",
        "- Tropicoul : Ananas, Mangue, Orange, Goyave, Tamarin et Cocktail ;",
        "- Triplex : Original ;",
        "- Vimto : Sparkling ;",
        "- format actuellement affiché : canette 330 ml.",
        "",
        "Le produit Tropicoul Cocktail est encore au statut prototype : sa page est noindex, il apparaît sur l’accueil, mais il est absent de la gamme publiée. Signale cette décision comme prioritaire.",
        "",
        "PUBLICS",
        "1. Le client qui doit valider le site.",
        "2. Les consommateurs maliens et régionaux.",
        "3. Les distributeurs et partenaires commerciaux potentiels.",
        "",
        "TON ATTENDU",
        "Moderne, chaleureux, malien, premium, énergique et crédible. Le style doit être concret, naturel et commercial, sans slogans génériques. Les titres doivent rester courts et puissants. Les paragraphes doivent comporter au maximum deux phrases. Les CTA doivent tenir en deux à quatre mots.",
        "",
        "CONTRAINTES IMPÉRATIVES",
        "- Ne crée aucune allégation santé, nutrition, performance, hydratation ou composition.",
        "- N’invente aucun ingrédient, certificat, chiffre, pays distribué, date, distinction ou partenariat.",
        "- N’affirme pas que Multiproduit Mali fabrique, exporte ou possède une marque sans preuve explicite.",
        "- Ne modifie pas le nom légal, l’adresse, le téléphone ou l’e-mail : marque toute donnée manquante par [À FOURNIR] ou [À CONFIRMER].",
        "- Préserve l’univers visuel propre à chaque produit : solaire pour Ananas, doré pour Mangue, circulaire et cobalt pour Orange, botanique rose et vert pour Goyave, bleu abstrait pour Cocktail, végétal ambré pour Tamarin, noir/acier/rouge pour Triplex, rétro rouge/blanc/jaune pour Vimto.",
        "- Évite la répétition entre l’introduction, la signature, le focus produit, la matière visuelle et la scène lifestyle.",
        "- Un bouton doit annoncer précisément sa destination. Signale tout lien incohérent ou provisoire.",
        "- Rédige d’abord en français. N’ajoute une version anglaise qu’après validation de la version française.",
        "",
        "MISSION",
        "À partir de l’inventaire éditorial joint :",
        "1. audite tous les textes, sans en oublier ;",
        "2. repère les incohérences, répétitions, formulations trop génériques et promesses non prouvées ;",
        "3. propose une version finale prête pour une démonstration client ;",
        "4. corrige les libellés des boutons pour qu’ils correspondent aux destinations ;",
        "5. propose soit une destination réelle, soit le retrait des actions provisoires ;",
        "6. harmonise l’usage de la marque et signale le nom légal comme [À CONFIRMER] tant qu’il n’est pas fourni ;",
        "7. marque toutes les informations nécessaires mais absentes avec [À FOURNIR] ;",
        "8. signale séparément toute phrase qui exige une validation juridique, commerciale ou produit.",
        "",
        "FORMAT DE SORTIE",
        "Commence par une synthèse de dix décisions maximum. Puis fournis un tableau avec les colonnes :",
        "Page / route | Section | Élément | Texte actuel | Texte proposé | Justification courte | Validation requise | Destination du bouton",
        "",
        "Regroupe le tableau dans cet ordre : page d’accueil, navigation, actualités, contact, pied de page, structure commune des fiches produit, puis chaque produit séparément. Termine par :",
        "- la liste des informations [À FOURNIR] ;",
        "- la liste des liens à corriger ;",
        "- une checklist finale « prêt pour démonstration » ;",
        "- uniquement après validation, une proposition de traduction anglaise fidèle.",
        "",
        "IMPORTANT",
        "Ne résume pas l’inventaire et ne saute aucun élément. Si une formulation actuelle est déjà bonne, conserve-la et indique « conserver ». Si une décision dépend du client, ne tranche pas à sa place : propose au maximum deux options et indique clairement le choix à valider.",
    ]

    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table, color=LINE, size="6")
    cell = table.cell(0, 0)
    set_cell_width(cell, 6.5)
    set_cell_shading(cell, "F7F8F6")
    set_cell_margins(cell, top=160, start=170, bottom=160, end=170)
    cell.paragraphs[0]._element.getparent().remove(cell.paragraphs[0]._element)
    for line in prompt_lines:
        p = cell.add_paragraph()
        p.paragraph_format.space_after = Pt(3 if line else 5)
        p.paragraph_format.line_spacing = 1.05
        r = p.add_run(line if line else " ")
        r.font.name = "Consolas"
        r.font.size = Pt(8.1)
        r.font.color.rgb = RGBColor.from_string(INK)
        if line in {"CONTEXTE", "PUBLICS", "TON ATTENDU", "CONTRAINTES IMPÉRATIVES", "MISSION", "FORMAT DE SORTIE", "IMPORTANT"}:
            r.bold = True
            r.font.color.rgb = RGBColor.from_string(GREEN)


def add_final_checklist(doc):
    add_heading(doc, "Checklist de sortie — prêt pour démonstration", level=1, page_break=True)
    checks = [
        "Nom légal et graphie de la société validés.",
        "E-mail, téléphone, adresse et canal de contact testés.",
        "Promesse institutionnelle et périmètre d’activité approuvés.",
        "Statut de Tropicoul Cocktail décidé et appliqué.",
        "Tous les textes des fiches produit validés par marque.",
        "Allégations produit, commerciales et juridiques approuvées.",
        "Bouton FR activé comme langue ou retiré.",
        "Recherche activée ou icône retirée.",
        "Actualités réelles publiées ou rubrique masquée.",
        "Tous les CTA testés et alignés avec leur destination.",
        "Métadonnées SEO et textes alternatifs validés.",
        "Mentions légales et confidentialité prévues avant diffusion publique.",
        "Relecture ordinateur et mobile terminée sans texte coupé.",
        "Démonstration répétée avec une connexion lente et un rechargement complet.",
    ]
    for item in checks:
        add_bullet(doc, f"À valider — {item}")
    doc.add_paragraph()
    add_callout(doc, "Conclusion", "Une fois les décisions signalées dans ce document intégrées au site et les liens provisoires corrigés, la démonstration pourra présenter un récit de marque cohérent, crédible et commercialement clair.", fill=PALE)
    add_revision_box(doc, "Validation finale / date / responsable")


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = setup_document()
    add_cover(doc)
    add_context(doc)
    add_vigilance(doc)
    add_home(doc)
    add_product_shell(doc)
    add_products(doc)
    add_links(doc)
    add_seo_accessibility(doc)
    add_recommendation_framework(doc)
    add_prompt(doc)
    add_final_checklist(doc)
    # Expose a first-row marker to Word and screen readers on layout tables too,
    # without making long one-row blocks repeat across page boundaries.
    for table in doc.tables:
        if table.rows:
            tr_pr = table.rows[0]._tr.get_or_add_trPr()
            if tr_pr.find(qn("w:tblHeader")) is None:
                set_repeat_table_header(table.rows[0], repeat=False)
    doc.save(OUT)
    print(OUT)


if __name__ == "__main__":
    build()
