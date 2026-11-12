import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        # Top header
        self.drawString(36, 810, "HIAGO iPHONES ERP — ROTEIRO DE TESTES & HOMOLOGAÇÃO")
        self.drawRightString(559, 810, "Ambiente: Produção")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 804, 559, 804)

        # Bottom footer
        self.line(36, 38, 559, 38)
        self.drawString(36, 26, "Documento de Controle e Auditoria Operacional")
        self.drawRightString(559, 26, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()

def build_pdf(filename="docs/ROTEIRO_TESTES_HOMOLOGACAO.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#0f172a')
    )

    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569')
    )

    block_style = ParagraphStyle(
        'BlockHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.white
    )

    test_title_style = ParagraphStyle(
        'TestTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#0f172a')
    )

    path_style = ParagraphStyle(
        'PathStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#1d4ed8')
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )

    expected_style = ParagraphStyle(
        'ExpectedStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#166534')
    )

    note_label_style = ParagraphStyle(
        'NoteLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.HexColor('#64748b')
    )

    story = []

    # Title & Subtitle
    story.append(Spacer(1, 4))
    story.append(Paragraph("ROTEIRO DE TESTES OPERACIONAIS E HOMOLOGAÇÃO", title_style))
    story.append(Paragraph("Validação completa: Caixa, Clientes, Entrada de Estoque, Vendas iPhone/Produtos, Assistência Técnica e Estorno", subtitle_style))
    story.append(Spacer(1, 8))

    # Meta Table (Responsavel, Data, Loja)
    meta_data = [
        [
            Paragraph("<b>Responsável pelo Teste:</b> ___________________________", body_style),
            Paragraph("<b>Data:</b> ___/___/2026", body_style),
            Paragraph("<b>Unidade:</b> _________________", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[240, 130, 153])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    tests = [
        # BLOCO 1
        ("BLOCO 1: PREPARAÇÃO INICIAL & CONTROLE DE CAIXA", [
            {
                "id": "1.1",
                "title": "Abertura do Caixa Diário",
                "path": "Menu Lateral ➔ Gestão ➔ Controle de Caixa",
                "action": "Clicar em <b>\"Abrir Caixa\"</b>, informar saldo inicial em dinheiro (ex: R$ 100,00), selecionar operador e confirmar abertura.",
                "expected": "Caixa fica com status <b>\"Aberto\"</b>, exibe saldo inicial e desbloqueia lançamento de vendas do dia."
            }
        ]),
        # BLOCO 2
        ("BLOCO 2: CADASTRO DE CLIENTES", [
            {
                "id": "2.1",
                "title": "Cadastro e Consulta de Cliente",
                "path": "Menu Lateral ➔ Cadastros ➔ Clientes",
                "action": "Clicar em <b>\"Novo Cliente\"</b>, cadastrar Nome (<i>Cliente Teste</i>), WhatsApp (<i>77 99999-0000</i>) e CPF. Salvar e pesquisar na lista.",
                "expected": "Cliente registrado com sucesso e prontamente selecionável nas telas de PDV e Assistência Técnica."
            }
        ]),
        # BLOCO 3
        ("BLOCO 3: ENTRADA DE ESTOQUE (IPHONES E PRODUTOS)", [
            {
                "id": "3.1",
                "title": "Cadastro de iPhone por IMEI",
                "path": "Menu Lateral ➔ Estoque & Vitrine ➔ Aparelhos",
                "action": "Clicar em <b>\"Cadastrar Aparelho\"</b>. Informar: iPhone 13 128GB, Bateria 89%, Custo R$ 2.200, Venda R$ 3.100 e IMEI único (ex: 359876543210123). Salvar.",
                "expected": "Aparelho inserido com status <b>\"Disponível\"</b> e IMEI pesquisável na vitrine de estoque."
            },
            {
                "id": "3.2",
                "title": "Cadastro de Acessório / Produto Físico",
                "path": "Menu Lateral ➔ Estoque & Vitrine ➔ Produtos / Acessórios",
                "action": "Clicar em <b>\"Cadastrar Produto\"</b>. Cadastrar: Fonte 20W USB-C, SKU <b>FNT-20W</b>, Venda R$ 120,00 e Estoque Inicial: <b>10 un</b>.",
                "expected": "Produto registrado no catálogo com saldo de <b>10 un</b> e registro de saldo inicial nas movimentações."
            }
        ]),
        # BLOCO 4
        ("BLOCO 4: OPERAÇÃO COMERCIAL / FRENTE DE CAIXA (PDV)", [
            {
                "id": "4.1",
                "title": "Venda de iPhone (Baixa por IMEI)",
                "path": "Menu Lateral ➔ Vendas & PDV ➔ Nova Venda",
                "action": "Selecionar o cliente cadastrado, buscar o iPhone pelo IMEI, escolher pagamento (Pix/Cartão) e clicar em <b>\"Finalizar Venda\"</b>.",
                "expected": "Venda concluída com comprovante. Status do iPhone muda para <b>\"Vendido\"</b> no estoque e entrada é computada no Caixa."
            },
            {
                "id": "4.2",
                "title": "Venda de Acessório (Baixa Quantitativa)",
                "path": "Menu Lateral ➔ Vendas & PDV ➔ Nova Venda",
                "action": "Iniciar nova venda, adicionar <b>2 unidades</b> da Fonte 20W USB-C e finalizar em Dinheiro. Conferir tela de estoque de produtos.",
                "expected": "Saldo da Fonte 20W é decrementado imediatamente de 10 para <b>8 unidades</b> sem erros."
            }
        ]),
        # BLOCO 5
        ("BLOCO 5: ASSISTÊNCIA TÉCNICA E ORDENS DE SERVIÇO (OS)", [
            {
                "id": "5.1",
                "title": "Abertura de Ordem de Serviço",
                "path": "Menu Lateral ➔ Serviços ➔ Assistência Técnica",
                "action": "Clicar em <b>\"Nova OS\"</b>. Vincular cliente, modelo (iPhone 11), defeito relatado (Display quebrado), preencher checklist e salvar.",
                "expected": "OS gerada com código sequencial (ex: OS-0001) e status inicial <b>\"Aberta\"</b>."
            },
            {
                "id": "5.2",
                "title": "Orçamento, Peças e Conclusão do Reparo",
                "path": "Assistência Técnica ➔ Detalhe da OS",
                "action": "Adicionar serviço/peça (Display R$ 450,00). Avançar status: <b>\"Aprovado\"</b> ➔ <b>\"Em Manutenção\"</b> ➔ <b>\"Pronto / Concluído\"</b>.",
                "expected": "Histórico gravado, técnicos atualizados e valor total pronto para faturamento na entrega."
            },
            {
                "id": "5.3",
                "title": "Entrega e Faturamento da OS",
                "path": "Assistência Técnica ➔ Detalhe da OS",
                "action": "Clicar em <b>\"Entregar Aparelho / Finalizar Pagamento\"</b>, escolher método de recebimento e confirmar entrega.",
                "expected": "OS marcada como <b>\"Entregue\"</b>, termo de garantia gerado e receita lançada no Caixa."
            }
        ]),
        # BLOCO 6
        ("BLOCO 6: INTEGRIDADE OPERACIONAL E ESTORNO", [
            {
                "id": "6.1",
                "title": "Estorno de Venda e Devolução ao Estoque",
                "path": "Menu Lateral ➔ Vendas & PDV ➔ Histórico de Vendas",
                "action": "Localizar a venda do iPhone, clicar em <b>\"Cancelar / Estornar Venda\"</b>, informar motivo (mínimo 5 caracteres) e confirmar.",
                "expected": "Venda cancelada, iPhone retorna para status <b>\"Disponível\"</b> no estoque e saída de estorno registrada no caixa."
            }
        ]),
        # BLOCO 7
        ("BLOCO 7: FECHAMENTO DE CAIXA & AUDITORIA", [
            {
                "id": "7.1",
                "title": "Conferência e Fechamento do Caixa",
                "path": "Menu Lateral ➔ Gestão ➔ Controle de Caixa",
                "action": "Conferir os totais por método (Dinheiro, Cartão, Pix). Clicar no botão <b>\"Fechar Caixa\"</b>.",
                "expected": "Caixa encerrado com valores consolidados, bloqueando novas vendas sem reabertura."
            }
        ])
    ]

    for block_name, test_items in tests:
        # Block Header Table
        block_t = Table([[Paragraph(block_name, block_style)]], colWidths=[523])
        block_t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(Spacer(1, 4))
        story.append(block_t)
        story.append(Spacer(1, 4))

        for t in test_items:
            test_content = []

            # Row 1: Title + Path
            header_cell = [
                Paragraph(f"<b>{t['id']} {t['title']}</b>", test_title_style),
                Paragraph(t['path'], path_style)
            ]
            row1_table = Table([header_cell], colWidths=[240, 273])
            row1_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ]))

            # Action
            action_p = Paragraph(f"<b>Como Testar:</b> {t['action']}", body_style)

            # Expected
            expected_cell = Table([[Paragraph(f"<b>Resultado Esperado:</b> {t['expected']}", expected_style)]], colWidths=[513])
            expected_cell.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#86efac')),
                ('LEFTPADDING', (0,0), (-1,-1), 6),
                ('RIGHTPADDING', (0,0), (-1,-1), 6),
                ('TOPPADDING', (0,0), (-1,-1), 3),
                ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ]))

            # Eval & Error Area
            check_box_text = Paragraph(
                "<b>Status:</b><br/>"
                "[ &nbsp; ] <b>OK Aprovado</b><br/>"
                "[ &nbsp; ] <b>NOK (Erro)</b>",
                body_style
            )

            error_lines_text = Paragraph(
                "<b>Anotação de Falha / Erro observado:</b><br/>"
                "___________________________________________________________________________________<br/>"
                "___________________________________________________________________________________",
                note_label_style
            )

            eval_table = Table([[check_box_text, error_lines_text]], colWidths=[120, 393])
            eval_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 2),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ]))

            # Card Container Table
            card_elements = [
                [row1_table],
                [Spacer(1, 2)],
                [action_p],
                [Spacer(1, 2)],
                [expected_cell],
                [Spacer(1, 2)],
                [eval_table]
            ]
            card_table = Table(card_elements, colWidths=[517])
            card_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.white),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING', (0,0), (-1,-1), 6),
                ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ]))

            story.append(KeepTogether([card_table, Spacer(1, 4)]))

    # FINAL AUDIT VERDICT
    verdict_elements = [
        [Paragraph("<b>PARECER FINAL DA HOMOLOGAÇÃO</b>", test_title_style)],
        [Spacer(1, 4)],
        [
            Table([
                [
                    Paragraph("[ &nbsp; ] <b>APROVADO PARA PRODUÇÃO</b>", body_style),
                    Paragraph("[ &nbsp; ] <b>BLOQUEADO / REQUER AJUSTES</b>", body_style)
                ],
                [
                    Paragraph("<br/><br/>____________________________________________<br/><b>Assinatura do Testador / Responsável</b>", body_style),
                    Paragraph("<br/><br/>____/____/2026<br/><b>Data da Avaliação</b>", body_style)
                ]
            ], colWidths=[270, 243], style=[
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ])
        ]
    ]
    verdict_table = Table(verdict_elements, colWidths=[517])
    verdict_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#0f172a')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))

    story.append(Spacer(1, 6))
    story.append(KeepTogether([verdict_table]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF generated successfully:", filename)

if __name__ == '__main__':
    build_pdf()

