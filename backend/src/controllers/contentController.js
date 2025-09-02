import Content from '../models/Content.js';

export async function addContent(req, res) {
  const { creator, contentId, uri, title, active } = req.body;
  const doc = await Content.findOneAndUpdate(
    { creator: creator.toLowerCase(), contentId },
    { creator: creator.toLowerCase(), contentId, uri, title, active },
    { upsert: true, new: true }
  );
  res.json(doc);
}

export async function listByCreator(req, res) {
  const { address } = req.params;
  const items = await Content.find({ creator: address.toLowerCase(), active: true }).sort({ createdAt: -1 });
  res.json(items);
}
