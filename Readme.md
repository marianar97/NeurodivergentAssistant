# World Wild Web Hack Night
Hey, 
thanks for joining us for WWW & AI Hacknight! In this repo you'll find all the information you need to get started with the hack night. 

We recommend getting familiar with the stack already before the Hacknight as it helps to get started faster.

## Prerequisites
* Bring your own laptop
* Have Node.js and a JS package manager installed
* [A Cloudflare account](https://dash.cloudflare.com/login/) 
* [A Neon account](https://neon.tech/)
* [A Twillio account](https://login.twilio.com/u/signup)

## 💡 Tips/ Concepts:
* Hono comes with built- in and third-party [Middleware](https://hono.dev/docs/guides/middleware)
* Follow [Hono best practises](https://hono.dev/docs/guides/best-practices) for optimized development
* Cloudflare Bindings allow you to use external Cloudflare services from your application, for example
  * With the [Cloudflare AI binding](https://developers.cloudflare.com/workers-ai/configuration/bindings/) you can leverage different LLMs in your application.
  * The [R2 Binding](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/) allows you to use R2 (Object storage) in your application. 
* HONC is ideal for data APIs and lightweight backend services
  * Focus on backend functionality — you can demo the application using [Fiberplane's API Playground](https://fiberplane.com/docs/get-started/), already included and available at the `/fp` endpoint.
  * If you want to add a static frontend, Hono supports rendering [JSX](https://hono.dev/docs/guides/jsx). You can also use [Cloudflare Asset Bindings](https://developers.cloudflare.com/workers/static-assets/) to serve static files
  * Cloudflare provides a [Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/) ([an example](/examples/cloudflare-vite-plugin) is included in this repo).

## The Challenge
### Requirements
- Build any application using [HONC](https://honc.dev/): `npm create honc-app@latest`
- Use Neon as a database
- Include at least one [Cloudflare Binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/)
- Integrate at least one Twilio [API, SDK, or service](https://twilio.com/docs)
 
### Examples and Inspiration
Below are links to examples that meet most or all of the requirements of this challenge. They include the example shown in the intro and one using Cloudflare's Vite plugin with React:
- This repo – examples are included in the [examples/ folder](/examples)
- [Official Honc Examples](https://github.com/fiberplane/create-honc-app/tree/main/examples)
- [Awesome Honc list](https://github.com/fiberplane/awesome-honc)

## Evaluation criteria
- Extra points for deployed apps & shared GitHub Repo
- Live demos are preferred over presentation slides
- Nothing to demo? Don't worry - you can also share your code and learnings from the evening. We have a special learning award!

## Submission
If you'd like to present, fill out [this form](https://forms.gle/BPZWbHzzZ3prjsZL7)

Every group that wants to present will join a Google Call. This way we don't have to switch computers. 

We will share the Google Call invite with you closer to the end of the event. 
