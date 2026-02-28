const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const { generateCurrentMonthPayments, checkOverduePayments } = require('../utils/paymentGenerator');
const { sendPaymentConfirmation, sendOverdueReminder, sendInvoiceByEmail } = require('../utils/emailService');
const { generateInvoicePDF } = require('../utils/pdfInvoiceGenerator');
const Notification = require('../models/Notification');

const MOIS_NOMS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

// GET all payments (with populate)
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({ path: 'id_contract', populate: [{ path: 'contract_type' }, { path: 'id_client' }] })
      .populate('id_boutique')
      .sort({ annee: -1, mois: -1, createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET payments by month/year
router.get('/month/:mois/:annee', async (req, res) => {
  try {
    const payments = await Payment.find({
      mois: Number(req.params.mois),
      annee: Number(req.params.annee)
    })
      .populate({ path: 'id_contract', populate: [{ path: 'contract_type' }, { path: 'id_client' }] })
      .populate('id_boutique')
      .sort({ status: 1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET payments by status
router.get('/status/:status', async (req, res) => {
  try {
    const payments = await Payment.find({ status: req.params.status })
      .populate({ path: 'id_contract', populate: [{ path: 'contract_type' }, { path: 'id_client' }] })
      .populate('id_boutique')
      .sort({ annee: -1, mois: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET check overdue payments
router.get('/check-overdue/run', async (req, res) => {
  try {
    const result = await checkOverduePayments();
    res.json({ message: 'Verification terminee', ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single payment
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'id_contract', populate: [{ path: 'contract_type' }, { path: 'id_client' }] })
      .populate('id_boutique');
    if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET invoice PDF download
router.get('/:id/invoice-pdf', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'id_contract', populate: [{ path: 'contract_type' }, { path: 'id_client' }] })
      .populate('id_boutique');
    if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });

    const contract = payment.id_contract;
    const boutique = payment.id_boutique;
    const user = contract?.id_client;

    const pdfBuffer = await generateInvoicePDF(payment, boutique, contract, user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${payment.facture_numero}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST generate current month payments for all active contracts
router.post('/generate-current-month', async (req, res) => {
  try {
    const result = await generateCurrentMonthPayments();
    res.json({ message: 'Generation terminee', ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST auto-generate all missing payments from contract start to current month
router.post('/auto-generate-all', async (req, res) => {
  try {
    const contracts = await Contract.find({ statut: 'actif' }).populate('id_boutique');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    let totalCreated = 0, totalSkipped = 0;

    for (const contract of contracts) {
      const boutiqueId = contract.id_boutique?._id || contract.id_boutique;
      if (!boutiqueId) { totalSkipped++; continue; }

      const debut = new Date(contract.date_debut);
      const fin = new Date(contract.date_fin);

      let y = debut.getFullYear();
      let m = debut.getMonth() + 1;

      while (y < currentYear || (y === currentYear && m <= currentMonth)) {
        const dateEcheance = new Date(y, m - 1, 5);

        if (dateEcheance >= debut && dateEcheance <= fin) {
          try {
            const existing = await Payment.findOne({ id_contract: contract._id, mois: m, annee: y });
            if (!existing) {
              const status = dateEcheance < now ? 'en_retard' : 'en_attente';
              await Payment.create({
                id_contract: contract._id,
                id_boutique: boutiqueId,
                mois: m,
                annee: y,
                montant: contract.loyer,
                date_echeance: dateEcheance,
                status
              });
              totalCreated++;
            } else {
              totalSkipped++;
            }
          } catch (err) {
            if (err.code === 11000) { totalSkipped++; }
          }
        }

        m++;
        if (m > 12) { m = 1; y++; }
      }
    }

    res.json({ created: totalCreated, skipped: totalSkipped });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT mark payment as paid
router.put('/:id/mark-paid', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'paye', date_paiement: new Date() },
      { new: true }
    )
      .populate({ path: 'id_contract', populate: { path: 'id_client' } })
      .populate('id_boutique');
    if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });

    const boutique = payment.id_boutique;
    const user = payment.id_contract?.id_client;

    // Envoyer email de confirmation
    if (boutique || user) {
      const emailResult = await sendPaymentConfirmation(payment, boutique, user);
      if (emailResult.success) {
        payment.email_sent = true;
        payment.email_sent_date = new Date();
        await payment.save();
      }
    }

    // Notifier l'admin du paiement reçu
    const nomMois = MOIS_NOMS[(payment.mois || 1) - 1] || payment.mois;
    await Notification.create({
      titre: 'Loyer payé',
      message: `${boutique?.nom || 'Une boutique'} a réglé son loyer de ${nomMois} ${payment.annee} (${payment.montant?.toLocaleString('fr-FR')} Ar)`,
      type: 'paiement',
      lien: '/admin/loyers',
      destinataire_role: 'admin'
    });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST send overdue reminder email
router.post('/:id/send-reminder', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'id_contract', populate: { path: 'id_client' } })
      .populate('id_boutique');
    if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });

    const boutique = payment.id_boutique;
    const user = payment.id_contract?.id_client;
    const emailResult = await sendOverdueReminder(payment, boutique, user);

    if (emailResult.success) {
      payment.email_sent = true;
      payment.email_sent_date = new Date();
      await payment.save();
    }

    res.json(emailResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST send invoice by email with PDF attachment
router.post('/:id/send-invoice', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'id_contract', populate: { path: 'id_client' } })
      .populate('id_boutique');
    if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });

    const contract = payment.id_contract;
    const boutique = payment.id_boutique;
    const user = contract?.id_client;

    const pdfBuffer = await generateInvoicePDF(payment, boutique, contract, user);
    const result = await sendInvoiceByEmail(payment, boutique, user, pdfBuffer);

    if (result.success) {
      payment.email_sent = true;
      payment.email_sent_date = new Date();
      await payment.save();
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });
    res.json({ message: 'Paiement supprime' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
