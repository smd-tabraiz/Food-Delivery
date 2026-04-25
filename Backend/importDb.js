const { MongoClient } = require("mongodb");
const fs = require("fs");
const { EJSON } = require("bson");

const uri = "mongodb+srv://tabraizsmd_db_user:M3EcmHNdVHln8Utf@cluster0.31mtvlo.mongodb.net/OrderIt?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Starting DB import...");
    await client.connect();
    const db = client.db("OrderIt");

    const collections = ["fooditems", "menus", "restaurants"];

    for (let c of collections) {
      try {
        const data = fs.readFileSync(`D:/WEBSTACK/Database-20260418/Internship.${c}.json`, "utf8");
        const parsedData = EJSON.parse(data, { relaxed: false });
        
        if (parsedData.length > 0) {
          // Clear old data just in case
          await db.collection(c).deleteMany({});
          
          await db.collection(c).insertMany(parsedData);
          console.log(`Inserted ${parsedData.length} documents into ${c}`);
        }
      } catch (err) {
        console.error(`Error importing ${c}:`, err.message);
      }
    }
    
    console.log("Database seeded successfully!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
