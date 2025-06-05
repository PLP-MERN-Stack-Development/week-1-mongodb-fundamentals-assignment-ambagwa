//Find all books in a specific genre
db.books.find({ genre: "Fiction" }, { title: 1, author: 1, price: 1, _id: 0 });

//Find books published after a certain year
db.books.find(
  { published_year: { $gt: 1940 } },
  { _id: 0, title: 1, author: 1, price: 1 }
);

//Find books by a specific author
db.books.find(
  { author: "Herman Melville" },
  { _id: 0, title: 1, author: 1, price: 1 }
);

//Update the price of a specific book
db.books.updateOne(
  { title: "Wuthering Heights" },
  { $set: { price: 11.99 } },
  { _id: 0, title: 1, author: 1, price: 1 }
);

//Delete a book by its title
db.books.deleteOne({ title: "Animal Farm" });

//Write a query to find books that are both in stock and published after 2010
db.books.find(
  { in_stock: true, published_year: { $gt: 2010 } },
  { _id: 0, title: 1, author: 1, price: 1 }
);

//Use projection to return only the title, author, and price fields in your queries

//Implement sorting to display books by price (both ascending and descending)
db.books.find().sort({ price: 1 });
db.books.find().sort({ price: -1 });

//Use the `limit` and `skip` methods to implement pagination (5 books per page)
db.books.find().limit(5).skip(0); //Page 1 with the first five books
db.books.find().limit(5).skip(5); //Page 2 with the next five books
db.books.find().limit(5).skip(10); //Page 3 with the next five books

//Create an aggregation pipeline to calculate the average price of books by genre
db.books.aggregate([
  {
    $group: {
      _id: "$genre", //group by genre
      averagePrice: { $avg: "$price" }, //average price calculation
      count: { $sum: 1 }, //sum of all prices
    },
  },
  {
    $sort: {
      averagePrice: -1, //sort the average prices in descending order
    },
  },
  {
    $project: {
      //Format the output
      _id: 1,
      genre: "$_id",
      averagePrice: { $round: ["$averagePrice", 2] }, // Round to 2 decimal places
      count: 1,
    },
  },
]);

//Create an aggregation pipeline to find the author with the most books in the collection
db.books.aggregate([
  {
    $group: {
      _id: "$author",
      bookCount: { $sum: 1 },
    },
  },
  {
    $sort: { bookCount: -1 },
  },
  {
    $limit: 1,
  },
  {
    $project: {
      _id: 0,
      author: "$_id",
      totalBooks: "$bookCount",
    },
  },
]);

//Implement a pipeline that groups books by publication decade and counts them
db.books.aggregate([
  {
    $addFields: {
      // Calculate the decade by dividing the year by 10, flooring it, then multiplying by 10
      decade: {
        $multiply: [{ $floor: { $divide: ["$published_year", 10] } }, 10],
      },
    },
  },
  {
    $group: {
      _id: "$decade", // Group by the calculated decade
      bookCount: { $sum: 1 }, // Count books in each decade
      books: {
        $push: {
          // Optional: include book titles and authors
          title: "$title",
          author: "$author",
        },
      },
    },
  },
]);

//Create an index on the `title` field for faster searches
db.books.createIndex({ title: 1 });

//Create a compound index on `author` and `published_year`
db.books.createIndex({
  author: 1, // 1 for ascending order
  published_year: -1, // -1 for descending order
});

//Use the `explain()` method to demonstrate the performance improvement with your indexes
//Drop the created index first and run the find() query
db.books.dropIndex({ author: 1, published_year: -1 });
db.books
  .find({ author: "John Doe" })
  .sort({ published_year: -1 })
  .explain("executionStats");
//create the index and then run the query
db.books.createIndex({
  author: 1, // 1 for ascending order
  published_year: -1, // -1 for descending order
});
db.books
  .find({ author: "John Doe" })
  .sort({ published_year: -1 })
  .explain("executionStats");
