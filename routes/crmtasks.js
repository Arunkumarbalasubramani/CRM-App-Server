const express = require("express");
const router = express.Router();
const { generateHashedPassword, comparePassword } = require("../utils/bcrypt");
const ServiceRequest = require("../models/serviceRequests");
const Leads = require("../models/leads");
const Contacts = require("../models/contacts");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Users = require("../models/userModel");

router.post("/service-requests/add", async (req, res) => {
  try {
    const requestId = Math.floor(Math.random() * 100000 + 1);
    const data = { ...req.body, requestId: requestId };

    const addservice = new ServiceRequest(data);
    await addservice.save();
    const userDetails = await Users.findOneAndUpdate(
      {
        email: req.body.assignedTo,
      },
      { $addToSet: { serviceRequests: addservice._id } },
      { new: true }
    );

    const contactDetails = await Contacts.findOneAndUpdate(
      {
        contactEmail: req.body.customer,
      },
      { $addToSet: { serviceRequests: addservice._id } },
      { new: true }
    );
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

router.post(
  "/contacts/add",

  async (req, res) => {
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
  }
);

router.get(
  "/dashboard",

  async (req, res) => {
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
  }
);

router.get("/leads", async (req, res) => {
  try {
    const leadsData = await Leads.find({});
    res.status(201).send(leadsData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});
router.get("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const leadsData = await Leads.find({ _id: id });
    res.status(201).send(leadsData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.post(
  "/leads/:id/edit",

  async (req, res) => {
    try {
      const { id } = req.params;
      const dataTobeEdited = req.body;
      const leadsData = await Leads.findOneAndUpdate(
        { _id: id },
        dataTobeEdited,
        { new: true }
      );
      await leadsData.save();
      res.status(201).send(leadsData);
    } catch (error) {
      res.status(500).json({ Error: `${error}` });
    }
  }
);

router.get("/contacts", async (req, res) => {
  try {
    const contactsData = await Contacts.find({});
    res.status(201).send(contactsData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});
router.get("/contacts/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const contactsData = await Contacts.find({ contactEmail: email });
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
    const data = await ServiceRequest.findById(requestId);

    if (!data) {
      res.status(404).json({ Error: "Not Found" });
    } else {
      res.status(201).send(data);
    }
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});
router.post("/service-requests/:requestId/edit", async (req, res) => {
  try {
    const { requestId } = req.params;
    const data = req.body;
    const updatedData = await ServiceRequest.findOneAndUpdate(
      { requestId: requestId },
      data,
      { new: true }
    );
    await updatedData.save();
    if (!data) {
      res.status(404).json({ Error: "Not Found" });
    } else {
      res.status(201).send(updatedData);
    }
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.get("/contacts/find/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const contactsData = await Contacts.findById(id);
    res.status(201).send(contactsData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});

router.post("/contacts/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const contactsData = await Contacts.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });
    await contactsData.save();
    res.status(201).send(contactsData);
  } catch (error) {
    res.status(500).json({ Error: `${error}` });
  }
});
module.exports = router;
