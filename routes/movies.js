const express = require("express");
const router = express.Router();
const axios = require("axios");

// Get the API keys from environment variables
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Try the older version of the Gemini API
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Debug logs
console.log("OMDB API Key:", OMDB_API_KEY ? "Is set" : "Not set");
console.log("Gemini API Key:", GEMINI_API_KEY ? "Is set" : "Not set");
console.log(
  "First few chars of Gemini API Key:",
  GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 5) + "..." : "N/A"
);

// Search movies route
router.get("/search", async (req, res) => {
  const searchTerm = req.query.title;

  if (!searchTerm) {
    return res.render("search", {
      movies: [],
      message: "Enter a movie title to search",
    });
  }

  try {
    const response = await axios.get(
      `http://www.omdbapi.com/?s=${searchTerm}&apikey=${OMDB_API_KEY}`
    );

    if (response.data.Response === "False") {
      return res.render("search", {
        movies: [],
        message: response.data.Error || "No movies found",
      });
    }

    res.render("search", { movies: response.data.Search, message: null });
  } catch (error) {
    console.error("Error searching movies:", error);
    res.render("search", { movies: [], message: "Error searching movies" });
  }
});

// Get movie details route
router.get("/details/:id", async (req, res) => {
  const movieId = req.params.id;

  try {
    const response = await axios.get(
      `http://www.omdbapi.com/?i=${movieId}&plot=full&apikey=${OMDB_API_KEY}`
    );

    if (response.data.Response === "False") {
      return res.render("error", {
        error: response.data.Error || "Movie not found",
      });
    }

    res.render("movieDetails", { movie: response.data });
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res.render("error", { error: "Error fetching movie details" });
  }
});

// Add a GET route for recommendations for direct URL access
router.get("/recommend", async (req, res) => {
  // Redirect to home page with a message to use the form
  res.redirect(
    "/?message=Please%20use%20the%20form%20to%20get%20recommendations"
  );
});

// Get personalized recommendations route
router.post("/recommend", async (req, res) => {
  console.log("POST /movies/recommend received");
  console.log("Request body:", req.body);

  const { favoriteMovies, genres, mood } = req.body;

  if (!favoriteMovies && !genres && !mood) {
    return res.render("recommendations", {
      recommendations: [],
      message: "Please provide some preferences for recommendations",
    });
  }

  try {
    // Just use the default recommendations for now to ensure something works
    console.log("Using default recommendations");
    const defaultRecs = getDefaultRecommendations(favoriteMovies, genres, mood);
    return res.render("recommendations", {
      recommendations: defaultRecs,
      message: "Here are some recommendations based on your preferences.",
    });

    // Commented out the API call for now since it's causing issues
    /*
    // Prepare prompt for Gemini
    let prompt = "Recommend 5 movies based on the following preferences:\n";

    if (favoriteMovies) {
      prompt += `Favorite Movies: ${favoriteMovies}\n`;
    }

    if (genres) {
      prompt += `Preferred Genres: ${genres}\n`;
    }

    if (mood) {
      prompt += `Current Mood: ${mood}\n`;
    }

    prompt += "\nFor each movie, provide the title, year, and a brief reason for recommendation. Format each movie like this:\n1. Movie Title (Year) - Reason for recommendation\n2. Movie Title (Year) - Reason for recommendation";

    console.log("Prompt:", prompt);
    
    // Check if we have a valid API key
    if (!GEMINI_API_KEY) {
      console.error("Missing Gemini API key");
      // Fall back to default recommendations
      const defaultRecs = getDefaultRecommendations(favoriteMovies, genres, mood);
      return res.render("recommendations", {
        recommendations: defaultRecs,
        message: "Using default recommendations (API key issue)."
      });
    }
    
    try {
      // Make a simplified API call
      const response = await axios({
        method: 'post',
        url: GEMINI_API_URL,
        params: {
          key: GEMINI_API_KEY
        },
        data: {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("API Response Status:", response.status);
      
      if (response.data && response.data.candidates && response.data.candidates[0]) {
        const recommendationText = response.data.candidates[0].content.parts[0].text;
        console.log("Raw recommendation text:", recommendationText);
        
        // Parse recommendations
        const recommendations = parseRecommendations(recommendationText);
        
        // Fetch additional details from OMDb API
        const detailedRecommendations = await Promise.all(
          recommendations.map(async (rec) => {
            try {
              const omdbResponse = await axios.get(
                `http://www.omdbapi.com/?t=${encodeURIComponent(rec.title)}&y=${rec.year}&apikey=${OMDB_API_KEY}`
              );

              if (omdbResponse.data.Response === "True") {
                return {
                  ...rec,
                  poster: omdbResponse.data.Poster,
                  plot: omdbResponse.data.Plot,
                  imdbID: omdbResponse.data.imdbID,
                  imdbRating: omdbResponse.data.imdbRating,
                };
              }
              return rec;
            } catch (error) {
              console.error(`Error fetching details for ${rec.title}:`, error);
              return rec;
            }
          })
        );

        return res.render("recommendations", {
          recommendations: detailedRecommendations,
          message: null,
        });
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid API response format");
      }
    } catch (apiError) {
      console.error("API call error:", apiError.message);
      console.error("Full error:", apiError);
      
      if (apiError.response) {
        console.error("Response data:", apiError.response.data);
        console.error("Response status:", apiError.response.status);
      }
      
      // Fall back to default recommendations
      const defaultRecs = getDefaultRecommendations(favoriteMovies, genres, mood);
      return res.render("recommendations", {
        recommendations: defaultRecs,
        message: "Using default recommendations (API issue)."
      });
    }
    */
  } catch (error) {
    console.error("General error:", error);

    // Fall back to default recommendations
    const defaultRecs = getDefaultRecommendations(favoriteMovies, genres, mood);
    return res.render("recommendations", {
      recommendations: defaultRecs,
      message: "Using default recommendations (error occurred).",
    });
  }
});

// Function to generate default recommendations based on user preferences
function getDefaultRecommendations(favoriteMovies, genres, mood) {
  console.log("Generating default recommendations");

  // Parse genres into an array if it's not already
  let genreList = [];
  if (genres) {
    genreList = Array.isArray(genres) ? genres : [genres];
  }

  // Some default recommendations by genre
  const actionMovies = [
    {
      title: "Die Hard",
      year: "1988",
      reason:
        "A classic action film with Bruce Willis as John McClane fighting terrorists in a skyscraper.",
      plot: "An NYPD officer tries to save his wife and several others taken hostage by German terrorists during a Christmas party at the Nakatomi Plaza in Los Angeles.",
      poster:
        "https://m.media-amazon.com/images/M/MV5BZjRlNDUxZjAtOGQ4OC00OTNlLTgxNmQtYTBmMDgwZmNmNjkxXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
      imdbRating: "8.2",
    },
    {
      title: "John Wick",
      year: "2014",
      reason:
        "A stylish action thriller with Keanu Reeves as a retired hitman seeking revenge.",
      plot: "An ex-hit-man comes out of retirement to track down the gangsters that killed his dog and took his car.",
      poster:
        "https://m.media-amazon.com/images/M/MV5BMTU2NjA1ODgzMF5BMl5BanBnXkFtZTgwMTM2MTI4MjE@._V1_SX300.jpg",
      imdbRating: "7.4",
    },
    {
      title: "Mad Max: Fury Road",
      year: "2015",
      reason:
        "A high-octane post-apocalyptic action film with incredible stunts and visual effects.",
      plot: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.",
      poster:
        "https://m.media-amazon.com/images/M/MV5BN2EwM2I5OWMtMGQyMi00Zjg1LWJkNTctZTdjYTA4OGUwZjMyXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
      imdbRating: "8.1",
    },
  ];

  const dramaMovies = [
    {
      title: "The Shawshank Redemption",
      year: "1994",
      reason: "A powerful drama about hope and redemption in a prison setting.",
      plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      poster:
        "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
      imdbRating: "9.3",
    },
    {
      title: "The Godfather",
      year: "1972",
      reason:
        "Francis Ford Coppola's masterpiece about family, power, and organized crime.",
      plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      poster:
        "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
      imdbRating: "9.2",
    },
    {
      title: "Schindler's List",
      year: "1993",
      reason:
        "Steven Spielberg's moving portrayal of a German businessman who saved Jews during the Holocaust.",
      plot: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
      poster:
        "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
      imdbRating: "9.0",
    },
  ];

  const comedyMovies = [
    {
      title: "Superbad",
      year: "2007",
      reason:
        "A hilarious coming-of-age comedy about high school friends trying to party before graduation.",
      plot: "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry.",
      poster:
        "https://m.media-amazon.com/images/M/MV5BMTc0NjIyMjA2OF5BMl5BanBnXkFtZTcwMzIxNDE1MQ@@._V1_SX300.jpg",
      imdbRating: "7.6",
    },
    {
      title: "The Hangover",
      year: "2009",
      reason:
        "A wild comedy about a bachelor party in Las Vegas that goes completely off the rails.",
      plot: "Three buddies wake up from a bachelor party in Las Vegas, with no memory of the previous night and the bachelor missing. They make their way around the city in order to find their friend before his wedding.",
      poster:
        "https://m.media-amazon.com/images/M/MV5BNGQwZjg5YmYtY2VkNC00NzliLTljYTctNzI5NmU3MjE2ODQzXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
      imdbRating: "7.7",
    },
    {
      title: "Bridesmaids",
      year: "2011",
      reason:
        "A funny and heartfelt comedy about friendship and rivalry among bridesmaids.",
      plot: "Competition between the maid of honor and a bridesmaid, over who is the bride's best friend, threatens to upend the life of an out-of-work pastry chef.",
      poster:
        "https://m.media-amazon.com/images/M/MV5BMjAyOTMyMzUxNl5BMl5BanBnXkFtZTcwODI4MzE0NA@@._V1_SX300.jpg",
      imdbRating: "6.8",
    },
  ];

  // Select recommendations based on genre
  let recommendations = [];

  if (genreList.includes("Action")) {
    recommendations = recommendations.concat(actionMovies);
  }

  if (genreList.includes("Drama")) {
    recommendations = recommendations.concat(dramaMovies);
  }

  if (genreList.includes("Comedy")) {
    recommendations = recommendations.concat(comedyMovies);
  }

  // If no genre matched or no genres provided, give a mix
  if (recommendations.length === 0) {
    recommendations = [
      actionMovies[0],
      dramaMovies[0],
      comedyMovies[0],
      {
        title: "Inception",
        year: "2010",
        reason:
          "Christopher Nolan's mind-bending sci-fi thriller about dreams within dreams.",
        plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        poster:
          "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        imdbRating: "8.8",
      },
      {
        title: "Parasite",
        year: "2019",
        reason:
          "Bong Joon Ho's Oscar-winning thriller about class disparity and social inequality.",
        plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        poster:
          "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
        imdbRating: "8.5",
      },
    ];
  }

  // Limit to 5 recommendations
  return recommendations.slice(0, 5);
}

// Helper function to parse recommendations from Gemini's response
function parseRecommendations(text) {
  console.log("Parsing recommendation text:", text);
  const recommendations = [];

  try {
    // Try to handle different possible formats from Gemini

    // First approach: Look for numbered lists (e.g., "1. Movie Title (Year)")
    const numberedRegex =
      /(\d+)\.\s+([^(]+)(?:\s+\((\d{4})\))?[^\n]*\n([\s\S]+?)(?=\d+\.|$)/g;
    let match;
    let foundNumbered = false;

    while ((match = numberedRegex.exec(text)) !== null) {
      foundNumbered = true;
      const title = match[2].trim();
      const year = match[3] || "";
      const reasonText = match[4].trim();

      recommendations.push({
        title,
        year,
        reason: reasonText,
      });
    }

    // If numbered approach didn't find anything, try an alternative approach
    if (!foundNumbered) {
      // Split by double newlines to find separate movie entries
      const movieSections = text.split(/\n\s*\n/).filter(Boolean);

      movieSections.forEach((section) => {
        // Try to extract title and year
        const titleYearMatch = section.match(/^([^(\n]+)(?:\s+\((\d{4})\))?/);

        if (titleYearMatch) {
          const title = titleYearMatch[1].trim();
          const year = titleYearMatch[2] || "";

          // Everything after the title/year line is the reason
          const reasonText = section.replace(titleYearMatch[0], "").trim();

          recommendations.push({
            title,
            year,
            reason: reasonText,
          });
        }
      });
    }

    // If we still have no recommendations, fall back to the original method
    if (recommendations.length === 0) {
      const movieSections = text.split(/\d+\.\s+/).filter(Boolean);

      movieSections.forEach((section) => {
        const titleMatch = section.match(/^(.+?)(?:\s+\((\d{4})\))?/);

        if (titleMatch) {
          const title = titleMatch[1].trim();
          const year = titleMatch[2] || "";
          const reason = section.split("\n").slice(1).join(" ").trim();

          recommendations.push({
            title,
            year,
            reason,
          });
        }
      });
    }

    console.log("Parsed recommendations:", recommendations);
  } catch (error) {
    console.error("Error parsing recommendations:", error);
  }

  // Ensure we return at least some recommendations even if parsing failed
  if (recommendations.length === 0) {
    // Create generic recommendations as fallback
    recommendations.push({
      title: "The Godfather",
      year: "1972",
      reason:
        "A classic crime drama that's consistently ranked among the greatest films of all time.",
    });
    recommendations.push({
      title: "Inception",
      year: "2010",
      reason:
        "A mind-bending sci-fi action film with stunning visuals and an intriguing concept.",
    });
    recommendations.push({
      title: "The Dark Knight",
      year: "2008",
      reason:
        "One of the best superhero films ever made with Heath Ledger's iconic performance as the Joker.",
    });
  }

  return recommendations;
}

module.exports = router;
