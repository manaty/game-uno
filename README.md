[▶ Play online — no installation](https://play.retro-museum.net/g/uno)

# UNO · Color party

Play UNO · Color party together on a shared screen, using phones as controllers. 2–7 players.

An independent, open-source Manaty game for 2–7 players. English, French and Tagalog. No Retro Museum installation or account is required to run it.

## Solo with robots

With a bot-capable Retro Museum SDK host, **Play solo** creates a room with one
human and the required robot opponent. The organiser can add or remove robots
within the game's player limit and choose Easy, Medium or Hard separately for
each one before starting. The complete player view opens on a single device;
no additional screen or QR scan is needed. Bot support requires the updated SDK;
the repository's pinned older SDK must be updated for a standalone release.

Easy plays a random legal card. Medium plans its colors and declares UNO. Hard
also prioritizes blocking the next player when they are close to finishing.
Robots see only their own hand and the public game state. The normal server
rules validate every draw, card, wild color and UNO action.

## Play on your own server

```sh
npm ci
npm run build
npm start
```

Open [localhost:4311](http://localhost:4311), click **Play now**, and scan the displayed QR with each phone. On Wi-Fi, set `PUBLIC_ORIGIN` to the computer's reachable address, such as `http://192.168.1.10:4311`. In production use its HTTPS origin. `PORT` and `DATA_DIR` are configurable.

The room organiser can start, pause and end the game; players can replay. Profiles, cropped avatars and phone language are saved in the browser. Late arrivals play in the next match. Game logic is authoritative on the server, and private roles/cards never appear on the shared display.

## Development

```sh
npm run build
npm test
```

The runtime and room transport come from the [Retro Museum SDK](https://github.com/manaty/retro-museum-sdk). This repository owns its engine, interface, compiled package and tests.

## Licence

Original code and assets: Manaty, MIT. This project is an independent game implementation and is not affiliated with any commercial game publisher.
