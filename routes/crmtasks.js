const express = require("express");
const router = express.Router();
const { generateHashedPassword, comparePassword } = require("../utils/bcrypt");
const ServiceRequest = require("../models/serviceRequests");
const Leads = require("../models/leads");
const Contacts = require("../models/contacts");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

router.post("/service-requests/add", async (req, res) => {
  try {
    const requestId = Math.floor(Math.random() * 100000 + 1);
    const data = { ...req.body, requestId: requestId };

    const addservice = new ServiceRequest(data);
    await addservice.save();
    res.status(201).json({
      Message: "Service Request Added ",
      serviceRequestId: addservice._id,
    });
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.post("/leads/add", async (req, res) => {
  try {
    const data = req.body;
    const addLead = await Leads.insertMany(data);

    res.status(201).json({
      Message: "Lead Added ",
      count: addLead.length,
      leadIds: addLead.map((contact) => contact._id),
    });
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.post("/contacts/add", async (req, res) => {
  try {
    const data = req.body;
    const addContact = await Contacts.insertMany(data);

    res.status(201).json({
      Message: "Contacts Added",
      count: addContact.length,
      contactIds: addContact.map((contact) => contact._id),
    });
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const serviceRequestCount = await ServiceRequest.aggregate([
      { $count: "count" },
    ]);

    const leadCount = await Leads.aggregate([{ $count: "count" }]);

    const contactCount = await Contacts.aggregate([{ $count: "count" }]);

    res.json({
      serviceRequestCount: serviceRequestCount[0].count,
      leadCount: leadCount[0].count,
      contactCount: contactCount[0].count,
    });
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.get("/leads", async (req, res) => {
  try {
    const leadsData = await Leads.find({});
    res.status(201).send(leadsData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.get("/contacts", async (req, res) => {
  try {
    const contactsData = await Contacts.find({});
    res.status(201).send(contactsData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});
router.get("/service-requests", async (req, res) => {
  try {
    const data = await ServiceRequest.find({});
    res.status(201).send(data);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.get("/service-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const data = await ServiceRequest.find({ requestId: requestId });
    if (!data) {
      res.status(404).json({ Error: "Not Found" });
    } else {
      res.status(201).send(data);
    }
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});
module.exports = router;
