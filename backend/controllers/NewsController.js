const { News } = require("../models");
const jwt = require("jsonwebtoken");
const getNews = async (req, res) => {
    try {
        const news = await News.findAll();
        res.status(200).json(news);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get news" });
    }
};
const createNews = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const news = await News.create({
            ...req.body,
            createdBy: decodedToken.id,
        });
        res.status(201).json(news);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create news" });
    }
};
const updateNews = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const news = await News.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    const { title, tag, content, image } = req.body;
    if (title) news.title = title;
    if (tag) news.tag = tag;
    if (content) news.content = content;
    if (image) news.image = image;


    news.createdBy = decodedToken.id;

    await news.save();
    return res.status(200).json({ message: "News updated successfully", news });
  } catch (error) {
    console.error("Update News Error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Failed to update news" });
  }
};
const deleteNews = async (req, res) => {
    try {
        const news = await News.destroy({ where: { id: req.params.id } });
        res.status(200).json(news);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete news" });
    }
};

module.exports = { getNews, createNews, updateNews, deleteNews };