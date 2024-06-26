import fs from "node:fs/promises";

import bodyParser from "body-parser";
import express from "express";
import cors from "cors"; // Import the cors middleware

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  next();
});

// Parse events data from environment variable
const events = JSON.parse(process.env.EVENTS_JSON);

// Parse images data from environment variable
const images = JSON.parse(process.env.IMAGES_JSON);

app.get("/events", async (req, res) => {
  const { max, search } = req.query;
  // const eventsFileContent = await fs.readFile("./data/events.json");
  // let events = JSON.parse(eventsFileContent);

  let filteredEvents = [...events]; // Create a copy of the events array

  if (search) {
    const searchTerm = search.trim().toLowerCase();
    filteredEvents = filteredEvents.filter((event) => {
      const searchableText = `${event.title} ${event.description} ${event.location}`;
      return searchableText.toLowerCase().includes(searchTerm);
    });
  }

  if (max) {
    const maxCount = parseInt(max, 10); // Parse max as an integer
    filteredEvents = filteredEvents.slice(-maxCount); // Take the last maxCount events
  }

  res.json({
    events: filteredEvents.map((event) => ({
      id: event.id,
      title: event.title,
      image: event.image,
      date: event.date,
      location: event.location,
    })),
  });
});

app.get("/events/images", async (req, res) => {
  res.json({ images });
});

app.get("/events/:id", async (req, res) => {
  const { id } = req.params;

  const event = events.find((event) => event.id === id);

  if (!event) {
    return res
      .status(404)
      .json({ message: `For the id ${id}, no event could be found.` });
  }

  setTimeout(() => {
    res.json({ event });
  }, 1000);
});

app.post("/events", async (req, res) => {
  const { event } = req.body;

  if (!event) {
    return res.status(400).json({ message: "Event is required" });
  }

  console.log(event);

  if (
    !event.title?.trim() ||
    !event.description?.trim() ||
    !event.date?.trim() ||
    !event.time?.trim() ||
    !event.image?.trim() ||
    !event.location?.trim()
  ) {
    return res.status(400).json({ message: "Invalid data provided." });
  }

  const newEvent = {
    id: Math.round(Math.random() * 10000).toString(),
    ...event,
  };

  events.push(newEvent);

  res.json({ event: newEvent });
});

app.put("/events/:id", async (req, res) => {
  const { id } = req.params;
  const { event } = req.body;

  if (!event) {
    return res.status(400).json({ message: "Event is required" });
  }

  if (
    !event.title?.trim() ||
    !event.description?.trim() ||
    !event.date?.trim() ||
    !event.time?.trim() ||
    !event.image?.trim() ||
    !event.location?.trim()
  ) {
    return res.status(400).json({ message: "Invalid data provided." });
  }

  const eventIndex = events.findIndex((event) => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  events[eventIndex] = {
    id,
    ...event,
  };

  setTimeout(() => {
    res.json({ event: events[eventIndex] });
  }, 1000);
});

app.delete("/events/:id", async (req, res) => {
  const { id } = req.params;

  const eventIndex = events.findIndex((event) => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  events.splice(eventIndex, 1);

  setTimeout(() => {
    res.json({ message: "Event deleted" });
  }, 1000);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
