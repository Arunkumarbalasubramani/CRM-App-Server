const express = require("express");
const router = express.Router();
const { generateHashedPassword, comparePassword } = require("../utils/bcrypt");
const ServiceRequest = require("../models/serviceRequests");
const Leads = require("../models/leads");
const Contacts = require("../models/contacts");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Users = require("../models/userModel");
const verifyJWTAndRole = require("../middleware/verifyToken");

//API to get all leads
router.get(
  "/leads",
  verifyJWTAndRole(["manager", "editor", "creator"]),
  async (req, res) => {
    try {
      const leadsData = await Leads.find({});
      res.status(201).send(leadsData);
    } catch (error) {
      res.status(500).json({ Error: `${error}` });
    }
  }
);

//API to get a lead by Id
router.get(
  "/leads/:id",
  verifyJWTAndRole(["editor", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const leadsData = await Leads.find({ _id: id });
      res.status(201).send(leadsData);
    } catch (error) {
      res.status(500).json({ Error: `${error}` });
    }
  }
);

//API to add a new lead
router.post(
  "/leads/add",
  verifyJWTAndRole(["manager", "creator"]),
  async (req, res) => {
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
  }
);

//API to edit lead
router.post(
  "/leads/:id/edit",
  verifyJWTAndRole(["editor", "manager"]),
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

//API to get all Service requests
router.get(
  "/service-requests",
  verifyJWTAndRole(["manager", "editor", "creator"]),
  async (req, res) => {
    try {
      const data = await ServiceRequest.find({});
      res.status(201).send(data);
    } catch (error) {
      res.status(500).json({ Error: `${error}` });
    }
  }
);

//API to get a Service request by ID
router.get(
  "/service-requests/:requestId",
  verifyJWTAndRole(["editor", "manager"]),
  async (req, res) => {
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
  }
);

//API to add a new Service request
router.post(
  "/service-requests/add",
  verifyJWTAndRole(["manager", "creator"]),
  async (req, res) => {
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
  }
);

//API to edit a  Service request
router.post(
  "/service-requests/:requestId/edit",
  verifyJWTAndRole(["editor", "manager"]),
  async (req, res) => {
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
  }
);

//API top get all contacts
router.get(
  "/contacts",
  verifyJWTAndRole(["manager", "editor", "creator"]),
  async (req, res) => {
    try {
      const contactsData = await Contacts.find({});
      res.status(201).send(contactsData);
    } catch (error) {
      res.status(500).json({ Error: `${error}` });
    }
  }
);

//API to get a contact by id
router.get(
  "/contacts/find/:id",
  verifyJWTAndRole(["editor", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const contactsData = await Contacts.findById(id);
      res.status(201).send(contactsData);
    } catch (error) {
      res.status(500).json({ Error: `${error}` });
    }
  }
);

//API to get a contact by email
router.get(
  "/contacts/:email",
  verifyJWTAndRole(["manager", "editor", "creator"]),
  async (req, res) => {
    try {
      const { email } = req.params;
      const contactsData = await Contacts.find({ contactEmail: email });
      res.status(201).send(contactsData);
    } catch (error) {
      res.status(500).json({ Error: `${error}` });
    }
  }
);

//API to Add a new contact
router.post(
  "/contacts/add",
  verifyJWTAndRole(["manager", "creator"]),
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

//API to Edit contact
router.post(
  "/contacts/:id/edit",
  verifyJWTAndRole(["editor", "manager"]),
  async (req, res) => {
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
  }
);

//API to get User Dashboard, Only Counts
router.get("/dashboard", verifyJWTAndRole("user"), async (req, res) => {
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

module.exports = router;
