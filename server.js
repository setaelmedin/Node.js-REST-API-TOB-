require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const axios = require('axios').default;
const app = express();

const APPID = process.env.OPEN_WEATHER_APPID;
const PORT = process.env.PORT;
//If you want to dockerize this app, you need to change host variable from 127.0.0.1 to 0.0.0.0,
//because Docker does not recognize 127.0.0.1
const HOST = process.env.HOST;
const HOSTFORDOCKER = process.env.HOSTFORDOCKER

const server = http.createServer(app).listen(PORT, HOST, () => {
  const serverAdress = server.address();
  console.info(
    `listening on: http://${serverAdress.address}:${serverAdress.port} / ${serverAdress.family}`
  );
});


function terminate(server, options = { coredump: false, timeout: 500 }) {
  const exit = (code) => {
    options.coredump ? process.abort() : process.exit(code);
  };

  return (code, reason) => (err, promise) => {
    if (err && err instanceof Error) {
      console.log(err.message, err.stack);
    }

    server.close(exit);
    setTimeout(exit, options.timeout).unref();
  };
}

const exitHandler = terminate(server, {
  coredump: false,
  timeout: 500,
});
process.on("uncaughtException", exitHandler(1, "Unexpected Error"));
process.on("unhandledRejection", exitHandler(1, "Unhandled Promise"));

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb", extended: true }));

app.get("/user/:id", async (req, res) => {
  let firstRequest, secondRequest

  const jsonPlaceholderURL = `https://jsonplaceholder.typicode.com/users/${req.params.id}`
  firstRequest = await axios.get(jsonPlaceholderURL)
    .then((response) => response.data)
    .catch((error) => console.log(error))

  if (!(firstRequest && firstRequest.address && firstRequest.address.geo)) return res.status(400).json({ message: 'No user found' })

  const { lat, lng } = firstRequest.address.geo
  const appWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${APPID}`
  secondRequest = await axios.get(appWeatherURL)
    .then((response) => {
      return res.status(200).json({ user: firstRequest, weatherData: response.data })
    })
    .catch((error) => {
      console.log(error)
      return res.status(400).json({ message: 'Failed at weather request', error, user: firstRequest })
    })

});

app.get('*', async (req, res) => {
  res.status(404).json({ error: 'Not found' });
});