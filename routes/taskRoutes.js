const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../serviceAccountKey.json")),
  });
}
const db = admin.firestore();

// Create Task
router.post("/", async (req, res) => {
  try {
    const { title, description, status, userId } = req.body;
    const taskRef = await db.collection("tasks").add({
      title,
      description,
      status: status || "pending",
      userId,
      createdAt: new Date(),
    });
    res.status(201).json({ id: taskRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Tasks
router.get("/:userId", async (req, res) => {
  try {
    const snapshot = await db
      .collection("tasks")
      .where("userId", "==", req.params.userId)
      .get();

    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Task
router.put("/:id", async (req, res) => {
  try {
    await db.collection("tasks").doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Task
router.delete("/:id", async (req, res) => {
  try {
    await db.collection("tasks").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
