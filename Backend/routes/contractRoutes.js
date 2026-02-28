const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const PDFDocument = require('pdfkit');

// GET all contracts
router.get('/', async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('contract_type')
      .populate('id_boutique')
      .populate('id_client')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single contract
router.get('/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('contract_type')
      .populate('id_boutique')
      .populate('id_client');
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create contract
router.post('/', async (req, res) => {
  try {
    const contract = new Contract(req.body);
    await contract.save();
    const populated = await Contract.findById(contract._id)
      .populate('contract_type')
      .populate('id_boutique')
      .populate('id_client');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update contract
router.put('/:id', async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('contract_type')
      .populate('id_boutique')
      .populate('id_client');
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json(contract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE contract
router.delete('/:id', async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json({ message: 'Contrat supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET contract PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('contract_type')
      .populate('id_boutique')
      .populate('id_client');
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });

    const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true });

    const filename = `Contrat_${(contract.nom_entreprise || 'export').replace(/\s/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    doc.pipe(res);

    // --- Header ---
    doc.rect(0, 0, doc.page.width, 100).fill('#1a1a2e');
    doc.fillColor('#C9A962').fontSize(24).font('Helvetica-Bold')
      .text('TANA CENTER', 50, 28, { align: 'center' });
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica')
      .text('CONTRAT DE LOCATION COMMERCIALE', 50, 64, { align: 'center' });

    doc.fillColor('#333333');
    let y = 118;

    // --- Contract type ---
    const typeName = contract.contract_type ? contract.contract_type.contract_type_name : 'Non spécifié';
    doc.fontSize(10).font('Helvetica-Bold').text(`Type de contrat : `, 50, y, { continued: true });
    doc.font('Helvetica').text(typeName);
    y += 22;

    // --- Parties ---
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a1a2e').text('ENTRE LES SOUSSIGNÉS :', 50, y);
    y += 18;
    doc.font('Helvetica').fontSize(9).fillColor('#333333');
    doc.text('TANA CENTER SARL, société à responsabilité limitée, dont le siège est situé Avenue de l\'Indépendance, Antananarivo 101.', 50, y, { width: 500 });
    y += 13;
    doc.font('Helvetica-Oblique').text('Ci-après dénommée "LE BAILLEUR"', 50, y);
    y += 18;
    doc.font('Helvetica').text('ET :', 50, y);
    y += 14;
    doc.font('Helvetica-Bold').text(contract.nom_entreprise || '—', 50, y);
    y += 13;
    doc.font('Helvetica').text(`Représentée par : ${contract.nom_client || '—'}`, 50, y);
    y += 13;
    doc.font('Helvetica-Oblique').text('Ci-après dénommée "LE LOCATAIRE"', 50, y);
    y += 22;

    // --- Separator ---
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#C9A962').lineWidth(1.5).stroke();
    y += 14;

    // --- Article 1 : Objet ---
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a1a2e').text('ARTICLE 1 — OBJET', 50, y);
    y += 16;
    doc.font('Helvetica').fontSize(9).fillColor('#333333');
    doc.text('Le Bailleur donne en location au Locataire un local commercial situé dans le centre commercial TANA CENTER.', 50, y, { width: 500 });
    y += 22;

    // --- Local details table ---
    doc.font('Helvetica-Bold').fontSize(9).text('DÉSIGNATION DU LOCAL :', 50, y);
    y += 16;

    const tableX = 60;
    const colW = 220;
    const rowH = 19;
    const rows = [
      ['Numéro', contract.numero || '—'],
      ['Étage', contract.etage ? `${contract.etage}${contract.etage === 1 ? 'er' : 'ème'} étage` : '—'],
      ['Surface', contract.surface ? `${contract.surface} m²` : '—']
    ];
    doc.font('Helvetica').fontSize(9);
    rows.forEach(([label, value]) => {
      doc.rect(tableX, y, colW, rowH).strokeColor('#ddd').stroke();
      doc.rect(tableX + colW, y, colW, rowH).strokeColor('#ddd').stroke();
      doc.fillColor('#666').text(label, tableX + 6, y + 5);
      doc.fillColor('#333').text(value, tableX + colW + 6, y + 5);
      y += rowH;
    });
    y += 14;

    // --- Article 2 : Durée ---
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a1a2e').text('ARTICLE 2 — DURÉE', 50, y);
    y += 16;
    doc.font('Helvetica').fontSize(9).fillColor('#333333');
    const dateDebut = new Date(contract.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const dateFin = new Date(contract.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Date de début : ${dateDebut}`, 60, y); y += 13;
    doc.text(`Date de fin : ${dateFin}`, 60, y); y += 20;

    // --- Article 3 : Loyer ---
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a1a2e').text('ARTICLE 3 — LOYER', 50, y);
    y += 16;
    doc.font('Helvetica').fontSize(9).fillColor('#333333');
    const loyerFormatted = contract.loyer ? contract.loyer.toLocaleString('fr-FR') : '0';
    doc.text(`Le loyer mensuel est fixé à : ${loyerFormatted} Ariary`, 60, y); y += 13;
    doc.text('Ce loyer est payable d\'avance, le premier jour de chaque mois.', 60, y); y += 20;

    // --- Article 4 : Charges ---
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a1a2e').text('ARTICLE 4 — CHARGES', 50, y);
    y += 16;
    doc.font('Helvetica').fontSize(9).fillColor('#333333');
    doc.text('En sus du loyer : Charges communes 5% | Électricité selon consommation | Eau forfait inclus', 60, y, { width: 480 });
    y += 22;

    // --- Signatures ---
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#C9A962').lineWidth(1.5).stroke();
    y += 14;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a1a2e').text('SIGNATURES', 50, y);
    y += 16;
    doc.font('Helvetica').fontSize(9).fillColor('#333333');
    const dateGeneration = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Fait en deux exemplaires originaux, à Antananarivo, le ${dateGeneration}`, 50, y);
    y += 28;

    doc.text('LE BAILLEUR', 80, y);
    doc.text('LE LOCATAIRE', 380, y);
    y += 35;
    doc.moveTo(60, y).lineTo(220, y).strokeColor('#333').lineWidth(0.5).stroke();
    doc.moveTo(360, y).lineTo(520, y).strokeColor('#333').lineWidth(0.5).stroke();
    y += 5;
    doc.fontSize(8).text('TANA CENTER SARL', 80, y);
    doc.text(contract.nom_entreprise || '—', 380, y);

    // --- Footer ---
    const pageHeight = doc.page.height;
    doc.fontSize(7).fillColor('#999')
      .text(`Document généré le ${dateGeneration} — TANA CENTER`, 50, pageHeight - 35, { align: 'center', width: 500 });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
