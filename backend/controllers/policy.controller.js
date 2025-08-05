import Policy from "../models/policy.model.js";

export const getPublicPolicies = async (req, res) => {
  try {
    const policies = await Policy.find()
      .select("title type content createdAt updatedAt")
      .sort({ createdAt: -1 });

    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch policy list" });
  }
};

export const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    res.status(200).json(policy);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch policy" });
  }
};

export const createPolicy = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const newPolicy = await Policy.create({ title, content, type });
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(500).json({ error: "Unable to create policy" });
  }
};

export const deletePolicy = async (req, res) => {
  try {
    await Policy.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Policy deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete policy" });
  }
};

export const updatePolicy = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const sanitized = { title, content, type }; // exclude createdAt/updatedAt
    const updated = await Policy.findByIdAndUpdate(req.params.id, sanitized, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Unable to update policy" });
  }
};
