# Pelican Velo WebSocket relay

The relay carries room messages between the course host and up to three guests. Rooms exist in memory for the life of the host’s connection. Guests can use available slots to join or rejoin an active ride and receive the host’s map, weather, and time of day.

```sh
npm ci --prefix server
npm start --prefix server
```

Select the WebSocket relay in the game and give every player the same server URL. Use `ws://localhost:8787` when running both the game and the relay on your computer.

For friends on other devices, use a `wss://` endpoint, such as `wss://relay.example.com`. Deploy this directory as a Node 20+ service using `npm ci` followed by `npm start`. The service uses the `PORT` environment variable when provided. Enable WebSocket upgrades in the hosting platform or reverse proxy and have it terminate TLS. `GET /healthz` returns HTTP 200. To prefill your deployed URL in the frontend, set `VITE_MULTIPLAYER_RELAY_URL=wss://relay.example.com` when building the site.

## WebRTC with TURN

The game's direct WebRTC mode uses the public PeerJS signaling service and PeerJS’s default ICE servers. If you need another TURN service, enter the TURN URL, username, and password issued by your provider in the game’s connection settings. Metered offers an account-based free option. Cloudflare Realtime supports short-lived TURN credentials. [Metered TURN quickstart](https://www.metered.ca/docs/turn-server-service/quickstart/) · [Cloudflare TURN credentials](https://developers.cloudflare.com/realtime/turn/generate-credentials/)
