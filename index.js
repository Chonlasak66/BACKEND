const hapi = require("@hapi/hapi");
const env = require("./env.js");
const Movies = require("./respository/movie");
 
const AuthBearer = require("hapi-auth-bearer-token"); //-------- AuthBearer -------
 
const express = require("express");
const app = express();
 
const path = require("path");
bodyParser = require("body-parser");
 
//------------------
const api_port = 4000;
const web_port = 4001;
 
//------------ hapi --------------
 
console.log("Running Environment: " + env);
 
const init = async () => {
  const server = hapi.Server({
    port: api_port,
    host: "0.0.0.0",
    routes: {
      "cors": true,
    //   cors: {
    //     origin: ["Access-Control-Allow-Origin", "https://api.se-rmutl.net/"],
    //     headers: ["Accept", "Content-Type"],
    //     additionalHeaders: ["X-Requested-With"],
    //   },
    },
  });
 
  //---------
 
  await server.register(require("@hapi/inert"));
 
  //-------- AuthBearer -------
  await server.register(AuthBearer);
 
  server.auth.strategy("simple", "bearer-access-token", {
    allowQueryToken: true, // optional, false by default
    validate: async (request, token, h) => {
      // here is where you validate your token
      // comparing with token from your database for example
      const isValid = token === "1234567890";
 
      const credentials = { token };
      const artifacts = { test: "info" };
 
      return { isValid, credentials, artifacts };
    },
  });
 
  server.auth.default("simple");
 
  //-------- AuthBearer -------
  /*
    server.route({
        method: "GET",
        path: "/",
        config: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-width']
            }
        },
        handler: () => {
            return '<h3> Welcome to API Back-end Ver. 1.0.0</h3>';
        }
    });
*/
 
  server.route({
    method: "GET",
    path: "/",
    config: {
      cors: {
        origin: ["*"],
        additionalHeaders: ["cache-control", "x-requested-width"],
        credentials: true,
      },
    },
    handler: () => {
      return "<h3> Welcome to API Back-end Ver. 1.0.0</h3>";
    },
  });
 
  //API: http://localhost:3001/api/movie/all
  server.route({
    method: "GET",
    path: "/api/movie/all",
    config: {
      cors: {
        origin: ["*"],
        additionalHeaders: ["cache-control", "x-requested-width"],
        credentials: true,
      },
    },
    handler: async function (request, reply) {
      //var param = request.query;
      //const category_code = param.category_code;
 
      try {
        const responsedata = await Movies.MovieRepo.getMovieList();
 
        if (responsedata.error) {
          return responsedata.errMessage;
        } else {
          return responsedata;
        }
      } catch (err) {
        server.log(["error", "home"], err);
        return err;
      }
    },
  });
 
  server.route({
    method: "GET",
    path: "/api/movie/search",
    config: {
      cors: {
        origin: ["*"],
        additionalHeaders: ["cache-control", "x-requested-width"],
        credentials: true,
      },
    },
    handler: async function (request, reply) {
      var param = request.query;
      let search_text = param.search_text;
      //const title = param.title;
      console.log("search_text: " + search_text);
 
      if (search_text === undefined) {
        console.log("search_text is undefined ");
        search_text = "N/A";
        console.log("search_text: " + search_text);
      }
 
      //if (typeof myVar !== 'undefined')
      //myVar === undefined
 
      try {
        const responsedata = await Movies.MovieRepo.getMovieSearch(search_text);
        if (responsedata.error) {
          return responsedata.errMessage;
        } else {
          return responsedata;
        }
      } catch (err) {
        server.log(["error", "home"], err);
        return err;
      }
    },
  });
 
  server.route({
    method: "POST",
    path: "/api/movie/insert",
    config: {
      payload: {
        multipart: true,
      },
      cors: {
        origin: ["*"],
        additionalHeaders: ["cache-control", "x-requested-width"],
        credentials: true,
      },
    },
    handler: async function (request, reply) {
      const { title, genre, director, release_year } = request.payload;
 
      console.log("request.payload: " + JSON.stringify(request.payload));
      /*
                        const myObj = JSON.parse(request.payload);
                        const title = myObj.title;
                        const genre = myObj.genre;
                        const director = myObj.director;
                        const release_year = myObj.release_year;
             */
      //console.log("myObj.title: "+ myObj.title);
 
      try {
        const responsedata = await Movies.MovieRepo.postMovie(
          title,
          genre,
          director,
          release_year
        );
        if (responsedata.error) {
          return responsedata;
        } else {
          return responsedata;
        }
      } catch (err) {
        server.log(["error", "home"], err);
        return err;
      }
    },
  });
 
  await server.start();
  console.log("API Server running on %s", server.info.uri);
 
  //---------
};
 
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
 
init();
 