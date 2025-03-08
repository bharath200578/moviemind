# MovieMind - AI-Powered Movie Recommendation App

MovieMind is a web application that provides personalized movie recommendations using Google's Gemini AI and the Open Movie Database (OMDb) API. The app analyzes user preferences, including favorite movies, preferred genres, and current mood to suggest movies tailored to individual tastes.

## Features

- **Personalized Recommendations**: Get movie suggestions based on your preferences and mood
- **Comprehensive Movie Details**: View detailed information about movies, including plot, cast, ratings, and more
- **Search Functionality**: Search for specific movies by title
- **Responsive Design**: Enjoy a seamless experience on any device

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **View Engine**: EJS (Embedded JavaScript)
- **APIs**:
  - Google Gemini AI API for intelligent recommendations
  - OMDb API for movie data

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- API keys for OMDb and Gemini AI

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/moviemind.git
   cd moviemind
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   OMDB_API_KEY=your_omdb_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the application:

   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## How to Use

1. **Get Recommendations**: On the home page, enter your favorite movies, select preferred genres, and describe your current mood. Click "Get Recommendations" to receive personalized movie suggestions.

2. **Search Movies**: Use the search feature to find specific movies by title.

3. **View Movie Details**: Click on any movie card to view comprehensive details about the film.

## API Keys

To use this application, you'll need to obtain API keys from:

- **OMDb API**: [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
- **Google Gemini AI**: [https://ai.google.dev/](https://ai.google.dev/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OMDb API for providing comprehensive movie data
- Google Gemini AI for powering the recommendation engine
- Bootstrap for the responsive UI components
