import express, { response } from "express";
import { Auth } from "@auth/core";
import GitHub from "@auth/core/providers/github";
import crypto from "crypto";
import { createAuthMiddleware } from "authey";
import cookieParser from "cookie-parser";
import send from "@polka/send-type";
import { splitCookiesString } from "set-cookie-parser";
import { config } from "dotenv";
config()
// const GitHubProvider = require("@auth/core/providers/github");
const app = express();
const port = 3000;
const baseurl  = "/api/auth/*"
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("ioiowqdioasiodad"));

app.get("/", (req, res) => {
  res.send("hello world");
});

app.all(baseurl,async (req,res)=>{
try{
  //get original full url 
const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

// convert from express res -> node Request 
const data = {
  method: req.method,
  headers: req.headers,
};
//still dont understand why need to set body as entire req
if (req.method !== "GET" && req.method !== "HEAD") data.body = req;


const request = new Request(fullUrl, data);

//do auth 
const authResponse = await Auth(request, {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_OAUTH_CLIENTID,
      clientSecret: process.env.GITHUB_OAUTH_SECRET,
    }),
  ],
  secret: "ioiowqdioasiodad",
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, token, user }) {
      console.log("This was session called.");
      console.log(session, token, user);
      return session;
    },
    async jwt({ token, account, profile }) {
      console.log("This was jwt called.");
      console.log(token);
      return token;
    },
  },
});


//convert to node response -> express response  


//  for (const [key, value] of authResponse.headers.entries()) {
//    if (key === "set-cookie") {
//      const cookies = splitCookiesString(authResponse.headers.get("set-cookie"));
//      res.setHeader("set-cookie", cookies);
//    } else {
//      res.setHeader(key, value);
//    }
//  }
authResponse.headers.forEach((value,key)=>{
  if (key == "set-cookie"){
        const cookies = splitCookiesString(value);
        res.setHeader("set-cookie", cookies);

  }
  else{
      res.setHeader(key, value);

  } 
});
// Write the response headers
// res.set(authResponse.headers);
// res.status(authResponse.status);

// send the response back
send(res,authResponse.status, await authResponse.text());
  
}
catch(error){
  console.log(error)
}

})

// app.use(createAuthMiddleware(
//    {
//   providers: [
//     GitHub({
//       clientId: "152e3f3a6657c099b274",
//       clientSecret: "7e0509e4b089f1c6789a2cca30657472cb7f6dfa",
//     }),
//   ],
//   secret: "ioiowqdioasiodad",
//   trustHost: true,
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60,
//   },
//   callbacks: {
//     async session({ session, token, user }) {
//       console.log("This was session called.");
//       return session;
//     },
//     async jwt({ token, account, profile }) {
//       console.log("This was jwt called.");
//       console.log(token)
//       return token;
//     },
//   },
// }
// ));






app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});



